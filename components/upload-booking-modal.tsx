"use client";

import React, { useRef, useEffect } from "react"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Loader2, Camera, Plane, UtensilsCrossed, Hotel as HotelIcon, Compass, AlertCircle } from "lucide-react";
import type { Traveler } from "@/lib/trip-data";
import { cn } from "@/lib/utils";

interface ExtractedBooking {
  type: "flight" | "restaurant" | "hotel" | "tour" | "other";
  name?: string;
  date?: string;
  time?: string;
  confirmationNumber?: string;
  // Flight fields
  airline?: string;
  flightNumber?: string;
  from?: string;
  fromCode?: string;
  to?: string;
  toCode?: string;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  // Restaurant fields
  address?: string;
  partySize?: number;
  // Hotel fields
  checkIn?: string;
  checkOut?: string;
  // Tour/Activity fields
  duration?: string;
  meetingPoint?: string;
  notes?: string;
}

interface UploadBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  travelers: Traveler[];
  currentUserId: string;
  onSave: (booking: ExtractedBooking & { attendees: string[]; screenshotUrl: string }) => void;
}

export function UploadBookingModal({
  open,
  onOpenChange,
  travelers,
  currentUserId,
  onSave,
}: UploadBookingModalProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedBooking | null>(null);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([currentUserId]);
  const [extracting, setExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Track mounted state to prevent memory leaks
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Abort any pending fetch request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setExtracting(true);
    setExtractionError(null);

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Convert file to base64 data URL for API
      const reader = new FileReader();
      reader.onloadend = async () => {
        // Check if component is still mounted
        if (!isMountedRef.current) return;

        const dataUrl = reader.result as string;
        setImageUrl(dataUrl);

        // Extract booking information using Groq
        try {
          const response = await fetch("/api/extract-booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: dataUrl }),
            signal,
          });

          // Check if component is still mounted after fetch
          if (!isMountedRef.current) return;

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
            console.log("AI extraction unavailable:", errorData.error);
            // Show error message and fall back to manual entry
            setExtractionError(errorData.error || "AI extraction failed. Please fill in details manually.");
            setExtractedData({
              type: "flight",
              date: "",
              time: "",
            });
          } else {
            const data = await response.json();
            if (isMountedRef.current) {
              setExtractedData(data);
              setExtractionError(null);
            }
          }
        } catch (extractError) {
          // Ignore abort errors
          if (extractError instanceof Error && extractError.name === "AbortError") {
            return;
          }
          console.error("Extraction failed:", extractError);
          // Check if component is still mounted
          if (!isMountedRef.current) return;
          // Show error and fall back to manual entry
          setExtractionError("Failed to connect to AI service. Please fill in details manually.");
          setExtractedData({
            type: "flight",
            date: "",
            time: "",
          });
        } finally {
          if (isMountedRef.current) {
            setExtracting(false);
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed:", error);
      if (isMountedRef.current) {
        alert("Failed to upload screenshot. Please try again.");
        setExtracting(false);
      }
    } finally {
      if (isMountedRef.current) {
        setUploading(false);
      }
    }
  };

  const handleSave = () => {
    if (!extractedData) return;

    onSave({
      ...extractedData,
      attendees: selectedAttendees,
      screenshotUrl: "", // Don't store screenshots - only use for AI extraction
    });

    // Reset form
    setImageUrl("");
    setExtractedData(null);
    setSelectedAttendees([currentUserId]);
    onOpenChange(false);
  };

  const handleAttendeeToggle = (travelerId: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(travelerId)
        ? prev.filter((id) => id !== travelerId)
        : [...prev, travelerId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Upload Screenshot (Optional)</Label>
              {!extractedData && !uploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setExtractedData({
                      type: "flight",
                      date: "",
                      time: "",
                    });
                  }}
                >
                  Skip & Enter Manually
                </Button>
              )}
            </div>
            {!extractedData && (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {imageUrl ? (
                  <div className="space-y-4">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Booking screenshot"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageUrl("");
                        setExtractedData(null);
                      }}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <div className="flex flex-col items-center gap-2">
                      {uploading ? (
                        <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                      ) : (
                        <Camera className="w-12 h-12 text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground">
                        {uploading ? "Processing..." : "Click to upload or drag and drop"}
                      </p>
                    </div>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Extraction Progress */}
          {extracting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Extracting booking information with AI...</span>
            </div>
          )}

          {/* AI Extraction Error */}
          {extractionError && !extracting && (
            <div className="flex items-center gap-2 p-3 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{extractionError}</span>
            </div>
          )}

          {/* Extracted Data */}
          {extractedData && !extracting && (
            <div className="space-y-4 border border-border rounded-lg p-4">
              <h3 className="font-medium">Booking Information</h3>

              <div className="grid gap-4">
                {/* Booking Type Tabs */}
                <div>
                  <Label className="mb-2 block">Booking Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      type="button"
                      variant={extractedData.type === "flight" ? "default" : "outline"}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                      onClick={() => setExtractedData({...extractedData, type: "flight"})}
                    >
                      <Plane className="w-4 h-4" />
                      <span className="text-xs">Flight</span>
                    </Button>
                    <Button
                      type="button"
                      variant={extractedData.type === "restaurant" ? "default" : "outline"}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                      onClick={() => setExtractedData({...extractedData, type: "restaurant"})}
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      <span className="text-xs">Restaurant</span>
                    </Button>
                    <Button
                      type="button"
                      variant={extractedData.type === "hotel" ? "default" : "outline"}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                      onClick={() => setExtractedData({...extractedData, type: "hotel"})}
                    >
                      <HotelIcon className="w-4 h-4" />
                      <span className="text-xs">Hotel</span>
                    </Button>
                    <Button
                      type="button"
                      variant={extractedData.type === "tour" ? "default" : "outline"}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                      onClick={() => setExtractedData({...extractedData, type: "tour"})}
                    >
                      <Compass className="w-4 h-4" />
                      <span className="text-xs">Tour</span>
                    </Button>
                  </div>
                </div>

                {extractedData.type === "flight" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Airline</Label>
                        <Input
                          value={extractedData.airline || ""}
                          onChange={(e) => setExtractedData({...extractedData, airline: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Flight Number</Label>
                        <Input
                          value={extractedData.flightNumber || ""}
                          onChange={(e) => setExtractedData({...extractedData, flightNumber: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>From City</Label>
                        <Input
                          value={extractedData.from || ""}
                          onChange={(e) => setExtractedData({...extractedData, from: e.target.value})}
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label>From Code</Label>
                        <Input
                          value={extractedData.fromCode || ""}
                          onChange={(e) => setExtractedData({...extractedData, fromCode: e.target.value})}
                          placeholder="JFK"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>To City</Label>
                        <Input
                          value={extractedData.to || ""}
                          onChange={(e) => setExtractedData({...extractedData, to: e.target.value})}
                          placeholder="Copenhagen"
                        />
                      </div>
                      <div>
                        <Label>To Code</Label>
                        <Input
                          value={extractedData.toCode || ""}
                          onChange={(e) => setExtractedData({...extractedData, toCode: e.target.value})}
                          placeholder="CPH"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Departure Date</Label>
                        <Input
                          type="date"
                          value={extractedData.departureDate || extractedData.date || ""}
                          onChange={(e) => setExtractedData({...extractedData, departureDate: e.target.value, date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Departure Time</Label>
                        <Input
                          type="time"
                          value={extractedData.departureTime || ""}
                          onChange={(e) => setExtractedData({...extractedData, departureTime: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Arrival Date</Label>
                        <Input
                          type="date"
                          value={extractedData.arrivalDate || extractedData.date || ""}
                          onChange={(e) => setExtractedData({...extractedData, arrivalDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Arrival Time</Label>
                        <Input
                          type="time"
                          value={extractedData.arrivalTime || ""}
                          onChange={(e) => setExtractedData({...extractedData, arrivalTime: e.target.value})}
                        />
                      </div>
                    </div>
                  </>
                )}

                {extractedData.type === "restaurant" && (
                  <>
                    <div>
                      <Label>Restaurant Name</Label>
                      <Input
                        value={extractedData.name || ""}
                        onChange={(e) => setExtractedData({...extractedData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={extractedData.address || ""}
                        onChange={(e) => setExtractedData({...extractedData, address: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={extractedData.date || ""}
                          onChange={(e) => setExtractedData({...extractedData, date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={extractedData.time || ""}
                          onChange={(e) => setExtractedData({...extractedData, time: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Party Size</Label>
                        <Input
                          type="number"
                          value={extractedData.partySize || ""}
                          onChange={(e) => setExtractedData({...extractedData, partySize: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  </>
                )}

                {extractedData.type === "hotel" && (
                  <>
                    <div>
                      <Label>Hotel Name</Label>
                      <Input
                        value={extractedData.name || ""}
                        onChange={(e) => setExtractedData({...extractedData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={extractedData.address || ""}
                        onChange={(e) => setExtractedData({...extractedData, address: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Check-in Date</Label>
                        <Input
                          type="date"
                          value={extractedData.checkIn || ""}
                          onChange={(e) => setExtractedData({...extractedData, checkIn: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Check-out Date</Label>
                        <Input
                          type="date"
                          value={extractedData.checkOut || ""}
                          onChange={(e) => setExtractedData({...extractedData, checkOut: e.target.value})}
                        />
                      </div>
                    </div>
                  </>
                )}

                {extractedData.type === "tour" && (
                  <>
                    <div>
                      <Label>Tour/Activity Name</Label>
                      <Input
                        value={extractedData.name || ""}
                        onChange={(e) => setExtractedData({...extractedData, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={extractedData.date || ""}
                          onChange={(e) => setExtractedData({...extractedData, date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={extractedData.time || ""}
                          onChange={(e) => setExtractedData({...extractedData, time: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={extractedData.duration || ""}
                          onChange={(e) => setExtractedData({...extractedData, duration: e.target.value})}
                          placeholder="e.g. 2 hours"
                        />
                      </div>
                      <div>
                        <Label>Meeting Point</Label>
                        <Input
                          value={extractedData.meetingPoint || ""}
                          onChange={(e) => setExtractedData({...extractedData, meetingPoint: e.target.value})}
                          placeholder="Where to meet"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label>Confirmation Number</Label>
                  <Input
                    value={extractedData.confirmationNumber || ""}
                    onChange={(e) => setExtractedData({...extractedData, confirmationNumber: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={extractedData.notes || ""}
                    onChange={(e) => setExtractedData({...extractedData, notes: e.target.value})}
                  />
                </div>
              </div>

              {/* Attendees Selection */}
              <div className="space-y-2">
                <Label>Who is on this booking?</Label>
                <div className="space-y-2">
                  {travelers.map((traveler) => (
                    <div key={traveler.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`attendee-${traveler.id}`}
                        checked={selectedAttendees.includes(traveler.id)}
                        onCheckedChange={() => handleAttendeeToggle(traveler.id)}
                      />
                      <label
                        htmlFor={`attendee-${traveler.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {traveler.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!extractedData}>
              Add to Itinerary
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
