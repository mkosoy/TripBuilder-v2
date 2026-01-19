"use client";

import React from "react"

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Activity, Destination, SavedPlace, ActivityType } from "@/lib/trip-data";

// Helper to format time for display (converts 24-hour to 12-hour format)
function formatTimeForDisplay(timeStr: string | undefined): string {
  if (!timeStr) return "";

  // If already in 12-hour format (contains AM/PM), return as-is
  if (timeStr.match(/AM|PM/i)) return timeStr;

  // Convert 24-hour to 12-hour format
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? 'PM' : 'AM';

    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;

    return `${hours}:${minutes} ${period}`;
  }

  return timeStr; // Return as-is if format not recognized
}
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  MapPin,
  ExternalLink,
  MoreVertical,
  RefreshCw,
  Trash2,
  Star,
  UtensilsCrossed,
  Camera,
  Compass,
  Plane,
  Home,
  Wine,
  ShoppingBag,
  Sparkles,
  Mountain,
  DollarSign,
  Pencil,
  CheckCircle2,
} from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  index: number;
  destination: Destination;
  onSwap: (newActivity: Activity) => void;
  onRemove: () => void;
  onEdit: () => void;
  alternatives: Activity[];
  savedPlaces: SavedPlace[];
}

const activityIcons: Record<ActivityType, React.ElementType> = {
  food: UtensilsCrossed,
  attraction: Camera,
  tour: Compass,
  transport: Plane,
  accommodation: Home,
  nightlife: Wine,
  shopping: ShoppingBag,
  relaxation: Sparkles,
  nature: Mountain,
};

const activityColors: Record<ActivityType, string> = {
  food: "bg-amber-100 text-amber-700",
  attraction: "bg-blue-100 text-blue-700",
  tour: "bg-green-100 text-green-700",
  transport: "bg-slate-100 text-slate-700",
  accommodation: "bg-rose-100 text-rose-700",
  nightlife: "bg-indigo-100 text-indigo-700",
  shopping: "bg-pink-100 text-pink-700",
  relaxation: "bg-cyan-100 text-cyan-700",
  nature: "bg-emerald-100 text-emerald-700",
};

export function ActivityCard({
  activity,
  destination,
  onSwap,
  onRemove,
  onEdit,
  alternatives,
  savedPlaces,
}: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = activityIcons[activity.type];
  const colorClass = activityColors[activity.type];
  const isCopenhagen = destination === "copenhagen";

  const relevantSaved = savedPlaces.filter((p) => {
    if (activity.type === "food") return p.category === "restaurant" || p.category === "cafe";
    if (activity.type === "nightlife") return p.category === "bar";
    return false;
  });

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all",
        activity.isMustDo && "ring-2 ring-offset-2",
        activity.isMustDo && (isCopenhagen ? "ring-copenhagen/50" : "ring-iceland/50")
      )}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", colorClass)}>
            <Icon className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base text-foreground">{activity.name}</h3>
                  {activity.isMustDo && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        isCopenhagen
                          ? "bg-copenhagen/10 text-copenhagen"
                          : "bg-iceland/10 text-iceland"
                      )}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      Must Do
                    </span>
                  )}
                  {activity.isBooked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                      <CheckCircle2 className="w-3 h-3" />
                      Booked
                    </span>
                  )}
                </div>

                {/* Time & Duration */}
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {activity.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimeForDisplay(activity.time)}
                    </span>
                  )}
                  {activity.duration && (
                    <span className="text-muted-foreground/70">({activity.duration})</span>
                  )}
                  {activity.priceRange && (
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: activity.priceRange.length }).map((_, i) => (
                        <DollarSign key={i} className="w-3 h-3" />
                      ))}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0 h-11 w-11 rounded-xl">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Activity
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {alternatives.length > 0 && (
                    <>
                      <DropdownMenuLabel>Swap with alternative</DropdownMenuLabel>
                      {alternatives.slice(0, 3).map((alt) => (
                        <DropdownMenuItem key={alt.id} onClick={() => onSwap(alt)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {alt.name}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {relevantSaved.length > 0 && (
                    <>
                      <DropdownMenuLabel>Swap with saved place</DropdownMenuLabel>
                      {relevantSaved.slice(0, 3).map((place) => (
                        <DropdownMenuItem
                          key={place.id}
                          onClick={() =>
                            onSwap({
                              id: `from-saved-${Date.now()}`,
                              name: place.name,
                              type: place.type,
                              description: place.description || "",
                              priceRange: place.priceRange,
                              bookingUrl: place.bookingUrl,
                            })
                          }
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {place.name}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={onRemove} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            <p
              className={cn(
                "text-sm text-muted-foreground mt-2 leading-relaxed",
                !isExpanded && "line-clamp-2"
              )}
            >
              {activity.description}
            </p>
            {activity.description.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-primary hover:underline mt-1"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}

            {/* Address & Booking */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {activity.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(activity.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="underline-offset-2 hover:underline">{activity.address}</span>
                </a>
              )}
              {activity.bookingUrl && (
                <a
                  href={activity.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    isCopenhagen
                      ? "bg-copenhagen/10 text-copenhagen hover:bg-copenhagen/20"
                      : "bg-iceland/10 text-iceland hover:bg-iceland/20"
                  )}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Book / More Info
                </a>
              )}
            </div>

            {/* Notes */}
            {activity.notes && (
              <p className="text-xs text-muted-foreground mt-2 italic">{activity.notes}</p>
            )}

            {/* Screenshot */}
            {activity.screenshotUrl && (
              <div className="mt-3">
                <img
                  src={activity.screenshotUrl}
                  alt="Booking confirmation"
                  className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(activity.screenshotUrl, '_blank')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
