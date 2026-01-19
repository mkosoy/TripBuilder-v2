"use client";

import React from "react"

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Activity, Destination, SavedPlace, ActivityType } from "@/lib/trip-data";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Bookmark, Sparkles } from "lucide-react";

interface AddActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (activity: Activity) => void;
  destination: Destination;
  alternatives: Activity[];
  savedPlaces: SavedPlace[];
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

export function AddActivityModal({
  open,
  onOpenChange,
  onAdd,
  destination,
  alternatives,
  savedPlaces,
}: AddActivityModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "food" as ActivityType,
    time: "",
    description: "",
    address: "",
    bookingUrl: "",
  });

  const isCopenhagen = destination === "copenhagen";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAdd({
      id: `custom-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      time: formData.time || undefined,
      description: formData.description,
      address: formData.address || undefined,
      bookingUrl: formData.bookingUrl || undefined,
    });

    setFormData({
      name: "",
      type: "food",
      time: "",
      description: "",
      address: "",
      bookingUrl: "",
    });
  };

  const handleAddFromSuggestion = (activity: Activity) => {
    onAdd(activity);
  };

  const handleAddFromSaved = (place: SavedPlace) => {
    onAdd({
      id: `from-saved-${Date.now()}`,
      name: place.name,
      type: place.type,
      description: place.description || "",
      priceRange: place.priceRange,
      bookingUrl: place.bookingUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="custom" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="custom" className="text-xs sm:text-sm">
              <Plus className="w-4 h-4 mr-1 hidden sm:inline" />
              Custom
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 mr-1 hidden sm:inline" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-xs sm:text-sm">
              <Bookmark className="w-4 h-4 mr-1 hidden sm:inline" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Dinner at Noma"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
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
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g., 7:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's special about this activity?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingUrl">Booking URL</Label>
                <Input
                  id="bookingUrl"
                  value={formData.bookingUrl}
                  onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full",
                  isCopenhagen
                    ? "bg-copenhagen hover:bg-copenhagen/90"
                    : "bg-iceland hover:bg-iceland/90"
                )}
              >
                Add Activity
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-4">
            <div className="space-y-2">
              {alternatives.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No suggestions available for this destination
                </p>
              ) : (
                alternatives.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleAddFromSuggestion(activity)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium text-foreground">{activity.name}</div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {activity.description}
                    </p>
                    {activity.priceRange && (
                      <span className="text-xs text-muted-foreground mt-1 inline-block">
                        {activity.priceRange}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <div className="space-y-2">
              {savedPlaces.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved places for this destination
                </p>
              ) : (
                savedPlaces.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handleAddFromSaved(place)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-foreground">{place.name}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                        {place.category}
                      </span>
                    </div>
                    {place.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {place.description}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
