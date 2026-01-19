"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import type { Traveler, MustDoItem, Destination, ActivityType } from "@/lib/trip-data";

interface AddMustDoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  travelers: Traveler[];
  currentUserId: string;
  onAdd: (mustDo: Omit<MustDoItem, "id" | "votes" | "comments" | "addedToItinerary">) => void;
}

export function AddMustDoModal({
  open,
  onOpenChange,
  travelers,
  currentUserId,
  onAdd,
}: AddMustDoModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ActivityType>("attraction");
  const [destination, setDestination] = useState<Destination>("reykjavik");
  const [address, setAddress] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [priceRange, setPriceRange] = useState<"$" | "$$" | "$$$" | "$$$$">("$$");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;

    onAdd({
      travelerId: currentUserId,
      name: name.trim(),
      type,
      destination,
      description: description.trim() || undefined,
      address: address.trim() || undefined,
      bookingUrl: bookingUrl.trim() || undefined,
      priceRange,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setName("");
    setDescription("");
    setType("attraction");
    setDestination("reykjavik");
    setAddress("");
    setBookingUrl("");
    setPriceRange("$$");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Must-Do Activity</DialogTitle>
          <DialogDescription>
            Share something you'd love to do on this trip
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Activity Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Try Icelandic hot dogs"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="attraction">Attraction</SelectItem>
                  <SelectItem value="tour">Tour</SelectItem>
                  <SelectItem value="nightlife">Nightlife</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="relaxation">Relaxation</SelectItem>
                  <SelectItem value="nature">Nature</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Select
                value={destination}
                onValueChange={(v) => setDestination(v as Destination)}
              >
                <SelectTrigger id="destination">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="copenhagen">Copenhagen</SelectItem>
                  <SelectItem value="reykjavik">Reykjavik</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Why do you want to do this?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address / Location</Label>
            <Input
              id="address"
              placeholder="e.g., Tryggvagata 1, Reykjavik"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookingUrl">Booking / Website URL</Label>
            <Input
              id="bookingUrl"
              type="url"
              placeholder="https://..."
              value={bookingUrl}
              onChange={(e) => setBookingUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceRange">Price Range</Label>
            <Select
              value={priceRange}
              onValueChange={(v) => setPriceRange(v as "$" | "$$" | "$$$" | "$$$$")}
            >
              <SelectTrigger id="priceRange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$">$ - Budget</SelectItem>
                <SelectItem value="$$">$$ - Moderate</SelectItem>
                <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional thoughts..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Add Must-Do
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
