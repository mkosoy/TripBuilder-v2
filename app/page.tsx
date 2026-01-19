"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import * as TripService from "@/lib/services/trip-service";
import { TripHeader } from "@/components/trip-header";
import { DayNavigation } from "@/components/day-navigation";
import { DayView } from "@/components/day-view";
import { FlightsPanel } from "@/components/flights-panel";
import { BookingsPanel } from "@/components/bookings-panel";
import { SavedPlacesPanel } from "@/components/saved-places-panel";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { TravelersPanel } from "@/components/travelers-panel";
import { ProfileSelector } from "@/components/profile-selector";
import { ProfilePage } from "@/components/profile-page";
import { UploadBookingModal } from "@/components/upload-booking-modal";
import { FloatingUploadButton } from "@/components/floating-upload-button";
import { MobileNav } from "@/components/mobile-nav";
import { MapPanel } from "@/components/map-panel";
import {
  itinerary,
  flights,
  hotels as initialHotels,
  savedPlaces as initialSavedPlaces,
  alternativeActivities,
  travelers as initialTravelers,
  initialMustDos,
  type DayItinerary,
  type Activity,
  type SavedPlace,
  type MustDoItem,
  type Traveler,
  type Hotel,
  type Flight, // Declare Flight type here
} from "@/lib/trip-data";

export default function TripItinerary() {
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [tripId, setTripId] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [days, setDays] = useState<DayItinerary[]>(itinerary);
  const [saved, setSaved] = useState<SavedPlace[]>(initialSavedPlaces);
  const [hotels, setHotels] = useState<Hotel[]>(initialHotels);
  const [travelers, setTravelers] = useState<Traveler[]>(initialTravelers);
  const [mustDos, setMustDos] = useState<MustDoItem[]>(initialMustDos);
  const [currentUserId, setCurrentUserId] = useState("");
  const [activePanel, setActivePanel] = useState<
    "itinerary" | "flights" | "bookings" | "saved" | "recommendations" | "travelers" | "profile" | "map"
  >("itinerary");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [flightsList, setFlightsList] = useState<Flight[]>(flights);

  // Load data from Supabase on mount
  useEffect(() => {
    loadTripData();
  }, []);

  async function loadTripData() {
    try {
      const data = await TripService.loadTripData();

      // If database is empty (no days), trigger migration
      if (data.days.length === 0 || data.days.length < 12) {
        console.log("[v0] Database incomplete, running migration...");
        const migrateResponse = await fetch("/api/migrate-data", {
          method: "POST",
        });
        
        if (migrateResponse.ok) {
          const migrateResult = await migrateResponse.json();
          console.log("[v0] Migration complete:", migrateResult.message);
          // Reload data after migration
          const newData = await TripService.loadTripData();
          if (newData.travelers.length > 0) {
            setTravelers(newData.travelers);
            setCurrentUserId(newData.travelers[0].id);
          }
          if (newData.hotels.length > 0) setHotels(newData.hotels);
          if (newData.flights.length > 0) setFlightsList(newData.flights);
          if (newData.days.length > 0) setDays(newData.days);
          if (newData.mustDos.length > 0) setMustDos(newData.mustDos);
          if (newData.savedPlaces.length > 0) setSaved(newData.savedPlaces);
          setTripId("default-trip");
          setLoading(false);
          return;
        }
      }

      if (data.travelers.length > 0) {
        setTravelers(data.travelers);
        console.log("[v0] Loaded travelers from DB:", data.travelers);
        console.log("[v0] Setting currentUserId to:", data.travelers[0].id);
        setCurrentUserId(data.travelers[0].id);
      }
      
      if (data.hotels.length > 0) {
        setHotels(data.hotels);
      }
      
      if (data.flights.length > 0) {
        setFlightsList(data.flights);
      }
      
      if (data.days.length > 0) {
        setDays(data.days);
      }
      
      if (data.mustDos.length > 0) {
        setMustDos(data.mustDos);
      }
      
      if (data.savedPlaces.length > 0) {
        setSaved(data.savedPlaces);
      }
      
      setTripId("default-trip");
      setLoading(false);
    } catch (error) {
      console.error("[v0] Error loading trip data:", error);
      setLoading(false);
    }
  }

  const currentDay = days[selectedDayIndex];

  const handleSwapActivity = (dayIndex: number, activityId: string, newActivity: Activity) => {
    setDays((prev) => {
      const updated = [...prev];
      const day = { ...updated[dayIndex] };
      day.activities = day.activities.map((a) =>
        a.id === activityId ? { ...newActivity, id: activityId } : a
      );
      updated[dayIndex] = day;
      return updated;
    });
  };

  const handleRemoveActivity = (dayIndex: number, activityId: string) => {
    setDays((prev) => {
      const updated = [...prev];
      const day = { ...updated[dayIndex] };
      day.activities = day.activities.filter((a) => a.id !== activityId);
      updated[dayIndex] = day;
      return updated;
    });
  };

  const handleAddActivity = async (dayIndex: number, activity: Activity) => {
    const day = days[dayIndex];
    if (!day?.id) {
      console.error("[v0] Cannot add activity: day has no ID");
      alert("Failed to save reservation. Please try again.");
      return;
    }

    // Prepare activity without ID (DB will generate)
    const { id, ...activityWithoutId } = activity;
    const activitiesForSave = [...day.activities, activityWithoutId as Activity];

    // Save to Supabase and get back activities with DB-generated IDs
    try {
      const savedActivities = await TripService.saveDayActivities(day.id, activitiesForSave);
      console.log("[v0] Activities saved to Supabase, count:", savedActivities.length);

      // Update state with DB-generated IDs
      setDays((prev) => {
        const updated = [...prev];
        updated[dayIndex] = {
          ...updated[dayIndex],
          activities: savedActivities,
        };
        return updated;
      });
    } catch (error) {
      console.error("[v0] Error saving activity:", error);
      alert("Failed to save reservation. Please try again.");
    }
  };

  const handleEditActivity = async (
    dayIndex: number,
    activityId: string,
    updatedActivity: Activity,
    moveToDayIndex?: number
  ) => {
    let updatedDays: DayItinerary[];
    
    setDays((prev) => {
      const updated = [...prev];

      // If moving to a different day
      if (moveToDayIndex !== undefined && moveToDayIndex !== dayIndex) {
        // Remove from current day
        const currentDay = { ...updated[dayIndex] };
        currentDay.activities = currentDay.activities.filter((a) => a.id !== activityId);
        updated[dayIndex] = currentDay;

        // Add to target day
        const targetDay = { ...updated[moveToDayIndex] };
        targetDay.activities = [...targetDay.activities, { ...updatedActivity, id: activityId }];
        updated[moveToDayIndex] = targetDay;
      } else {
        // Update in place
        const day = { ...updated[dayIndex] };
        day.activities = day.activities.map((a) =>
          a.id === activityId ? { ...updatedActivity, id: activityId } : a
        );
        updated[dayIndex] = day;
      }

      updatedDays = updated;
      return updated;
    });
    
    // Save to Supabase
    try {
      if (moveToDayIndex !== undefined && moveToDayIndex !== dayIndex) {
        await TripService.saveDayActivities(days[dayIndex].id, updatedDays[dayIndex].activities);
        await TripService.saveDayActivities(days[moveToDayIndex].id, updatedDays[moveToDayIndex].activities);
      } else {
        await TripService.saveDayActivities(days[dayIndex].id, updatedDays[dayIndex].activities);
      }
      console.log("[v0] Activity edits saved to Supabase");
    } catch (error) {
      console.error("[v0] Error saving activity edits:", error);
    }
  };

  const handleAddSavedPlace = (place: SavedPlace) => {
    setSaved((prev) => [...prev, { ...place, id: `saved-${Date.now()}` }]);
  };

  const handleRemoveSavedPlace = (id: string) => {
    setSaved((prev) => prev.filter((p) => p.id !== id));
  };

  const handleEditHotel = async (destination: "copenhagen" | "reykjavik", updatedHotel: Hotel) => {
    setHotels((prev) =>
      prev.map((h) => (h.destination === destination ? updatedHotel : h))
    );
    
    // Save to Supabase
    try {
      await TripService.updateHotel(destination, updatedHotel);
      console.log("[v0] Hotel saved to Supabase");
    } catch (error) {
      console.error("[v0] Error saving hotel:", error);
    }
  };

  const handleVoteMustDo = (mustDoId: string, travelerId: string) => {
    setMustDos((prev) =>
      prev.map((m) => {
        if (m.id === mustDoId) {
          const hasVoted = m.votes.includes(travelerId);
          return {
            ...m,
            votes: hasVoted
              ? m.votes.filter((v) => v !== travelerId)
              : [...m.votes, travelerId],
          };
        }
        return m;
      })
    );
  };

  const handleAddComment = (mustDoId: string, travelerId: string, comment: string) => {
    setMustDos((prev) =>
      prev.map((m) => {
        if (m.id === mustDoId) {
          return {
            ...m,
            comments: [
              ...m.comments,
              {
                id: `comment-${Date.now()}`,
                travelerId,
                text: comment,
                timestamp: Date.now(),
              },
            ],
          };
        }
        return m;
      })
    );
  };

  const handleAddMustDo = (
    mustDo: Omit<MustDoItem, "id" | "votes" | "comments" | "addedToItinerary">
  ) => {
    setMustDos((prev) => [
      ...prev,
      {
        ...mustDo,
        id: `mustdo-${Date.now()}`,
        votes: [],
        comments: [],
        addedToItinerary: false,
      },
    ]);
  };

  const handleAddToItinerary = (mustDoId: string, dayDate: string) => {
    const mustDo = mustDos.find((m) => m.id === mustDoId);
    if (!mustDo) return;

    // Find the day index
    const dayIndex = days.findIndex((d) => d.date === dayDate);
    if (dayIndex === -1) return;

    // Create activity from must-do
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      name: mustDo.name,
      type: mustDo.type,
      description: mustDo.description || "",
      address: mustDo.address,
      bookingUrl: mustDo.bookingUrl,
      priceRange: mustDo.priceRange,
      notes: mustDo.notes,
      isMustDo: true,
    };

    // Add to day
    setDays((prev) => {
      const updated = [...prev];
      const day = { ...updated[dayIndex] };
      day.activities = [...day.activities, newActivity];
      updated[dayIndex] = day;
      return updated;
    });

    // Mark must-do as added
    setMustDos((prev) =>
      prev.map((m) =>
        m.id === mustDoId
          ? {
              ...m,
              addedToItinerary: true,
              addedToDay: dayDate,
            }
          : m
      )
    );
  };

  const handleDeleteMustDo = (mustDoId: string) => {
    setMustDos((prev) => prev.filter((m) => m.id !== mustDoId));
  };

  const handleUpdateAvatar = async (userId: string, avatarUrl: string) => {
    console.log("[v0] Attempting to save avatar for user:", userId);
    console.log("[v0] Avatar data length:", avatarUrl.length);

    // Update state immediately for instant UI feedback
    setTravelers((prev) =>
      prev.map((t) => (t.id === userId ? { ...t, avatar: avatarUrl } : t))
    );

    // Save to Supabase
    try {
      await TripService.updateTravelerAvatar(userId, avatarUrl);
      console.log("[v0] ✓ Avatar saved to Supabase successfully!");
      alert("Profile photo saved successfully!");
    } catch (error) {
      console.error("[v0] ✗ Error saving avatar:", error);
      console.error("[v0] Error details:", JSON.stringify(error, null, 2));
      alert(`Failed to save profile photo: ${error}`);
      // Revert on error
      loadTripData();
    }
  };

  const handleUploadBooking = async (booking: any) => {

    if (booking.type === "flight") {
      // Check if matching flight exists
      const existingFlightIndex = flightsList.findIndex(
        (f) =>
          f.flightNumber === booking.flightNumber &&
          f.date === (booking.departureDate || booking.date) &&
          f.fromCode === booking.fromCode &&
          f.toCode === booking.toCode
      );

      if (existingFlightIndex !== -1) {
        // Ask for confirmation to replace
        if (
          confirm(
            "A matching flight already exists. Do you want to replace it with your booking details?"
          )
        ) {
          const updatedFlight: Flight = {
            ...flightsList[existingFlightIndex],
            date: booking.departureDate || booking.date,
            departureTime: booking.departureTime,
            arrivalTime: booking.arrivalTime,
            from: booking.from,
            fromCode: booking.fromCode,
            to: booking.to,
            toCode: booking.toCode,
            airline: booking.airline,
            flightNumber: booking.flightNumber,
            confirmationNumber: booking.confirmationNumber,
            travelers: booking.attendees,
            screenshotUrl: booking.screenshotUrl,
            notes: booking.notes,
            isPersonal: true,
          };

          setFlightsList((prev) => {
            const updated = [...prev];
            updated[existingFlightIndex] = updatedFlight;
            return updated;
          });

          // Save to Supabase
          try {
            await TripService.updateFlight(flightsList[existingFlightIndex].id, updatedFlight);
            console.log("[v0] Flight updated in Supabase");
          } catch (error) {
            console.error("[v0] Error updating flight:", error);
            alert("Failed to update flight booking. Please try again.");
          }
        }
      } else {
        // Add new flight - prepare data without ID (DB will generate)
        const flightData: Omit<Flight, 'id'> = {
          date: booking.departureDate || booking.date,
          departureTime: booking.departureTime,
          arrivalTime: booking.arrivalTime,
          from: booking.from,
          fromCode: booking.fromCode,
          to: booking.to,
          toCode: booking.toCode,
          airline: booking.airline,
          flightNumber: booking.flightNumber,
          confirmationNumber: booking.confirmationNumber,
          travelers: booking.attendees,
          screenshotUrl: booking.screenshotUrl,
          notes: booking.notes,
          isPersonal: true,
        };

        // Save to Supabase and get back the flight with DB-generated ID
        try {
          const savedFlight = await TripService.addFlight(flightData);
          console.log("[v0] Flight added to Supabase with ID:", savedFlight.id);

          // Add to state with DB-generated ID
          setFlightsList((prev) => [...prev, savedFlight]);
        } catch (error) {
          console.error("[v0] Error adding flight:", error);
          alert("Failed to save flight booking. Please try again.");
        }
      }
    } else if (booking.type === "hotel") {
      // Map booking to hotel format and update the appropriate hotel
      const destination = booking.destination as "copenhagen" | "reykjavik";
      const updatedHotel: Hotel = {
        id: `hotel-${destination}`,
        name: booking.name,
        address: booking.address || "",
        phone: booking.phone,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        destination,
        amenities: booking.amenities,
        bookingUrl: booking.bookingUrl,
        notes: booking.notes,
      };

      // Update state
      setHotels((prev) =>
        prev.map((h) => (h.destination === destination ? updatedHotel : h))
      );

      // Save to Supabase
      try {
        await TripService.updateHotel(destination, updatedHotel);
        console.log("[v0] Hotel saved to Supabase");
      } catch (error) {
        console.error("[v0] Error saving hotel:", error);
        alert("Failed to save hotel booking. Please try again.");
      }
    } else if (booking.type === "restaurant" || booking.type === "tour") {
      // Find the correct day and add as activity
      const dayIndex = days.findIndex((d) => d.date === booking.date);
      if (dayIndex !== -1) {
        const newActivity: Activity = {
          id: `activity-${Date.now()}`, // Temporary ID - handleAddActivity will replace with DB-generated ID
          name: booking.name || "New Booking",
          type: booking.type === "restaurant" ? "food" : "tour",
          time: booking.time,
          duration: booking.duration,
          description: booking.notes || (booking.type === "tour" && booking.meetingPoint ? `Meeting point: ${booking.meetingPoint}` : ""),
          address: booking.address || booking.meetingPoint,
          confirmationNumber: booking.confirmationNumber,
          attendees: booking.attendees,
          screenshotUrl: booking.screenshotUrl,
          isBooked: true,
        };
        await handleAddActivity(dayIndex, newActivity);

        // Navigate to the day where the booking was added
        setSelectedDayIndex(dayIndex);
      } else {
        alert(`No day found for ${booking.date}. Please make sure the date is within your trip dates.`);
      }
    }
  };

  const handleDeleteFlight = async (flightId: string) => {
    setFlightsList((prev) => prev.filter((f) => f.id !== flightId));
    
    // Save to Supabase
    try {
      await TripService.deleteFlight(flightId);
      console.log("[v0] Flight deleted from Supabase");
    } catch (error) {
      console.error("[v0] Error deleting flight:", error);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    let updatedDays: DayItinerary[];
    setDays((prev) => {
      updatedDays = prev.map((day) => ({
        ...day,
        activities: day.activities.filter((a) => a.id !== activityId),
      }));
      return updatedDays;
    });
    
    // Save to Supabase - find the day that had this activity and save it
    try {
      const dayWithActivity = days.find((d) => d.activities.some((a) => a.id === activityId));
      if (dayWithActivity) {
        const updatedDay = updatedDays.find((d) => d.id === dayWithActivity.id);
        if (updatedDay) {
          await TripService.saveDayActivities(updatedDay.id, updatedDay.activities);
          console.log("[v0] Activity deleted from Supabase");
        }
      }
    } catch (error) {
      console.error("[v0] Error deleting activity:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading your trip...</p>
        </div>
      </div>
    );
  }

  if (!tripId && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No trip data found. Using default itinerary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TripHeader
        travelers={travelers}
        currentUserId={currentUserId}
        onSelectUser={setCurrentUserId}
        onUpdateAvatar={handleUpdateAvatar}
      />

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <DayNavigation
                days={days}
                selectedIndex={selectedDayIndex}
                onSelect={setSelectedDayIndex}
              />
              <DayView
                day={currentDay}
                dayIndex={selectedDayIndex}
                allDays={days}
                onSwapActivity={handleSwapActivity}
                onRemoveActivity={handleRemoveActivity}
                onAddActivity={handleAddActivity}
                onEditActivity={handleEditActivity}
                alternatives={alternativeActivities.filter(
                  (a) =>
                    (currentDay.destination === "copenhagen" && a.id.includes("cph")) ||
                    (currentDay.destination === "reykjavik" && a.id.includes("rvk"))
                )}
                savedPlaces={saved.filter((p) => p.destination === currentDay.destination)}
              />
            </div>

            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 space-y-4">
              <BookingsPanel
                flights={flightsList}
                days={days}
                currentUserId={currentUserId}
                onDeleteFlight={handleDeleteFlight}
                onDeleteActivity={handleDeleteActivity}
                onViewInItinerary={setSelectedDayIndex}
              />
              <TravelersPanel
                travelers={travelers}
                mustDos={mustDos}
                days={days}
                currentUserId={currentUserId}
                onVoteMustDo={handleVoteMustDo}
                onAddComment={handleAddComment}
                onAddMustDo={handleAddMustDo}
                onAddToItinerary={handleAddToItinerary}
                onDeleteMustDo={handleDeleteMustDo}
              />
              <FlightsPanel
                flights={flightsList}
                hotels={hotels}
                onEditHotel={handleEditHotel}
                onDeleteFlight={handleDeleteFlight}
              />
              <SavedPlacesPanel
                places={saved}
                onRemove={handleRemoveSavedPlace}
                onAddToDay={(place) => {
                  const activity: Activity = {
                    id: `from-saved-${Date.now()}`,
                    name: place.name,
                    type: place.type,
                    description: place.description || "",
                    priceRange: place.priceRange,
                    bookingUrl: place.bookingUrl,
                  };
                  handleAddActivity(selectedDayIndex, activity);
                }}
                currentDestination={currentDay.destination}
              />
              <MapPanel
                days={days}
                currentUserId={currentUserId}
                travelers={travelers}
              />
            </div>
          </div>
        </div>
        <FloatingUploadButton onClick={() => setShowUploadModal(true)} />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="px-5 py-5 pb-24">
          {activePanel === "itinerary" && (
            <>
              <DayNavigation
                days={days}
                selectedIndex={selectedDayIndex}
                onSelect={setSelectedDayIndex}
              />
              <DayView
                day={currentDay}
                dayIndex={selectedDayIndex}
                allDays={days}
                onSwapActivity={handleSwapActivity}
                onRemoveActivity={handleRemoveActivity}
                onAddActivity={handleAddActivity}
                onEditActivity={handleEditActivity}
                alternatives={alternativeActivities.filter(
                  (a) =>
                    (currentDay.destination === "copenhagen" && a.id.includes("cph")) ||
                    (currentDay.destination === "reykjavik" && a.id.includes("rvk"))
                )}
                savedPlaces={saved.filter((p) => p.destination === currentDay.destination)}
              />
            </>
          )}
          {activePanel === "flights" && (
            <FlightsPanel
              flights={flightsList}
              hotels={hotels}
              onEditHotel={handleEditHotel}
              onDeleteFlight={handleDeleteFlight}
            />
          )}
          {activePanel === "bookings" && (
            <BookingsPanel
              flights={flightsList}
              days={days}
              currentUserId={currentUserId}
              onDeleteFlight={handleDeleteFlight}
              onDeleteActivity={handleDeleteActivity}
              onViewInItinerary={(dayIndex) => {
                setSelectedDayIndex(dayIndex);
                setActivePanel("itinerary");
              }}
            />
          )}
          {activePanel === "saved" && (
            <SavedPlacesPanel
              places={saved}
              onRemove={handleRemoveSavedPlace}
              onAddToDay={(place) => {
                const activity: Activity = {
                  id: `from-saved-${Date.now()}`,
                  name: place.name,
                  type: place.type,
                  description: place.description || "",
                  priceRange: place.priceRange,
                  bookingUrl: place.bookingUrl,
                };
                handleAddActivity(selectedDayIndex, activity);
                setActivePanel("itinerary");
              }}
              currentDestination={currentDay.destination}
            />
          )}
          {activePanel === "recommendations" && (
            <RecommendationsPanel
              currentDestination={currentDay.destination}
              onAddPlace={handleAddSavedPlace}
              onAddToDay={(activity) => {
                handleAddActivity(selectedDayIndex, activity);
                setActivePanel("itinerary");
              }}
            />
          )}
          {activePanel === "travelers" && (
            <TravelersPanel
              travelers={travelers}
              mustDos={mustDos}
              days={days}
              currentUserId={currentUserId}
              onVoteMustDo={handleVoteMustDo}
              onAddComment={handleAddComment}
              onAddMustDo={handleAddMustDo}
              onAddToItinerary={handleAddToItinerary}
              onDeleteMustDo={handleDeleteMustDo}
            />
          )}
          {activePanel === "profile" && (
            <ProfilePage
              traveler={travelers.find((t) => t.id === currentUserId)!}
              flights={flightsList}
              activities={days.flatMap((d) => d.activities)}
              mustDos={mustDos}
              days={days}
              onUploadClick={() => setShowUploadModal(true)}
              onDeleteFlight={handleDeleteFlight}
              onDeleteActivity={handleDeleteActivity}
            />
          )}
          {activePanel === "map" && (
            <MapPanel
              days={days}
              currentUserId={currentUserId}
              travelers={travelers}
            />
          )}
        </div>
        <FloatingUploadButton onClick={() => setShowUploadModal(true)} />
        <MobileNav activePanel={activePanel} onPanelChange={setActivePanel} />
      </div>

      <UploadBookingModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        travelers={travelers}
        currentUserId={currentUserId}
        onSave={handleUploadBooking}
      />
    </div>
  );
}
