import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { itinerary, initialSavedPlaces, initialMustDos, flights, travelers as initialTravelers } from "@/lib/trip-data";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get the trip ID
    const { data: trips } = await supabase.from("trips").select("id").limit(1);
    if (!trips || trips.length === 0) {
      return NextResponse.json({ error: "No trip found" }, { status: 404 });
    }
    const tripId = trips[0].id;

    // Clear existing data
    await supabase.from("activities").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("days").delete().eq("trip_id", tripId);
    await supabase.from("flights").delete().eq("trip_id", tripId);
    await supabase.from("saved_places").delete().eq("trip_id", tripId);
    await supabase.from("must_dos").delete().eq("trip_id", tripId);
    await supabase.from("travelers").delete().eq("trip_id", tripId);

    // Insert travelers first (they need to exist before must_dos)
    const travelersToInsert = initialTravelers.map((traveler) => ({
      trip_id: tripId,
      name: traveler.name,
      avatar: traveler.avatar,
      color: traveler.color,
    }));

    const { data: insertedTravelers, error: travelersError } = await supabase
      .from("travelers")
      .insert(travelersToInsert)
      .select();

    if (travelersError) throw travelersError;

    // Create a map of old IDs to new UUIDs
    const travelerIdMap = new Map();
    initialTravelers.forEach((oldTraveler, index) => {
      if (insertedTravelers[index]) {
        travelerIdMap.set(oldTraveler.id, insertedTravelers[index].id);
      }
    });

    // Insert all days
    const daysToInsert = itinerary.map((day, index) => ({
      trip_id: tripId,
      date: day.date,
      day_number: day.dayNumber !== undefined ? day.dayNumber : index + 1,
      destination: day.destination,
      title: day.title || `Day ${day.dayNumber !== undefined ? day.dayNumber : index + 1}`,
      day_of_week: day.dayOfWeek || new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
    }));

    const { data: insertedDays, error: daysError } = await supabase
      .from("days")
      .insert(daysToInsert)
      .select();

    if (daysError) throw daysError;

    // Insert all activities for each day
    for (let i = 0; i < itinerary.length; i++) {
      const day = itinerary[i];
      const dbDay = insertedDays[i];
      
      const activitiesToInsert = day.activities.map((activity) => ({
        day_id: dbDay.id,
        name: activity.name,
        type: activity.type,
        time: activity.time || null,
        duration: activity.duration || null,
        description: activity.description || null,
        address: activity.address || null,
        booking_url: activity.bookingUrl || null,
        price_range: activity.priceRange || null,
        notes: activity.notes || null,
        is_booked: activity.isBooked || false,
        is_must_do: activity.isMustDo || false,
      }));

      const { error: activitiesError } = await supabase
        .from("activities")
        .insert(activitiesToInsert);

      if (activitiesError) throw activitiesError;
    }

    // Insert flights
    const flightsToInsert = flights.map((flight) => ({
      trip_id: tripId,
      date: flight.date,
      departure_time: flight.departureTime,
      arrival_time: flight.arrivalTime,
      from_city: flight.from,
      from_code: flight.fromCode,
      to_city: flight.to,
      to_code: flight.toCode,
      airline: flight.airline || null,
      flight_number: flight.flightNumber || null,
      notes: flight.notes || null,
    }));

    const { error: flightsError } = await supabase.from("flights").insert(flightsToInsert);
    if (flightsError) throw flightsError;

    // Insert saved places
    const savedToInsert = initialSavedPlaces.map((place) => ({
      trip_id: tripId,
      name: place.name,
      type: place.type,
      destination: place.destination,
      description: place.description || null,
      address: place.address || null,
      booking_url: place.bookingUrl || null,
      price_range: place.priceRange || null,
      category: place.category || null,
    }));

    const { error: savedError } = await supabase.from("saved_places").insert(savedToInsert);
    if (savedError) throw savedError;

    // Insert must-dos using the traveler ID map
    if (insertedTravelers && insertedTravelers.length > 0) {
      const mustDosToInsert = initialMustDos.map((item) => {
        // Map old traveler string IDs to new UUIDs
        const travelerId = travelerIdMap.get(item.travelerId) || insertedTravelers[0].id;

        return {
          trip_id: tripId,
          traveler_id: travelerId,
          name: item.name,
          type: item.type,
          destination: item.destination,
          description: item.description || null,
          price_range: item.priceRange || null,
          address: item.address || null,
          booking_url: item.bookingUrl || null,
          votes: [],
          added_to_itinerary: item.addedToItinerary || false,
        };
      });

      const { error: mustDosError } = await supabase.from("must_dos").insert(mustDosToInsert);
      if (mustDosError) throw mustDosError;
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${itinerary.length} days, ${flights.length} flights, ${initialSavedPlaces.length} saved places, and ${initialMustDos.length} must-dos`,
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
