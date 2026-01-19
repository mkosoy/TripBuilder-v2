import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  DayItinerary,
  Activity,
  Flight,
  Hotel,
  MustDoItem,
  SavedPlace,
  Traveler,
} from "@/lib/trip-data";

let CACHED_TRIP_ID: string | null = null;
let TRIP_ID: string | null = null;

async function getTripId() {
  if (CACHED_TRIP_ID) return CACHED_TRIP_ID;
  
  const supabase = getSupabaseBrowserClient();
  const { data: trips } = await supabase.from("trips").select("id").limit(1);
  CACHED_TRIP_ID = trips && trips.length > 0 ? trips[0].id : null;
  return CACHED_TRIP_ID;
}

export async function loadTripData() {
  const supabase = getSupabaseBrowserClient();
  const TRIP_ID = await getTripId();

  if (!TRIP_ID) {
    console.log("[v0] No trip found in database");
    return {
      days: [],
      flights: [],
      hotels: [],
      travelers: [],
      mustDos: [],
      savedPlaces: [],
    };
  }

  console.log("[v0] Loading data for trip:", TRIP_ID);

  // Load all trip data in parallel
  const [
    { data: days },
    { data: flights },
    { data: hotels },
    { data: travelers },
    { data: mustDos },
    { data: savedPlaces },
  ] = await Promise.all([
    supabase.from("days").select("*, activities(*)").eq("trip_id", TRIP_ID).order("date").order("time", { foreignTable: "activities", nullsFirst: true }),
    supabase.from("flights").select("*").eq("trip_id", TRIP_ID).order("date"),
    supabase.from("hotels").select("*").eq("trip_id", TRIP_ID).order("check_in"),
    supabase.from("travelers").select("*").eq("trip_id", TRIP_ID),
    supabase.from("must_dos").select("*, comments:must_do_comments(*)").eq("trip_id", TRIP_ID),
    supabase.from("saved_places").select("*").eq("trip_id", TRIP_ID),
  ]);

  return {
    days: (days || []).map(transformDay),
    flights: (flights || []).map(transformFlight),
    hotels: (hotels || []).map(transformHotel),
    travelers: (travelers || []).map(transformTraveler),
    mustDos: (mustDos || []).map(transformMustDo),
    savedPlaces: (savedPlaces || []).map(transformSavedPlace),
  };
}

export async function saveDayActivities(dayId: string, activities: Activity[]) {
  const supabase = getSupabaseBrowserClient();

  // Delete existing activities for this day
  await supabase.from("activities").delete().eq("day_id", dayId);

  // Insert new activities and return them with DB-generated IDs
  if (activities.length > 0) {
    const { data, error } = await supabase
      .from("activities")
      .insert(
        activities.map((activity) => ({
          day_id: dayId,
          ...transformActivityToDb(activity),
        }))
      )
      .select();

    if (error) throw error;
    return data.map(transformActivityFromDb);
  }

  return [];
}

export async function addFlight(flight: Omit<Flight, 'id'>) {
  const supabase = getSupabaseBrowserClient();
  const TRIP_ID = await getTripId();
  const { data, error } = await supabase
    .from("flights")
    .insert({
      trip_id: TRIP_ID,
      ...transformFlightToDb(flight as Flight), // Transform expects Flight but we handle id separately
    })
    .select()
    .single();

  if (error) throw error;
  return transformFlightFromDb(data);
}

export async function updateFlight(flightId: string, flight: Flight) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("flights")
    .update(transformFlightToDb(flight))
    .eq("id", flightId);

  if (error) throw error;
}

export async function deleteFlight(flightId: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("flights").delete().eq("id", flightId);

  if (error) throw error;
}

export async function updateHotel(destination: string, hotel: Hotel) {
  const supabase = getSupabaseBrowserClient();
  const TRIP_ID = await getTripId();
  const { error } = await supabase
    .from("hotels")
    .update(transformHotelToDb(hotel))
    .eq("trip_id", TRIP_ID)
    .eq("destination", destination);

  if (error) throw error;
}

export async function addMustDo(mustDo: MustDoItem) {
  const supabase = getSupabaseBrowserClient();
  const TRIP_ID = await getTripId();
  const { error} = await supabase.from("must_dos").insert({
    trip_id: TRIP_ID,
    ...transformMustDoToDb(mustDo),
  });

  if (error) throw error;
}

export async function updateMustDo(mustDoId: string, mustDo: Partial<MustDoItem>) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("must_dos")
    .update(transformMustDoToDb(mustDo))
    .eq("id", mustDoId);

  if (error) throw error;
}

export async function addMustDoComment(mustDoId: string, travelerId: string, text: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("must_do_comments").insert({
    must_do_id: mustDoId,
    traveler_id: travelerId,
    text,
  });

  if (error) throw error;
}

export async function updateTravelerAvatar(travelerId: string, avatarUrl: string) {
  console.log("[TripService] updateTravelerAvatar called with:");
  console.log("  - travelerId:", travelerId);
  console.log("  - avatarUrl length:", avatarUrl?.length || 0);
  console.log("  - avatarUrl preview:", avatarUrl?.substring(0, 100) + "...");

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("travelers")
    .update({ avatar: avatarUrl })
    .eq("id", travelerId)
    .select();

  console.log("[TripService] Supabase response:");
  console.log("  - data:", data);
  console.log("  - error:", error);

  if (error) {
    console.error("[TripService] Error details:");
    console.error("  - message:", error.message);
    console.error("  - code:", error.code);
    console.error("  - details:", error.details);
    console.error("  - hint:", error.hint);
    throw error;
  }

  console.log("[TripService] ✓ Avatar updated successfully");
  return data;
}

// Get daily visual map for a specific day
export async function getDailyMap(dayId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("daily_visual_maps")
    .select("*")
    .eq("day_id", dayId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned, which is expected if map doesn't exist yet
    throw error;
  }

  return data;
}

// Save or update daily visual map
export async function saveDailyMap(mapData: {
  day_id: string;
  trip_id: string;
  image_url: string;
  prompt_used: string;
  is_fallback: boolean;
  generated_by_traveler_id?: string | null;
}) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("daily_visual_maps")
    .upsert(mapData, { onConflict: "day_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper to parse time strings (handles both 12-hour and 24-hour formats)
function parseTimeToMinutes(timeStr: string | null | undefined): number {
  if (!timeStr) return 9999; // Put activities without time at the end

  // Handle 24-hour format (e.g., "22:02")
  const time24Match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (time24Match) {
    const hours = parseInt(time24Match[1]);
    const minutes = parseInt(time24Match[2]);
    return hours * 60 + minutes;
  }

  // Handle 12-hour format (e.g., "8:30 PM", "12:00 PM")
  const time12Match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (time12Match) {
    let hours = parseInt(time12Match[1]);
    const minutes = parseInt(time12Match[2]);
    const period = time12Match[3].toUpperCase();

    // Convert to 24-hour
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  return 9999; // Unparseable times go at the end
}

// Transform functions from DB to app types
function transformDay(dbDay: any): DayItinerary {
  const activities = (dbDay.activities || [])
    .map(transformActivity)
    .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

  return {
    id: dbDay.id,
    date: dbDay.date,
    dayNumber: dbDay.day_number,
    dayOfWeek: dbDay.day_of_week || new Date(dbDay.date).toLocaleDateString('en-US', { weekday: 'long' }),
    destination: dbDay.destination,
    title: dbDay.title,
    activities,
  };
}

function transformActivity(dbActivity: any): Activity {
  return {
    id: dbActivity.id,
    name: dbActivity.name,
    type: dbActivity.type,
    time: dbActivity.time,
    duration: dbActivity.duration,
    description: dbActivity.description || "",
    address: dbActivity.address,
    bookingUrl: dbActivity.booking_url,
    priceRange: dbActivity.price_range,
    notes: dbActivity.notes,
    isBooked: dbActivity.is_booked,
    isMustDo: dbActivity.is_must_do,
    avgEntreePrice: dbActivity.avg_entree_price,
    popularItems: dbActivity.popular_items,
    cuisine: dbActivity.cuisine,
    reservationRequired: dbActivity.reservation_required,
    availabilityStatus: dbActivity.availability_status,
    imageUrl: dbActivity.image_url,
    confirmationNumber: dbActivity.confirmation_number,
    attendees: dbActivity.attendees,
    screenshotUrl: dbActivity.screenshot_url,
  };
}

function transformFlight(dbFlight: any): Flight {
  return {
    id: dbFlight.id,
    date: dbFlight.date,
    departureTime: dbFlight.departure_time,
    arrivalTime: dbFlight.arrival_time,
    from: dbFlight.from_city,
    fromCode: dbFlight.from_code,
    to: dbFlight.to_city,
    toCode: dbFlight.to_code,
    airline: dbFlight.airline,
    flightNumber: dbFlight.flight_number,
    notes: dbFlight.notes,
    confirmationNumber: dbFlight.confirmation_number,
    travelers: dbFlight.travelers,
    screenshotUrl: dbFlight.screenshot_url,
    isPersonal: dbFlight.is_personal,
  };
}

function transformHotel(dbHotel: any): Hotel {
  return {
    id: dbHotel.id,
    destination: dbHotel.destination,
    name: dbHotel.name,
    address: dbHotel.address,
    checkIn: dbHotel.check_in,
    checkOut: dbHotel.check_out,
    bookingUrl: dbHotel.booking_url,
    notes: dbHotel.notes,
  };
}

function transformTraveler(dbTraveler: any): Traveler {
  return {
    id: dbTraveler.id,
    name: dbTraveler.name,
    avatar: dbTraveler.avatar,
    color: dbTraveler.color,
  };
}

function transformMustDo(dbMustDo: any): MustDoItem {
  return {
    id: dbMustDo.id,
    travelerId: dbMustDo.traveler_id,
    name: dbMustDo.name,
    type: dbMustDo.type,
    destination: dbMustDo.destination,
    description: dbMustDo.description,
    address: dbMustDo.address,
    bookingUrl: dbMustDo.booking_url,
    priceRange: dbMustDo.price_range,
    notes: dbMustDo.notes,
    votes: dbMustDo.votes || [],
    comments: (dbMustDo.comments || []).map((c: any) => ({
      id: c.id,
      travelerId: c.traveler_id,
      text: c.text,
      timestamp: new Date(c.created_at).getTime(),
    })),
    addedToItinerary: dbMustDo.added_to_itinerary,
    addedToDay: dbMustDo.added_to_day,
  };
}

function transformSavedPlace(dbPlace: any): SavedPlace {
  return {
    id: dbPlace.id,
    name: dbPlace.name,
    type: dbPlace.type,
    destination: dbPlace.destination,
    description: dbPlace.description,
    address: dbPlace.address,
    bookingUrl: dbPlace.booking_url,
    priceRange: dbPlace.price_range,
    notes: dbPlace.notes,
    category: dbPlace.category,
    avgEntreePrice: dbPlace.avg_entree_price,
    popularItems: dbPlace.popular_items,
    cuisine: dbPlace.cuisine,
    reservationRequired: dbPlace.reservation_required,
    availabilityStatus: dbPlace.availability_status,
    imageUrl: dbPlace.image_url,
  };
}

// Transform functions from app types to DB
function transformActivityToDb(activity: Activity) {
  return {
    // NOTE: id is omitted - let database auto-generate UUIDs
    name: activity.name,
    type: activity.type,
    time: activity.time,
    duration: activity.duration,
    description: activity.description,
    address: activity.address,
    booking_url: activity.bookingUrl,
    price_range: activity.priceRange,
    notes: activity.notes,
    is_booked: activity.isBooked,
    is_must_do: activity.isMustDo,
    avg_entree_price: activity.avgEntreePrice,
    popular_items: activity.popularItems,
    cuisine: activity.cuisine,
    reservation_required: activity.reservationRequired,
    availability_status: activity.availabilityStatus,
    image_url: activity.imageUrl,
    confirmation_number: activity.confirmationNumber,
    attendees: activity.attendees,
    screenshot_url: activity.screenshotUrl,
  };
}

function transformActivityFromDb(data: any): Activity {
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    time: data.time,
    duration: data.duration,
    description: data.description,
    address: data.address,
    bookingUrl: data.booking_url,
    priceRange: data.price_range,
    notes: data.notes,
    isBooked: data.is_booked || false,
    isMustDo: data.is_must_do || false,
    avgEntreePrice: data.avg_entree_price,
    popularItems: data.popular_items || [],
    cuisine: data.cuisine,
    reservationRequired: data.reservation_required,
    availabilityStatus: data.availability_status,
    imageUrl: data.image_url,
    confirmationNumber: data.confirmation_number,
    attendees: data.attendees || [],
    screenshotUrl: data.screenshot_url,
  };
}

function transformFlightToDb(flight: Partial<Flight>) {
  const dbFlight: any = {
    // NOTE: id omitted for inserts (DB auto-generates), included for updates
    date: flight.date,
    departure_time: flight.departureTime,
    arrival_time: flight.arrivalTime,
    from_city: flight.from,
    from_code: flight.fromCode,
    to_city: flight.to,
    to_code: flight.toCode,
    airline: flight.airline,
    flight_number: flight.flightNumber,
    notes: flight.notes,
    confirmation_number: flight.confirmationNumber,
    travelers: flight.travelers,
    screenshot_url: flight.screenshotUrl,
    is_personal: flight.isPersonal,
  };

  // Only include id if it exists (for updates, not inserts)
  if (flight.id) {
    dbFlight.id = flight.id;
  }

  return dbFlight;
}

function transformFlightFromDb(data: any): Flight {
  return {
    id: data.id,
    date: data.date,
    departureTime: data.departure_time,
    arrivalTime: data.arrival_time,
    from: data.from_city,
    fromCode: data.from_code,
    to: data.to_city,
    toCode: data.to_code,
    airline: data.airline,
    flightNumber: data.flight_number,
    notes: data.notes,
    confirmationNumber: data.confirmation_number,
    travelers: data.travelers || [],
    screenshotUrl: data.screenshot_url,
    isPersonal: data.is_personal || false,
  };
}

function transformHotelToDb(hotel: Partial<Hotel>) {
  return {
    name: hotel.name,
    address: hotel.address,
    destination: hotel.destination,
    check_in: hotel.checkIn,
    check_out: hotel.checkOut,
    booking_url: hotel.bookingUrl,
    notes: hotel.notes,
  };
}

function transformMustDoToDb(mustDo: Partial<MustDoItem>) {
  return {
    traveler_id: mustDo.travelerId,
    name: mustDo.name,
    type: mustDo.type,
    destination: mustDo.destination,
    description: mustDo.description,
    address: mustDo.address,
    booking_url: mustDo.bookingUrl,
    price_range: mustDo.priceRange,
    notes: mustDo.notes,
    votes: mustDo.votes,
    added_to_itinerary: mustDo.addedToItinerary,
    added_to_day: mustDo.addedToDay,
  };
}
