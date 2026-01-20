"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  UtensilsCrossed,
  MapPin,
  Calendar,
  Star,
  Upload,
  ExternalLink,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import type {
  Traveler,
  Flight,
  Activity,
  MustDoItem,
  DayItinerary,
} from "@/lib/trip-data";

interface ProfilePageProps {
  traveler: Traveler;
  flights: Flight[];
  activities: Activity[];
  mustDos: MustDoItem[];
  days: DayItinerary[];
  onUploadClick: () => void;
  onDeleteFlight?: (flightId: string) => void;
  onDeleteActivity?: (activityId: string) => void;
}

export function ProfilePage({
  traveler,
  flights,
  activities,
  mustDos,
  days,
  onUploadClick,
  onDeleteFlight,
  onDeleteActivity,
}: ProfilePageProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Filter bookings for this traveler
  const myFlights = flights.filter((f) => f.travelers?.includes(traveler.id));
  const myActivities = activities.filter((a) => a.attendees?.includes(traveler.id));
  const myMustDos = mustDos.filter((m) => m.travelerId === traveler.id);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {traveler.avatar && traveler.avatar.startsWith('data:') ? (
                <img
                  src={traveler.avatar}
                  alt={traveler.name}
                  className="aspect-square size-full object-cover rounded-full"
                />
              ) : (
                <AvatarImage src={traveler.avatar || "/placeholder.svg"} alt={traveler.name} />
              )}
              <AvatarFallback
                className="text-white text-xl font-medium"
                style={{ backgroundColor: traveler.color }}
              >
                {getInitials(traveler.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{traveler.name}'s Trip</h2>
              <p className="text-muted-foreground">Copenhagen & Reykjavik • Feb 7-18, 2026</p>
            </div>
            <Button onClick={onUploadClick}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Booking
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Plane className="w-8 h-8 mb-2 text-flight" />
              <div className="text-2xl font-bold">{myFlights.length}</div>
              <div className="text-xs text-muted-foreground">Flights</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <UtensilsCrossed className="w-8 h-8 mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {myActivities.filter((a) => a.type === "food").length}
              </div>
              <div className="text-xs text-muted-foreground">Reservations</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Star className="w-8 h-8 mb-2 text-accent" />
              <div className="text-2xl font-bold">{myMustDos.length}</div>
              <div className="text-xs text-muted-foreground">Must-Dos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="w-8 h-8 mb-2 text-success" />
              <div className="text-2xl font-bold">
                {myActivities.filter((a) => a.isBooked).length}
              </div>
              <div className="text-xs text-muted-foreground">Confirmed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Flights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            My Flights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myFlights.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No flights booked yet. Upload your flight confirmation!
            </p>
          ) : (
            <div className="space-y-3">
              {myFlights.map((flight) => (
                <div
                  key={flight.id}
                  className="p-3 rounded-lg border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span>{flight.fromCode}</span>
                        <span className="text-muted-foreground">→</span>
                        <span>{flight.toCode}</span>
                        {flight.airline && (
                          <Badge variant="secondary" className="ml-2">
                            {flight.airline} {flight.flightNumber}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(flight.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {flight.departureTime}
                        {flight.confirmationNumber && ` • ${flight.confirmationNumber}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {flight.screenshotUrl && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={flight.screenshotUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {onDeleteFlight && flight.isPersonal && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteFlight(flight.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            My Reservations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No reservations yet. Upload your booking confirmations!
            </p>
          ) : (
            <div className="space-y-3">
              {myActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-3 rounded-lg border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{activity.name}</span>
                        {activity.isBooked && (
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Confirmed
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {activity.time && `${activity.time}`}
                        {activity.confirmationNumber && ` • ${activity.confirmationNumber}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {activity.screenshotUrl && (
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={activity.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {onDeleteActivity && activity.screenshotUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteActivity(activity.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {activity.screenshotUrl && (
                    <div className="mt-2">
                      <img
                        src={activity.screenshotUrl}
                        alt="Booking confirmation"
                        className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(activity.screenshotUrl, '_blank')}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Must-Dos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            My Must-Do List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myMustDos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No must-dos yet. Add some from the Travel Squad section!
            </p>
          ) : (
            <div className="space-y-2">
              {myMustDos.map((mustDo) => (
                <div
                  key={mustDo.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{mustDo.name}</span>
                      {mustDo.addedToItinerary && (
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          Added to Itinerary
                        </Badge>
                      )}
                    </div>
                    {mustDo.description && (
                      <p className="text-xs text-muted-foreground mt-1">{mustDo.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {mustDo.votes.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
