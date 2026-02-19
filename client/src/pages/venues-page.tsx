import { Link } from "wouter";
import { useVenues } from "@/hooks/use-venues";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isVenueOpen } from "@/lib/time";
import { MapPin, Users, ArrowRight, Loader2, Building2 } from "lucide-react";



export default function VenuesPage() {
  const { data: venues, isLoading } = useVenues();


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
      <div className="container py-10 px-4 md:px-8 mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground">Available Venues</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Find and reserve your perfect spot across campus. View real-time availability and book instantly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {venues?.map((venue) => {
            const isOpen = isVenueOpen(venue.openTime, venue.closeTime)

            const badgeColor = isOpen
              ? "bg-green-500/90 text-white border-green-400"
              : "bg-red-500/90 text-white border-red-400"

            return (
              <Link key={venue.id} href={`/venues/${venue.id}`}>
                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 overflow-hidden">
                  <div className="relative h-48 w-full bg-muted overflow-hidden">
                    {venue.imageUrl ? (
                      <img
                        src={venue.imageUrl}
                        alt={venue.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <Building2 className="h-16 w-16 text-primary/20" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                    <div className="absolute bottom-4 left-4 text-white">
                      <Badge
                        className={`mb-2 backdrop-blur-md border ${badgeColor}`}
                      >
                        {isOpen ? "Open" : "Closed"}{" "}
                        {venue.openTime} - {venue.closeTime}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="font-display text-xl">{venue.name}</span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {venue.location}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {venue.description || "A great place to work and study."}
                    </p>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Capacity: {venue.capacity}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:text-primary group-hover:translate-x-1 transition-all"
                    >
                      View Seats <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            )
          })}
        </div>


        {venues?.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border px-6 mt-8">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No venues found</h3>
            <p className="text-muted-foreground">Check back later for new locations.</p>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
