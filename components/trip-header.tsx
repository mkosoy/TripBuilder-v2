"use client";

import { MapPin, Plane, Calendar } from "lucide-react";
import { ProfileSelector } from "@/components/profile-selector";
import type { Traveler } from "@/lib/trip-data";

interface TripHeaderProps {
  travelers: Traveler[];
  currentUserId: string;
  onSelectUser: (userId: string) => void;
  onUpdateAvatar: (userId: string, avatarUrl: string) => void;
}

export function TripHeader({
  travelers,
  currentUserId,
  onSelectUser,
  onUpdateAvatar,
}: TripHeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-copenhagen flex items-center justify-center">
                <Plane className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Nordic Winter Trip</h1>
                <p className="text-sm text-muted-foreground">Feb 7 - 18, 2026</p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-copenhagen" />
              <span className="text-foreground">Copenhagen</span>
              <span className="text-muted-foreground">3 nights</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-iceland" />
              <span className="text-foreground">Reykjavik</span>
              <span className="text-muted-foreground">8 nights</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>12 days</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>2 cities</span>
              </div>
            </div>
            <ProfileSelector
              travelers={travelers}
              currentUserId={currentUserId}
              onSelectUser={onSelectUser}
              onUpdateAvatar={onUpdateAvatar}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
