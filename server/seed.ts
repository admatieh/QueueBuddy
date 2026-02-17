import { connectMongo } from "./db/mongo";
import { UserModel } from "./models/User";
import { VenueModel } from "./models/Venue";
import { SeatModel } from "./models/Seat";
import mongoose from "mongoose";

async function seed() {
    await connectMongo();

    // Idempotent: check if data exists
    const venueCount = await VenueModel.countDocuments();
    if (venueCount > 0) {
        console.log("Database already has venues, skipping seed.");
        process.exit(0);
    }

    console.log("Seeding database...");

    // Create Venue
    const venue = await VenueModel.create({
        name: "TechHub Co-working",
        location: "Downtown San Francisco",
        description: "Premium workspace with high-speed wifi and coffee.",
        capacity: 20,
        openTime: "08:00",
        closeTime: "22:00",
    });

    // Create Seats (Grid 4x5)
    const rows = ["A", "B", "C", "D"];
    const seats = [];
    for (let r = 0; r < rows.length; r++) {
        for (let c = 1; c <= 5; c++) {
            seats.push({
                venueId: venue._id,
                row: rows[r],
                col: String(c),
                type: r === 0 ? "premium" : "standard",
                status: "available",
            });
        }
    }
    await SeatModel.insertMany(seats);

    console.log("✅ Seeding complete!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
