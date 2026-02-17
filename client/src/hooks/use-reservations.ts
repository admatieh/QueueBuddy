import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useVenueSeats(venueId: string) {
  return useQuery({
    queryKey: [api.venues.getSeats.path, venueId],
    queryFn: async () => {
      const url = buildUrl(api.venues.getSeats.path, { id: venueId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch seats");
      return api.venues.getSeats.responses[200].parse(await res.json());
    },
    enabled: !!venueId,
    refetchInterval: 5000, // Poll every 5s
  });
}

export function useMyActiveReservations() {
  return useQuery({
    queryKey: [api.reservations.listActive.path],
    queryFn: async () => {
      const res = await fetch(api.reservations.listActive.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch reservations");
      return api.reservations.listActive.responses[200].parse(await res.json());
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { venueId: string; seatId: string; durationMinutes: number }) => {
      const res = await fetch(api.reservations.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, durationMinutes: data.durationMinutes.toString() as any }),
      });

      if (!res.ok) {
        if (res.status === 409) throw new Error("Seat already reserved");
        throw new Error("Failed to create reservation");
      }
      return api.reservations.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.venues.getSeats.path, variables.venueId] });
      queryClient.invalidateQueries({ queryKey: [api.reservations.listActive.path] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.reservations.cancel.path, { id });
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel reservation");
      return api.reservations.cancel.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reservations.listActive.path] });
      // We ideally want to invalidate the specific venue seats too, but might not have ID handy
      // A full app would handle this via optimistic updates or more granular invalidation
    },
  });
}
