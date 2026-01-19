"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Flight, Activity, DayItinerary } from "@/lib/trip-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Utensils, MapPin, Trash2, Eye } from "lucide-react";

interface BookingsPanelProps {
  flights: Flight[];
  days: DayItinerary[];
  currentUserId: string;
  onDeleteFlight: (flightId: string) => void;
  onDeleteActivity: (activityId: string) => void;
  onViewInItinerary: (dayIndex: number) => void;
}

interface BookingItem {
  id: string;
  type: "flight" | "restaurant" | "tour";
  name: string;
  date: string;
  time?: string;
  dayNumber?: number;
  dayIndex: number;
  icon: typeof Plane;
  color: string;
}

export function BookingsPanel({
  flights,
  days,
  currentUserId,
  onDeleteFlight,
  onDeleteActivity,
  onViewInItinerary,
}: BookingsPanelProps) {
  // Collect all user-specific bookings
  const userBookings = useMemo(() => {
    const bookings: BookingItem[] = [];

    // Add flights where user is a traveler
    flights.forEach((flight) => {
      if (flight.travelers && flight.travelers.includes(currentUserId)) {
        bookings.push({
          id: flight.id,
          type: "flight",
          name: `${flight.fromCode} → ${flight.toCode}`,
          date: flight.date,
          time: flight.departureTime,
          dayNumber: undefined,
          dayIndex: -1, // Flights aren't tied to a specific day view
          icon: Plane,
          color: "text-flight",
        });
      }
    });

    // Add restaurant and tour bookings where user is an attendee
    days.forEach((day, dayIndex) => {
      day.activities.forEach((activity) => {
        if (
          activity.isBooked &&
          activity.attendees &&
          activity.attendees.includes(currentUserId) &&
          (activity.type === "food" || activity.type === "tour")
        ) {
          bookings.push({
            id: activity.id,
            type: activity.type === "food" ? "restaurant" : "tour",
            name: activity.name,
            date: day.date,
            time: activity.time,
            dayNumber: day.dayNumber,
            dayIndex,
            icon: activity.type === "food" ? Utensils : MapPin,
            color: activity.type === "food" ? "text-primary" : "text-accent",
          });
        }
      });
    });

    // Sort by date, then time
    bookings.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      if (!a.time || !b.time) return 0;
      return a.time.localeCompare(b.time);
    });

    return bookings;
  }, [flights, days, currentUserId]);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = (booking: BookingItem) => {
    if (confirm(`Delete ${booking.name}?`)) {
      if (booking.type === "flight") {
        onDeleteFlight(booking.id);
      } else {
        onDeleteActivity(booking.id);
      }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">My Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {userBookings.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No bookings yet. Upload confirmations to see them here.
          </div>
        ) : (
          <div className="space-y-2">
            {userBookings.map((booking) => {
              const Icon = booking.icon;
              return (
                <div
                  key={booking.id}
                  className="p-4 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", booking.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm">
                        {booking.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(booking.date)}
                        {booking.time && ` • ${booking.time}`}
                        {booking.dayNumber !== undefined && (
                          <span className="ml-1">• Day {booking.dayNumber}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {booking.dayIndex >= 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewInItinerary(booking.dayIndex)}
                          className="h-10 w-10 p-0 rounded-xl"
                          title="View in itinerary"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(booking)}
                        className="h-10 w-10 p-0 rounded-xl hover:text-destructive"
                        title="Delete booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
