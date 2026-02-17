import { useMyActiveReservations, useCancelReservation } from "@/hooks/use-reservations";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarX, Clock, MapPin, Ticket } from "lucide-react";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

function Countdown({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s remaining`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return <span className="font-mono font-medium text-primary">{timeLeft}</span>;
}

export default function ReservationsPage() {
  const { data: reservations, isLoading } = useMyActiveReservations();
  const cancelReservation = useCancelReservation();
  const { toast } = useToast();

  const handleCancel = (id: string) => {
    cancelReservation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Reservation cancelled", description: "Your seat has been released." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="container py-10 px-4 md:px-8 mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-display">My Reservations</h1>
          <p className="text-muted-foreground mt-2">
            Manage your active bookings and track remaining time.
          </p>
        </div>

        {reservations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border px-6 mt-4">
            <Ticket className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No active reservations</h3>
            <p className="text-muted-foreground">You don't have any upcoming bookings.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reservations?.map((res) => (
              <Card key={res.id} className="overflow-hidden border-l-4 border-l-primary shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-display">{res.venueName}</CardTitle>
                      <div className="flex items-center text-muted-foreground mt-1 text-sm">
                        <MapPin className="w-3 h-3 mr-1" /> Seat {res.seatRow}{res.seatCol}
                      </div>
                    </div>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                      Active
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Start Time</span>
                      <span className="font-medium">{format(new Date(res.startTime), "h:mm a")}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Duration</span>
                      <span className="font-medium">{res.durationMinutes} min</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                      <Countdown endTime={res.endTime as unknown as string} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 pt-4 flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(res.id)}
                    disabled={cancelReservation.isPending}
                    className="hover:bg-red-600"
                  >
                    {cancelReservation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CalendarX className="w-4 h-4 mr-2" />}
                    Cancel Reservation
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
