"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { DayItinerary, Activity, SavedPlace } from "@/lib/trip-data";
import { ActivityCard } from "@/components/activity-card";
import { AddActivityModal } from "@/components/add-activity-modal";
import { EditActivityModal } from "@/components/edit-activity-modal";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Snowflake } from "lucide-react";

// Hero images for each destination
// To use real photos: save as /public/heroes/copenhagen.png and /public/heroes/iceland.png
const heroImages: Record<string, string> = {
  copenhagen: "/heroes/copenhagen.png",
  reykjavik: "/heroes/iceland.png",
};

interface DayViewProps {
  day: DayItinerary;
  dayIndex: number;
  allDays: DayItinerary[];
  onSwapActivity: (dayIndex: number, activityId: string, newActivity: Activity) => void;
  onRemoveActivity: (dayIndex: number, activityId: string) => void;
  onAddActivity: (dayIndex: number, activity: Activity) => void;
  onEditActivity: (dayIndex: number, activityId: string, updatedActivity: Activity, moveToDayIndex?: number) => void;
  alternatives: Activity[];
  savedPlaces: SavedPlace[];
}

export function DayView({
  day,
  dayIndex,
  allDays,
  onSwapActivity,
  onRemoveActivity,
  onAddActivity,
  onEditActivity,
  alternatives,
  savedPlaces,
}: DayViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const isCopenhagen = day.destination === "copenhagen";

  const formatDate = (dateStr: string) => {
    // Parse date as local date to avoid timezone issues
    // dateStr format: "YYYY-MM-DD"
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const heroImage = heroImages[day.destination] || heroImages.copenhagen;

  return (
    <div className="space-y-4">
      {/* Hero Day Header */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={isCopenhagen ? "Copenhagen" : "Iceland"}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay */}
          <div
            className={cn(
              "absolute inset-0",
              isCopenhagen
                ? "bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                : "bg-gradient-to-t from-black/70 via-black/30 to-transparent"
            )}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 pt-12 pb-6">
          {/* Top badges */}
          <div className="flex items-center gap-2 mb-3">
            <div className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white">
              <MapPin className="w-3.5 h-3.5" />
              {isCopenhagen ? "Copenhagen" : "Reykjavik"}
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
              <Snowflake className="w-3.5 h-3.5" />
              Winter
            </div>
          </div>

          {/* Day number and title */}
          <div className="flex items-end justify-between gap-4">
            <div>
              {day.dayNumber !== undefined && (
                <p className="text-white/80 text-sm font-medium mb-1">Day {day.dayNumber}</p>
              )}
              <h2 className="text-2xl font-bold text-white leading-tight">
                {day.title}
              </h2>
              <p className="text-white/70 text-sm mt-1">{formatDate(day.date)}</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 rounded-xl h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Activities Timeline */}
      <div className="space-y-3">
        {day.activities.map((activity, index) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            index={index}
            destination={day.destination}
            onSwap={(newActivity) => onSwapActivity(dayIndex, activity.id, newActivity)}
            onRemove={() => onRemoveActivity(dayIndex, activity.id)}
            onEdit={() => setEditingActivity(activity)}
            alternatives={alternatives}
            savedPlaces={savedPlaces}
          />
        ))}
      </div>

      {day.activities.length === 0 && (
        <div className="bg-card rounded-xl p-8 border border-dashed border-border text-center">
          <p className="text-muted-foreground mb-3">No activities planned for this day</p>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Activity
          </Button>
        </div>
      )}

      <AddActivityModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={(activity) => {
          onAddActivity(dayIndex, activity);
          setShowAddModal(false);
        }}
        destination={day.destination}
        alternatives={alternatives}
        savedPlaces={savedPlaces}
      />

      <EditActivityModal
        open={!!editingActivity}
        onOpenChange={(open) => !open && setEditingActivity(null)}
        activity={editingActivity}
        currentDayIndex={dayIndex}
        days={allDays}
        destination={day.destination}
        onSave={(updatedActivity, moveToDayIndex) => {
          if (editingActivity) {
            onEditActivity(dayIndex, editingActivity.id, updatedActivity, moveToDayIndex);
          }
          setEditingActivity(null);
        }}
      />
    </div>
  );
}
