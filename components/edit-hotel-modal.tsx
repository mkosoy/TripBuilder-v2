"use client";

import { useState, useEffect } from "react";
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
import type { Hotel } from "@/lib/trip-data";

interface EditHotelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel: Hotel;
  onSave: (hotel: Hotel) => void;
}

export function EditHotelModal({ open, onOpenChange, hotel, onSave }: EditHotelModalProps) {
  const [name, setName] = useState(hotel.name);
  const [address, setAddress] = useState(hotel.address);
  const [phone, setPhone] = useState(hotel.phone || "");
  const [checkIn, setCheckIn] = useState(hotel.checkIn);
  const [checkOut, setCheckOut] = useState(hotel.checkOut);
  const [bookingUrl, setBookingUrl] = useState(hotel.bookingUrl || "");
  const [amenitiesText, setAmenitiesText] = useState(hotel.amenities?.join(", ") || "");

  useEffect(() => {
    setName(hotel.name);
    setAddress(hotel.address);
    setPhone(hotel.phone || "");
    setCheckIn(hotel.checkIn);
    setCheckOut(hotel.checkOut);
    setBookingUrl(hotel.bookingUrl || "");
    setAmenitiesText(hotel.amenities?.join(", ") || "");
  }, [hotel]);

  const handleSave = () => {
    const amenities = amenitiesText
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    onSave({
      ...hotel,
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim() || undefined,
      checkIn,
      checkOut,
      bookingUrl: bookingUrl.trim() || undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Hotel</DialogTitle>
          <DialogDescription>
            Update your accommodation details for{" "}
            {hotel.destination === "copenhagen" ? "Copenhagen" : "Reykjavik"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="hotel-name">Hotel Name *</Label>
            <Input
              id="hotel-name"
              placeholder="e.g., 25hours Hotel Indre By"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotel-address">Address *</Label>
            <Input
              id="hotel-address"
              placeholder="Street address and city"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotel-phone">Phone</Label>
            <Input
              id="hotel-phone"
              type="tel"
              placeholder="+45 123 456 789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check-in">Check-in Date</Label>
              <Input
                id="check-in"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-out">Check-out Date</Label>
              <Input
                id="check-out"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-url">Booking / Website URL</Label>
            <Input
              id="booking-url"
              type="url"
              placeholder="https://..."
              value={bookingUrl}
              onChange={(e) => setBookingUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities">Amenities</Label>
            <Textarea
              id="amenities"
              placeholder="e.g., Free WiFi, Breakfast included, Gym"
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple amenities with commas
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !address.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
