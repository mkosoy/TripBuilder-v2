"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Activity, Destination, DayItinerary, ActivityType } from "@/lib/trip-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Calendar } from "lucide-react";

interface EditActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  currentDayIndex: number;
  days: DayItinerary[];
  destination: Destination;
  onSave: (activity: Activity, moveToDayIndex?: number) => void;
}

const activityTypes: { value: ActivityType; label: string }[] = [
  { value: "food", label: "Food & Drink" },
  { value: "attraction", label: "Attraction" },
  { value: "tour", label: "Tour" },
  { value: "transport", label: "Transport" },
  { value: "accommodation", label: "Accommodation" },
  { value: "nightlife", label: "Nightlife" },
  { value: "shopping", label: "Shopping" },
  { value: "relaxation", label: "Relaxation" },
  { value: "nature", label: "Nature" },
];

export function EditActivityModal({
  open,
  onOpenChange,
  activity,
  currentDayIndex,
  days,
  destination,
  onSave,
}: EditActivityModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    type: ActivityType;
    time: string;
    duration: string;
    description: string;
    address: string;
    bookingUrl: string;
    notes: string;
    priceRange: "" | "$" | "$$" | "$$$" | "$$$$";
    isMustDo: boolean;
    isBooked: boolean;
  }>({
    name: "",
    type: "food",
    time: "",
    duration: "",
    description: "",
    address: "",
    bookingUrl: "",
    notes: "",
    priceRange: "", // Default value is not an empty string
    isMustDo: false,
    isBooked: false,
  });

  const [targetDayIndex, setTargetDayIndex] = useState(currentDayIndex);

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name,
        type: activity.type,
        time: activity.time || "",
        duration: activity.duration || "",
        description: activity.description,
        address: activity.address || "",
        bookingUrl: activity.bookingUrl || "",
        notes: activity.notes || "",
        priceRange: activity.priceRange || "", // Default value is not an empty string
        isMustDo: activity.isMustDo || false,
        isBooked: activity.isBooked || false,
      });
      setTargetDayIndex(currentDayIndex);
    }
  }, [activity, currentDayIndex]);

  const isCopenhagen = destination === "copenhagen";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || !formData.name.trim()) return;

    const updatedActivity: Activity = {
      ...activity,
      name: formData.name,
      type: formData.type,
      time: formData.time || undefined,
      duration: formData.duration || undefined,
      description: formData.description,
      address: formData.address || undefined,
      bookingUrl: formData.bookingUrl || undefined,
      notes: formData.notes || undefined,
      priceRange: formData.priceRange || undefined,
      isMustDo: formData.isMustDo,
      isBooked: formData.isBooked,
    };

    onSave(
      updatedActivity,
      targetDayIndex !== currentDayIndex ? targetDayIndex : undefined
    );
    onOpenChange(false);
  };

  // Filter days to only show those matching the current destination
  const availableDays = days.map((day, index) => ({
    day,
    index,
  })).filter(({ day }) => day.destination === destination);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Dinner at Noma"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: ActivityType) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input
                id="edit-time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g., 7:00 PM"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration</Label>
              <Input
                id="edit-duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 3 hours"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price Range</Label>
              <Select
                value={formData.priceRange}
                onValueChange={(value: "" | "$" | "$$" | "$$$" | "$$$$") =>
                  setFormData({ ...formData, priceRange: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="$">$ - Budget</SelectItem>
                  <SelectItem value="$$">$$ - Moderate</SelectItem>
                  <SelectItem value="$$$">$$$ - Pricey</SelectItem>
                  <SelectItem value="$$$$">$$$$ - Expensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's special about this activity?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Personal Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Tips, reminders, things to remember..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bookingUrl">Booking URL</Label>
            <Input
              id="edit-bookingUrl"
              value={formData.bookingUrl}
              onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-2">
              <Switch
                id="edit-mustdo"
                checked={formData.isMustDo}
                onCheckedChange={(checked) => setFormData({ ...formData, isMustDo: checked })}
              />
              <Label htmlFor="edit-mustdo" className="cursor-pointer">Mark as Must Do</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-booked"
                checked={formData.isBooked}
                onCheckedChange={(checked) => setFormData({ ...formData, isBooked: checked })}
              />
              <Label htmlFor="edit-booked" className="cursor-pointer">Already Booked</Label>
            </div>
          </div>

          {/* Move to Different Day */}
          <div className="border-t pt-4 space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Move to a Different Day
            </Label>
            <Select
              value={String(targetDayIndex)}
              onValueChange={(value) => setTargetDayIndex(Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableDays.map(({ day, index }) => (
                  <SelectItem key={index} value={String(index)}>
                    {day.dayOfWeek}, {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {day.title}
                    {index === currentDayIndex && " (current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {targetDayIndex !== currentDayIndex && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                Activity will be moved to {days[targetDayIndex]?.dayOfWeek}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1",
                isCopenhagen
                  ? "bg-copenhagen hover:bg-copenhagen/90"
                  : "bg-iceland hover:bg-iceland/90"
              )}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
