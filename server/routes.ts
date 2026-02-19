import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { upload } from "./upload";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === HEALTH ===
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Set up authentication (passport)
  setupAuth(app);

  // === VENUES ===
  app.get(api.venues.list.path, async (req, res) => {
    const venues = await storage.getVenues();
    res.json(venues);
  });

  app.get(api.venues.get.path, async (req, res) => {
    const venue = await storage.getVenue(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }
    res.json(venue);
  });

  app.get(api.venues.getSeats.path, async (req, res) => {
    const venueId = req.params.id;
    const seats = await storage.getSeats(venueId);

    // Check reservation status for each seat
    const now = new Date();
    const activeReservations = await storage.getReservationsByVenue(venueId);

    const seatsWithStatus = seats.map(seat => {
      const activeRes = activeReservations.find(r =>
        r.seatId === seat.id &&
        r.status === "active" &&
        new Date(r.endTime) > now
      );

      return {
        ...seat,
        isReserved: !!activeRes,
        reservedUntil: activeRes ? activeRes.endTime : null,
        status: activeRes ? "occupied" : seat.status,
      };
    });

    res.json({
      seats: seatsWithStatus,
      serverTime: new Date().toISOString(),
    });
  });

  // === RESERVATIONS ===
  app.post(api.reservations.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const input = api.reservations.create.input.parse(req.body);
      const user = req.user as any;

      // 1. Check if seat exists
      const seat = await storage.getSeat(input.seatId);
      if (!seat || seat.venueId !== input.venueId) {
        return res.status(404).json({ message: "Seat not found" });
      }

      // 2. Check if seat is available
      const existingRes = await storage.getActiveReservationForSeat(input.seatId);
      if (existingRes || seat.status !== "available") {
        return res.status(409).json({ message: "Seat is already reserved or unavailable" });
      }

      // 3. Create reservation
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + input.durationMinutes * 60000);

      const reservation = await storage.createReservation({
        userId: user.id,
        venueId: input.venueId,
        seatId: input.seatId,
        durationMinutes: input.durationMinutes,
        endTime,
      });

      res.status(201).json(reservation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.reservations.listActive.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as any;
    const reservations = await storage.getActiveReservationsByUser(user.id);
    res.json(reservations);
  });

  app.post(api.reservations.cancel.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as any;
    const resId = req.params.id;

    // Verify ownership
    const active = await storage.getActiveReservationsByUser(user.id);
    const target = active.find(r => r.id === resId);

    if (!target) {
      return res.status(404).json({ message: "Reservation not found or access denied" });
    }

    const cancelled = await storage.cancelReservation(resId);
    res.json(cancelled);
  });

  // === ADMIN ===
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ message: "Admin access required" });
    }
    next();
  };

  app.post(api.admin.createVenue.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.createVenue.input.parse(req.body);
      const venue = await storage.createVenue(input);
      res.status(201).json(venue);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.admin.updateVenue.path, requireAdmin, async (req, res) => {
    const venueId = req.params.id;
    const input = api.admin.updateVenue.input.parse(req.body);
    const updated = await storage.updateVenue(venueId, input);
    res.json(updated);
  });

  app.post(api.admin.createSeat.path, requireAdmin, async (req, res) => {
    const venueId = req.params.id;
    const input = api.admin.createSeat.input.parse(req.body);
    const seat = await storage.createSeat({ ...input, venueId });
    res.status(201).json(seat);
  });

  app.put(api.admin.updateSeat.path, requireAdmin, async (req, res) => {
    const seatId = req.params.id;
    const input = api.admin.updateSeat.input.parse(req.body);
    const updated = await storage.updateSeat(seatId, input);
    res.json(updated);
  });

  app.get(api.admin.listReservations.path, requireAdmin, async (req, res) => {
    const venueId = req.params.id;
    const reservations = await storage.getReservationsByVenue(venueId);
    res.json(reservations);
  });

  app.post(api.admin.cancelReservation.path, requireAdmin, async (req, res) => {
    const resId = req.params.id;
    const cancelled = await storage.cancelReservation(resId);
    if (!cancelled) return res.status(404).json({ message: "Reservation not found" });
    res.json(cancelled);
  });

  // === VENUE IMAGE UPLOAD ===
  app.post(api.admin.uploadVenueImage.path, requireAdmin, (req, res, next) => {
    upload.single("image")(req, res, async (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
          }
          return res.status(400).json({ message: err.message });
        }
        // Custom file filter error
        return res.status(400).json({ message: err.message || "Invalid file" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      try {
        const venueId = req.params.id;
        const venue = await storage.getVenue(venueId);
        if (!venue) {
          // Clean up uploaded file if venue doesn't exist
          const fs = await import("fs");
          fs.unlinkSync(req.file.path);
          return res.status(404).json({ message: "Venue not found" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        await storage.updateVenue(venueId, { imageUrl });

        res.json({ imageUrl });
      } catch (error) {
        next(error);
      }
    });
  });

  return httpServer;
}
