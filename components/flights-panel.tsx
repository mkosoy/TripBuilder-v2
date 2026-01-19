"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Flight, Hotel } from "@/lib/trip-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Hotel as HotelIcon, ArrowRight, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { EditHotelModal } from "@/components/edit-hotel-modal";

interface FlightsPanelProps {
  flights: Flight[];
  hotels: Hotel[];
  onEditHotel?: (destination: "copenhagen" | "reykjavik", updatedHotel: Hotel) => void;
  onDeleteFlight?: (flightId: string) => void;
}

export function FlightsPanel({ flights, hotels, onEditHotel, onDeleteFlight }: FlightsPanelProps) {
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Flights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plane className="w-4 h-4 text-flight" />
            Flights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {flights.map((flight, index) => (
            <div
              key={flight.id}
              className={cn(
                "p-3 rounded-lg bg-muted/50 border border-border",
                index === 0 && "border-l-4 border-l-copenhagen",
                index === 1 && "border-l-4 border-l-iceland",
                index > 1 && "border-l-4 border-l-flight"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-xs text-muted-foreground">
                  {formatDate(flight.date)}
                </div>
                {onDeleteFlight && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete flight ${flight.fromCode} → ${flight.toCode}?`)) {
                        onDeleteFlight(flight.id);
                      }
                    }}
                    className="h-6 w-6 p-0 hover:text-destructive flex-shrink-0"
                    title="Delete flight"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <div className="font-mono font-bold text-foreground">{flight.fromCode}</div>
                  <div className="text-xs text-muted-foreground">{flight.departureTime}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="text-center">
                  <div className="font-mono font-bold text-foreground">{flight.toCode}</div>
                  <div className="text-xs text-muted-foreground">{flight.arrivalTime}</div>
                </div>
              </div>
              {flight.airline && (
                <div className="text-xs text-muted-foreground mt-2">{flight.airline}</div>
              )}
              {flight.notes && (
                <div className="text-xs text-muted-foreground mt-1 italic">{flight.notes}</div>
              )}
              {flight.screenshotUrl && (
                <div className="mt-2">
                  <img
                    src={flight.screenshotUrl}
                    alt="Flight confirmation"
                    className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(flight.screenshotUrl, '_blank')}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hotels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HotelIcon className="w-4 h-4 text-primary" />
            Accommodation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hotels.map((hotel) => (
            <div
              key={`${hotel.name}-${hotel.destination}`}
              className={cn(
                "p-3 rounded-lg bg-muted/50 border border-border",
                "border-l-4",
                hotel.destination === "copenhagen" ? "border-l-copenhagen" : "border-l-iceland"
              )}
            >
              <div
                className={cn(
                  "text-xs font-medium mb-1",
                  hotel.destination === "copenhagen" ? "text-copenhagen" : "text-iceland"
                )}
              >
                {hotel.destination === "copenhagen" ? "Copenhagen" : "Reykjavik"}
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{hotel.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{hotel.address}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(hotel.checkIn)} - {formatDate(hotel.checkOut)}
                  </div>
                </div>
                {onEditHotel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingHotel(hotel)}
                    className="h-10 w-10 p-0 flex-shrink-0 rounded-xl"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {hotel.amenities && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {hotel.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
              {hotel.bookingUrl && (
                <a
                  href={hotel.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Hotel
                </a>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {editingHotel && onEditHotel && (
        <EditHotelModal
          open={!!editingHotel}
          onOpenChange={(open) => !open && setEditingHotel(null)}
          hotel={editingHotel}
          onSave={(updatedHotel) => {
            onEditHotel(editingHotel.destination, updatedHotel);
            setEditingHotel(null);
          }}
        />
      )}
    </div>
  );
}
