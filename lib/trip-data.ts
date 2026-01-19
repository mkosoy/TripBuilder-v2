export type ActivityType =
  | "food"
  | "attraction"
  | "tour"
  | "transport"
  | "accommodation"
  | "nightlife"
  | "shopping"
  | "relaxation"
  | "nature";

export type Destination = "copenhagen" | "reykjavik";

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  time?: string;
  duration?: string;
  description: string;
  address?: string;
  bookingUrl?: string;
  priceRange?: "$" | "$$" | "$$$" | "$$$$";
  notes?: string;
  isBooked?: boolean;
  isMustDo?: boolean;
  // Restaurant-specific fields
  avgEntreePrice?: number; // In USD
  popularItems?: string[];
  cuisine?: string;
  reservationRequired?: boolean;
  availabilityStatus?: "available" | "limited" | "full" | "unknown";
  imageUrl?: string;
  // Booking fields
  confirmationNumber?: string;
  attendees?: string[]; // traveler IDs who are attending this activity
  screenshotUrl?: string;
}

export interface DayItinerary {
  id?: string;
  date: string;
  dayNumber?: number;
  dayOfWeek: string;
  title: string;
  destination: Destination;
  activities: Activity[];
}

export interface Flight {
  id: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  airline?: string;
  flightNumber?: string;
  notes?: string;
  confirmationNumber?: string;
  travelers?: string[]; // traveler IDs
  screenshotUrl?: string;
  isPersonal?: boolean; // true if uploaded by user vs shared group flight
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  destination: Destination;
  amenities?: string[];
  bookingUrl?: string;
  notes?: string;
}

export interface SavedPlace {
  id: string;
  name: string;
  type: ActivityType;
  destination: Destination;
  description?: string;
  address?: string;
  bookingUrl?: string;
  priceRange?: "$" | "$$" | "$$$" | "$$$$";
  notes?: string;
  category: "restaurant" | "bar" | "cafe" | "attraction" | "tour" | "other";
  // Restaurant-specific fields
  avgEntreePrice?: number;
  popularItems?: string[];
  cuisine?: string;
  reservationRequired?: boolean;
  availabilityStatus?: "available" | "limited" | "full" | "unknown";
  imageUrl?: string;
}

export interface Traveler {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

export interface MustDoComment {
  id: string;
  travelerId: string;
  text: string;
  timestamp: number;
}

export interface MustDoItem {
  id: string;
  travelerId: string;
  name: string;
  type: ActivityType;
  destination: Destination;
  description?: string;
  address?: string;
  bookingUrl?: string;
  priceRange?: "$" | "$$" | "$$$" | "$$$$";
  notes?: string;
  votes: string[]; // array of traveler IDs who voted
  comments: MustDoComment[];
  addedToItinerary?: boolean;
  addedToDay?: string; // date string if added
}

export interface DailyVisualMap {
  id: string;
  day_id: string;
  trip_id: string;
  image_url: string;
  prompt_used: string;
  generated_at: string;
  generated_by_traveler_id: string | null;
  is_fallback: boolean;
  generation_attempt: number;
}

export const travelers: Traveler[] = [
  {
    id: "traveler-1",
    name: "Mark",
    avatar: "/images/image.png",
    color: "oklch(0.45 0.15 250)",
  },
  {
    id: "traveler-2",
    name: "Kylie",
    avatar: "/images/image.png",
    color: "oklch(0.55 0.18 180)",
  },
  {
    id: "traveler-3",
    name: "Derek",
    avatar: "/images/image.png",
    color: "oklch(0.65 0.12 50)",
  },
  {
    id: "traveler-4",
    name: "Julia",
    avatar: "/images/image.png",
    color: "oklch(0.60 0.15 320)",
  },
];

export const flights: Flight[] = [
  {
    id: "flight-1",
    date: "2026-02-07",
    departureTime: "TBD",
    arrivalTime: "12:00 PM",
    from: "San Francisco",
    fromCode: "SFO",
    to: "Copenhagen",
    toCode: "CPH",
    notes: "Arriving at noon - take Metro to Norreport Station (~15 min)",
  },
];

export const initialMustDos: MustDoItem[] = [
  {
    id: "mustdo-1",
    travelerId: "traveler-1",
    name: "Try Icelandic Hot Dogs at Bæjarins Beztu",
    type: "food",
    destination: "reykjavik",
    description: "Famous hot dog stand frequented by Bill Clinton",
    address: "Tryggvagata 1, Reykjavik",
    priceRange: "$",
    votes: ["traveler-1", "traveler-2"],
    comments: [
      {
        id: "comment-1",
        travelerId: "traveler-2",
        text: "Must get one with everything!",
        timestamp: Date.now() - 86400000,
      },
    ],
    addedToItinerary: false,
  },
  {
    id: "mustdo-2",
    travelerId: "traveler-2",
    name: "Visit Harpa Concert Hall",
    type: "attraction",
    destination: "reykjavik",
    description: "Stunning glass architecture by the harbor",
    bookingUrl: "https://www.harpa.is/en",
    priceRange: "$",
    votes: ["traveler-2", "traveler-3", "traveler-4"],
    comments: [],
    addedToItinerary: false,
  },
  {
    id: "mustdo-3",
    travelerId: "traveler-3",
    name: "Northern Lights Photography Tour",
    type: "tour",
    destination: "reykjavik",
    description: "Professional photography tour to capture the Aurora",
    bookingUrl: "https://www.guidetoiceland.is/",
    priceRange: "$$$",
    votes: ["traveler-1", "traveler-3"],
    comments: [
      {
        id: "comment-2",
        travelerId: "traveler-1",
        text: "Check the aurora forecast first - need clear skies!",
        timestamp: Date.now() - 172800000,
      },
    ],
    addedToItinerary: false,
  },
  {
    id: "mustdo-4",
    travelerId: "traveler-4",
    name: "Paper Island Food Hall",
    type: "food",
    destination: "copenhagen",
    description: "Street food market on Papirøen",
    address: "Trangravsvej 14, Copenhagen",
    priceRange: "$$",
    votes: ["traveler-1", "traveler-4"],
    comments: [],
    addedToItinerary: false,
  },
  {
    id: "mustdo-5",
    travelerId: "traveler-1",
    name: "Perlan Museum & Observation Deck",
    type: "attraction",
    destination: "reykjavik",
    description: "Iceland museum with panoramic city views and planetarium",
    bookingUrl: "https://perlan.is/",
    priceRange: "$$",
    votes: ["traveler-1", "traveler-2", "traveler-3"],
    comments: [],
    addedToItinerary: false,
  },
];

export const hotels: Hotel[] = [
  {
    id: "hotel-copenhagen-1",
    name: "25hours Hotel Indre By",
    address: "Pilestrade 65, DK-1112 Copenhagen K",
    phone: "+45 70 77 07 07",
    checkIn: "2026-02-07",
    checkOut: "2026-02-10",
    destination: "copenhagen",
    amenities: [
      "NENI Restaurant",
      "Boilerman Bar",
      "Free bikes",
      "Sauna",
      "Fitness",
    ],
    bookingUrl: "https://www.25hours-hotels.com/en/hotels/copenhagen/indre-by",
  },
  {
    id: "hotel-reykjavik-1",
    name: "25hours Hotel Indre By",
    address: "Reykjavik Location",
    checkIn: "2026-02-10",
    checkOut: "2026-02-18",
    destination: "reykjavik",
    bookingUrl: "https://www.25hours-hotels.com/",
  },
];

export const savedPlaces: SavedPlace[] = [
  // Reykjavik Restaurants
  {
    id: "rk-r-1",
    name: "Skal",
    type: "food",
    destination: "reykjavik",
    category: "restaurant",
    description: "Great for lamb and Negroni at the Food Market",
    priceRange: "$$",
    avgEntreePrice: 32,
    popularItems: ["Icelandic Lamb", "Negroni", "Fish Stew"],
    cuisine: "Icelandic",
    reservationRequired: false,
    availabilityStatus: "available",
  },
  {
    id: "rk-r-2",
    name: "Seabaron",
    type: "food",
    destination: "reykjavik",
    category: "restaurant",
    description: "Famous seafood spot",
    priceRange: "$$",
    bookingUrl: "https://www.saegreifinn.is/",
    avgEntreePrice: 28,
    popularItems: ["Lobster Soup", "Grilled Seafood Skewers", "Fish & Chips"],
    cuisine: "Seafood",
    reservationRequired: false,
    availabilityStatus: "available",
  },
  {
    id: "rk-r-3",
    name: "Brut",
    type: "food",
    destination: "reykjavik",
    category: "restaurant",
    description: "Upscale seafood",
    priceRange: "$$$",
  },
  {
    id: "rk-r-4",
    name: "Fish Market (Fiskmarkaourinn)",
    type: "food",
    destination: "reykjavik",
    category: "restaurant",
    description: "Icelandic fresh fish restaurant",
    priceRange: "$$$",
    bookingUrl: "https://www.fiskmarkadurinn.is/",
    avgEntreePrice: 48,
    popularItems: ["Tasting Menu", "Arctic Char", "Monkfish"],
    cuisine: "Fine Dining Seafood",
    reservationRequired: true,
    availabilityStatus: "limited",
  },
  {
    id: "rk-r-5",
    name: "Baka Baka",
    type: "food",
    destination: "reykjavik",
    category: "restaurant",
    description: "Best pizza in Reykjavik",
    priceRange: "$$",
  },
  {
    id: "rk-r-6",
    name: "Cafe Loki",
    type: "food",
    destination: "reykjavik",
    category: "restaurant",
    description:
      "Try fermented shark! Mash in mouth for 6 bites then brenevin. Get lamb shank & mashed potatoes",
    priceRange: "$$",
    isMustDo: true,
    bookingUrl: "https://www.lokirestaurant.is/",
    avgEntreePrice: 25,
    popularItems: ["Fermented Shark", "Lamb Shank with Mashed Potatoes", "Icelandic Meat Soup"],
    cuisine: "Traditional Icelandic",
    reservationRequired: false,
    availabilityStatus: "available",
  },
  {
    id: "rk-r-7",
    name: "Le Kock",
    type: "food",
    destination: "reykjavik",
    category: "restaurant",
    description: "Best burger spot",
    priceRange: "$$",
  },
  // Reykjavik Bars
  {
    id: "rk-b-1",
    name: "Skuli Craft Bar",
    type: "nightlife",
    destination: "reykjavik",
    category: "bar",
    description: "Icelandic craft beer selection",
    priceRange: "$$",
  },
  {
    id: "rk-b-2",
    name: "Jungle Bar",
    type: "nightlife",
    destination: "reykjavik",
    category: "bar",
    description: "Great cocktail bar",
    priceRange: "$$",
  },
  {
    id: "rk-b-3",
    name: "Ox",
    type: "nightlife",
    destination: "reykjavik",
    category: "bar",
    description: "Speakeasy vibes",
    priceRange: "$$$",
  },
  {
    id: "rk-b-4",
    name: "Vinstukan Tiu Bar",
    type: "nightlife",
    destination: "reykjavik",
    category: "bar",
    description: "Speakeasy wine bar",
    priceRange: "$$$",
  },
  // Reykjavik Cafes
  {
    id: "rk-c-1",
    name: "Brau & Co",
    type: "food",
    destination: "reykjavik",
    category: "cafe",
    description: "Best cinnamon rolls in Iceland",
    priceRange: "$",
    isMustDo: true,
  },
  {
    id: "rk-c-2",
    name: "Deig Bakery",
    type: "food",
    destination: "reykjavik",
    category: "cafe",
    description: "Try the creme brulee bagel!",
    priceRange: "$",
  },
  {
    id: "rk-c-3",
    name: "Kaffi Ole",
    type: "food",
    destination: "reykjavik",
    category: "cafe",
    description: "Best coffee in Reykjavik",
    priceRange: "$",
  },
  // Copenhagen additions
  {
    id: "cph-r-1",
    name: "Goldfinch",
    type: "food",
    destination: "copenhagen",
    category: "restaurant",
    description: "Casual Cantonese, ex-Geranium chef. Try scallop toast + cocktails",
    priceRange: "$$",
  },
  {
    id: "cph-r-2",
    name: "Nr.30",
    type: "food",
    destination: "copenhagen",
    category: "restaurant",
    description: "Hipster wine bar - must try confit potato/caviar dish",
    priceRange: "$$",
  },
  {
    id: "cph-r-3",
    name: "Barr",
    type: "food",
    destination: "copenhagen",
    category: "restaurant",
    description: "New Nordic comfort food, waterfront, great schnitzel, 20 craft beers",
    priceRange: "$$",
    bookingUrl: "https://restaurantbarr.com/",
  },
  {
    id: "cph-r-4",
    name: "Restaurant Schonnemann",
    type: "food",
    destination: "copenhagen",
    category: "restaurant",
    description: "Traditional smorrebrod institution since 1877",
    priceRange: "$$",
    bookingUrl: "https://www.restaurantschonnemann.dk/",
  },
  {
    id: "cph-b-1",
    name: "Ruby",
    type: "nightlife",
    destination: "copenhagen",
    category: "bar",
    description: "World-class cocktail bar in unmarked building, 5 min from hotel",
    priceRange: "$$$",
  },
  {
    id: "cph-b-2",
    name: "Mikkeller & Friends",
    type: "nightlife",
    destination: "copenhagen",
    category: "bar",
    description: "Craft beer mecca - original location with rotating taps",
    priceRange: "$$",
  },
  {
    id: "cph-b-3",
    name: "Ved Stranden 10",
    type: "nightlife",
    destination: "copenhagen",
    category: "bar",
    description: "Wine bar by the canal",
    priceRange: "$$",
  },
];

export const itinerary: DayItinerary[] = [
  // DAY 0: TRAVEL DAY
  {
    date: "2026-02-06",
    dayNumber: 0,
    dayOfWeek: "Friday",
    title: "Travel Day",
    destination: "copenhagen",
    activities: [
      {
        id: "d0-1",
        name: "Depart for Copenhagen",
        type: "transport",
        time: "TBD",
        description: "Travel day - flights and connections",
      },
    ],
  },
  // COPENHAGEN - DAY 1
  {
    date: "2026-02-07",
    dayNumber: 1,
    dayOfWeek: "Saturday",
    title: "Arrival Day - Hygge & Explore",
    destination: "copenhagen",
    activities: [
      {
        id: "d1-1",
        name: "Arrive at Copenhagen Airport",
        type: "transport",
        time: "12:00 PM",
        description: "Land at CPH, take Metro to Norreport Station (~15 min, DKK 36)",
      },
      {
        id: "d1-2",
        name: "Check-in at 25hours Hotel",
        type: "accommodation",
        time: "3:00 PM",
        description: "Official check-in time, but try for early check-in",
        address: "Pilestrade 65, DK-1112 Copenhagen K",
      },
      {
        id: "d1-3",
        name: "Walk Stroget & Round Tower",
        type: "attraction",
        time: "2:00 PM",
        duration: "2-3 hours",
        description: "Walk the main pedestrian street (right outside hotel). Visit Rundetarn for panoramic views - closes 5 PM in winter",
        bookingUrl: "https://www.rundetaarn.dk/en/",
      },
      {
        id: "d1-4",
        name: "Torvehallerne Market",
        type: "food",
        time: "4:00 PM",
        description: "Great for snacks and coffee. Try Fastelavnsbolle pastry (February tradition!)",
        address: "Frederiksborggade 21",
      },
      {
        id: "d1-5",
        name: "Copenhagen Light Festival",
        type: "attraction",
        time: "6:30 PM",
        duration: "2-3 hours",
        description: "Festival runs Jan 30-Feb 22. Light installations glow 6:30-10:30 PM. Walk toward Nyhavn following the Light Trail",
        isMustDo: true,
        bookingUrl: "https://copenhagenlightfestival.org/",
      },
      {
        id: "d1-6",
        name: "Dinner",
        type: "food",
        time: "7:30 PM",
        description: "Options: Goldfinch (Cantonese), Nr.30 (wine bar), or NENI in hotel for easy first night",
        priceRange: "$$",
      },
      {
        id: "d1-7",
        name: "Night Out",
        type: "nightlife",
        time: "10:00 PM",
        description: "Ruby cocktail bar (unmarked, 5 min walk) or Copenhagen JazzHouse (Winter Jazz Festival is on!)",
      },
    ],
  },
  {
    date: "2026-02-08",
    dayNumber: 2,
    dayOfWeek: "Sunday",
    title: "Food Tour + Nightlife",
    destination: "copenhagen",
    activities: [
      {
        id: "d2-1",
        name: "Late Morning Coffee",
        type: "food",
        time: "9:00 AM",
        description: "Hart Bakery for best sourdough in Copenhagen (4 locations)",
      },
      {
        id: "d2-2",
        name: "Hidden Copenhagen Walking Tour",
        type: "tour",
        time: "11:00 AM",
        duration: "90 min",
        description: "Politically Incorrect Free Tours - Hidden Copenhagen. See Christiansborg, Parliament, Royal Library Gardens & more. Tips-based!",
        isMustDo: true,
        bookingUrl: "https://politicallyincorrectfreetours.com/hidden-copenhagen-tour",
        address: "Meet at Gammel Strand Metro Station",
      },
      {
        id: "d2-3",
        name: "Copenhagen Food Tour",
        type: "tour",
        time: "1:30 PM",
        duration: "3.5-4 hours",
        description: "Copenhagen Food Tours - 9 tastings: smorrebrod, organic hot dogs, beer, cheese, candy. Starts at Torvehallerne",
        priceRange: "$$$",
        bookingUrl: "https://foodtours.eu/copenhagen/",
        isMustDo: true,
      },
      {
        id: "d2-4",
        name: "Walk through Nyhavn",
        type: "attraction",
        time: "5:30 PM",
        description: "Colorful harbor - iconic Copenhagen photo spot. 15 min walk from food tour end",
      },
      {
        id: "d2-5",
        name: "Dinner at Barr",
        type: "food",
        time: "7:00 PM",
        description: "New Nordic comfort food, waterfront location, excellent schnitzel, 20 craft beers on tap",
        priceRange: "$$",
        bookingUrl: "https://restaurantbarr.com/",
      },
      {
        id: "d2-6",
        name: "Night Out",
        type: "nightlife",
        time: "10:00 PM",
        description: "Start at Ved Stranden 10 (wine bar by canal), then Rust in Norrebro (3 floors, indie/electronic)",
      },
    ],
  },
  {
    date: "2026-02-09",
    dayNumber: 3,
    dayOfWeek: "Monday",
    title: "Canal Tour + Museums",
    destination: "copenhagen",
    activities: [
      {
        id: "d3-1",
        name: "Canal Tour",
        type: "tour",
        time: "10:00 AM",
        duration: "1 hour",
        description: "Stromma Classic Canal Tour - heated boats, live guide. See Little Mermaid, Opera House, Amalienborg from water. DKK 120",
        bookingUrl: "https://www.stromma.com/en-dk/copenhagen/",
        isMustDo: true,
      },
      {
        id: "d3-2",
        name: "Rosenborg Castle",
        type: "attraction",
        time: "12:00 PM",
        duration: "2 hours",
        description: "Royal jewels, crown regalia, beautiful Renaissance interiors",
        bookingUrl: "https://www.kongernessamling.dk/en/rosenborg/",
        priceRange: "$$",
      },
      {
        id: "d3-3",
        name: "Lunch at Schonnemann",
        type: "food",
        time: "2:00 PM",
        description: "Traditional smorrebrod institution since 1877",
        priceRange: "$$",
        bookingUrl: "https://www.restaurantschonnemann.dk/",
      },
      {
        id: "d3-4",
        name: "Christiania",
        type: "attraction",
        time: "4:00 PM",
        duration: "2 hours",
        description: "Autonomous hippie commune, unique experience. No photos on Pusher Street!",
      },
      {
        id: "d3-5",
        name: "Dinner",
        type: "food",
        time: "7:00 PM",
        description: "Options: Silberbauers Bistro (French, beef onglet) or Esmee (Modern French-Nordic)",
        priceRange: "$$",
      },
      {
        id: "d3-6",
        name: "Evening: Jazz & Cocktails",
        type: "nightlife",
        time: "9:00 PM",
        description: "Winter Jazz Festival venues or dinner cocktails at Lidkoeb (multi-floor, great cocktails)",
      },
    ],
  },
  {
    date: "2026-02-10",
    dayNumber: 4,
    dayOfWeek: "Tuesday",
    title: "Fly to Iceland + Sky Lagoon",
    destination: "reykjavik",
    activities: [
      {
        id: "d4-1",
        name: "Early Wake Up",
        type: "transport",
        time: "5:30 AM",
        description: "Leave hotel by 6 AM for airport. Metro Norreport to Airport (~15 min)",
      },
      {
        id: "d4-2",
        name: "Flight to Reykjavik",
        type: "transport",
        time: "8:15 AM",
        description: "SAS flight, 3.5 hours. Arrive 10:45 AM (gain 1 hour)",
      },
      {
        id: "d4-3",
        name: "Arrive Iceland & Check In",
        type: "accommodation",
        time: "12:00 PM",
        description: "Airport transfer to Reykjavik (~45 min). Check into 25hours Hotel",
      },
      {
        id: "d4-4",
        name: "Sky Lagoon",
        type: "relaxation",
        time: "2:00 PM",
        duration: "3 hours",
        description: "Infinity pool overlooking Atlantic, 7-step ritual. Perfect after overnight travel. 10 min from downtown",
        priceRange: "$$$",
        bookingUrl: "https://www.skylagoon.com/",
        isMustDo: true,
      },
      {
        id: "d4-5",
        name: "Light Dinner",
        type: "food",
        time: "6:30 PM",
        description: "Baejarins Beztu Pylsur (famous hot dogs - Bill Clinton ate here!) or Icelandic Street Food (lamb/fish soup, ~$15)",
        priceRange: "$",
      },
      {
        id: "d4-6",
        name: "Northern Lights Tour",
        type: "nature",
        time: "8:30 PM",
        duration: "4-5 hours",
        description: "Book for first night! Free rebooking if no lights. Returns ~1 AM. 2026 = final year of solar maximum = strongest aurora activity!",
        priceRange: "$$",
        bookingUrl: "https://guidetoiceland.is/book-holiday-trips/northern-lights-tours",
        isMustDo: true,
      },
    ],
  },
  {
    date: "2026-02-11",
    dayNumber: 5,
    dayOfWeek: "Wednesday",
    title: "Reykjavik Exploration",
    destination: "reykjavik",
    activities: [
      {
        id: "d5-1",
        name: "Brau & Co for Breakfast",
        type: "food",
        time: "9:00 AM",
        description: "Best cinnamon rolls in Iceland!",
        priceRange: "$",
        isMustDo: true,
      },
      {
        id: "d5-2",
        name: "Hallgrimskirkja Church",
        type: "attraction",
        time: "10:00 AM",
        description: "Iconic landmark, take the tower elevator for city views",
        bookingUrl: "https://www.hallgrimskirkja.is/",
      },
      {
        id: "d5-3",
        name: "Walk Skolavordustigur",
        type: "shopping",
        time: "11:00 AM",
        description: "Rainbow street with shops and cafes leading down from church",
      },
      {
        id: "d5-4",
        name: "Harpa Concert Hall & Sun Voyager",
        type: "attraction",
        time: "12:00 PM",
        description: "Modern architecture at Harpa, then Viking ship sculpture at harbor",
      },
      {
        id: "d5-5",
        name: "Cafe Loki for Lunch",
        type: "food",
        time: "1:00 PM",
        description: "Try fermented shark! Mash in mouth 6 bites then brenevin. Get lamb shank & mashed potatoes",
        priceRange: "$$",
        isMustDo: true,
      },
      {
        id: "d5-6",
        name: "Laugavegur Shopping",
        type: "shopping",
        time: "3:00 PM",
        description: "Main shopping street - Icelandic design, wool sweaters. Look for Lopapeysa at Handknitting Association",
      },
      {
        id: "d5-7",
        name: "Dinner at Skal",
        type: "food",
        time: "7:00 PM",
        description: "Food Market location - lamb and Negroni",
        priceRange: "$$",
      },
      {
        id: "d5-8",
        name: "Bar Hop on Laugavegur",
        type: "nightlife",
        time: "9:30 PM",
        description: "Skuli Craft Bar (Icelandic beer), Jungle Bar (cocktails), Ox (speakeasy)",
      },
    ],
  },
  {
    date: "2026-02-12",
    dayNumber: 6,
    dayOfWeek: "Thursday",
    title: "Golden Circle Day Trip",
    destination: "reykjavik",
    activities: [
      {
        id: "d6-1",
        name: "Golden Circle Tour Pickup",
        type: "tour",
        time: "8:00 AM",
        description: "Full day guided tour. Book in advance!",
        bookingUrl: "https://guidetoiceland.is/book-holiday-trips/golden-circle",
        isMustDo: true,
      },
      {
        id: "d6-2",
        name: "Thingvellir National Park",
        type: "nature",
        time: "9:30 AM",
        description: "UNESCO site - see where North American & Eurasian tectonic plates meet. Optional: Silfra Fissure snorkeling",
      },
      {
        id: "d6-3",
        name: "Geysir Geothermal Area",
        type: "nature",
        time: "11:30 AM",
        description: "Strokkur geyser erupts every 5-10 min. Steaming hot springs everywhere",
      },
      {
        id: "d6-4",
        name: "Lunch at Fridheimar Tomato Farm",
        type: "food",
        time: "1:00 PM",
        description: "Eat in a greenhouse surrounded by tomato plants. Unique experience!",
        priceRange: "$$",
        bookingUrl: "https://www.fridheimar.is/",
      },
      {
        id: "d6-5",
        name: "Gullfoss Waterfall",
        type: "nature",
        time: "2:30 PM",
        description: "Golden Falls - massive two-tier waterfall. Often partially frozen in February = stunning!",
        isMustDo: true,
      },
      {
        id: "d6-6",
        name: "Secret Lagoon (Optional)",
        type: "relaxation",
        time: "4:00 PM",
        description: "Natural hot spring in Fludir - less crowded than Blue Lagoon",
        priceRange: "$$",
        bookingUrl: "https://secretlagoon.is/",
      },
      {
        id: "d6-7",
        name: "Return to Reykjavik",
        type: "transport",
        time: "6:00 PM",
        description: "Back at hotel by evening",
      },
      {
        id: "d6-8",
        name: "Casual Dinner",
        type: "food",
        time: "7:30 PM",
        description: "Le Kock for burgers or Fish Market for seafood",
        priceRange: "$$",
      },
    ],
  },
  {
    date: "2026-02-13",
    dayNumber: 7,
    dayOfWeek: "Friday",
    title: "South Coast + Ice Cave",
    destination: "reykjavik",
    activities: [
      {
        id: "d7-1",
        name: "South Coast Tour Pickup",
        type: "tour",
        time: "8:00 AM",
        description: "Full day tour - THIS IS A MUST DO! Bring waterproof gear",
        bookingUrl: "https://guidetoiceland.is/book-holiday-trips/south-coast",
        isMustDo: true,
      },
      {
        id: "d7-2",
        name: "Seljalandsfoss Waterfall",
        type: "nature",
        time: "10:00 AM",
        description: "Walk BEHIND the waterfall! Stunning winter ice formations. Wear waterproof everything",
      },
      {
        id: "d7-3",
        name: "Skogafoss Waterfall",
        type: "nature",
        time: "11:30 AM",
        description: "Massive 60m drop. Climb stairs to top for incredible views",
      },
      {
        id: "d7-4",
        name: "Lunch in Vik",
        type: "food",
        time: "1:00 PM",
        description: "Southernmost village in Iceland. Cute shops and cafes",
        priceRange: "$",
      },
      {
        id: "d7-5",
        name: "Reynisfjara Black Sand Beach",
        type: "nature",
        time: "2:30 PM",
        description: "Basalt columns, dramatic sea stacks. DANGEROUS: Stay far from water - sneaker waves kill people here!",
        isMustDo: true,
      },
      {
        id: "d7-6",
        name: "Katla Ice Cave",
        type: "nature",
        time: "4:00 PM",
        duration: "2-3 hours",
        description: "Super Jeep onto Myrdalsjokull glacier. Blue ice cave exploration. Crampons + helmet provided. Most popular February activity!",
        isMustDo: true,
      },
      {
        id: "d7-7",
        name: "Return to Reykjavik",
        type: "transport",
        time: "7:00 PM",
        description: "You'll be exhausted but happy!",
      },
      {
        id: "d7-8",
        name: "Casual Dinner",
        type: "food",
        time: "8:30 PM",
        description: "Baka Baka for pizza or back to Baejarins Beztu for hot dogs",
        priceRange: "$",
      },
    ],
  },
  {
    date: "2026-02-14",
    dayNumber: 8,
    dayOfWeek: "Saturday",
    title: "Valentine's Day - Blue Lagoon",
    destination: "reykjavik",
    activities: [
      {
        id: "d8-1",
        name: "Blue Lagoon",
        type: "relaxation",
        time: "10:00 AM",
        duration: "3-4 hours",
        description: "Book Comfort Package: entrance, silica mask, towel, drink. Milky-blue geothermal spa in lava fields. BOOK 2-4 WEEKS AHEAD!",
        priceRange: "$$$",
        bookingUrl: "https://www.bluelagoon.com/",
        isMustDo: true,
      },
      {
        id: "d8-2",
        name: "Return & Rest",
        type: "accommodation",
        time: "2:00 PM",
        description: "Back to hotel, relax before Valentine's evening",
      },
      {
        id: "d8-3",
        name: "Walk Grandi Harbor Area",
        type: "attraction",
        time: "4:00 PM",
        description: "Near Harpa, explore the waterfront development",
      },
      {
        id: "d8-4",
        name: "Valentine's Dinner",
        type: "food",
        time: "7:30 PM",
        description: "Grillmarkadurinn for upscale sharing plates or Matur og Drykkur for modern Icelandic. Make reservations!",
        priceRange: "$$$",
      },
      {
        id: "d8-5",
        name: "Evening Drinks",
        type: "nightlife",
        time: "10:00 PM",
        description: "Vinstukan Tiu Bar (speakeasy wine) or Ox (speakeasy cocktails)",
        priceRange: "$$$",
      },
    ],
  },
  {
    date: "2026-02-15",
    dayNumber: 9,
    dayOfWeek: "Sunday",
    title: "Snaefellsnes Peninsula",
    destination: "reykjavik",
    activities: [
      {
        id: "d9-1",
        name: "Snaefellsnes Tour Pickup",
        type: "tour",
        time: "9:00 AM",
        description: "Full day - 'Iceland in Miniature' - has everything!",
        bookingUrl: "https://guidetoiceland.is/book-holiday-trips/snaefellsnes",
        isMustDo: true,
      },
      {
        id: "d9-2",
        name: "Kirkjufell Mountain",
        type: "nature",
        time: "11:00 AM",
        description: "Most photographed mountain in Iceland - you've seen it in Game of Thrones!",
        isMustDo: true,
      },
      {
        id: "d9-3",
        name: "Djupalonsandur Beach",
        type: "nature",
        time: "12:30 PM",
        description: "Black pebble beach with shipwreck remains",
      },
      {
        id: "d9-4",
        name: "Lunch in Stykkisholmur",
        type: "food",
        time: "1:30 PM",
        description: "Charming fishing village, grab lunch at local cafe",
        priceRange: "$",
      },
      {
        id: "d9-5",
        name: "Arnarstapi & Londrangar",
        type: "nature",
        time: "3:00 PM",
        description: "Coastal cliffs, rock formations, basalt cliffs",
      },
      {
        id: "d9-6",
        name: "Budakirkja Black Church",
        type: "attraction",
        time: "4:30 PM",
        description: "Iconic black church against the winter landscape - incredible photos",
      },
      {
        id: "d9-7",
        name: "Return to Reykjavik",
        type: "transport",
        time: "7:00 PM",
        description: "Long but amazing day",
      },
      {
        id: "d9-8",
        name: "Dinner Downtown",
        type: "food",
        time: "8:00 PM",
        description: "Seabaron for seafood soup or casual option of choice",
        priceRange: "$$",
      },
    ],
  },
  {
    date: "2026-02-16",
    dayNumber: 10,
    dayOfWeek: "Monday",
    title: "Free Day - Choose Your Adventure",
    destination: "reykjavik",
    activities: [
      {
        id: "d10-1",
        name: "Morning Coffee",
        type: "food",
        time: "9:00 AM",
        description: "Kaffi Ole - best coffee in Reykjavik. Or Deig Bakery for creme brulee bagel",
        priceRange: "$",
      },
      {
        id: "d10-2",
        name: "Option A: Whale Watching",
        type: "nature",
        time: "10:00 AM",
        duration: "3 hours",
        description: "3-hour tour from Old Harbor. Feb = orcas, humpbacks, minkes. Warm overalls provided",
        priceRange: "$$",
        bookingUrl: "https://specialtours.is/whale-watching/",
      },
      {
        id: "d10-3",
        name: "Option B: Reykjanes Peninsula",
        type: "nature",
        time: "10:00 AM",
        description: "Self-drive: Bridge Between Continents, Gunnuhver geothermal area, lighthouse",
      },
      {
        id: "d10-4",
        name: "Option C: Horseback Riding",
        type: "nature",
        time: "10:00 AM",
        duration: "2 hours",
        description: "Icelandic horses are adorable fluffballs in winter! Ride through lava fields",
        priceRange: "$$",
        bookingUrl: "https://www.ishestar.is/",
      },
      {
        id: "d10-5",
        name: "Option D: Relax & Explore",
        type: "relaxation",
        time: "10:00 AM",
        description: "Laugardalslaug local pool (hot tubs, sauna), National Museum, or wool sweater shopping",
      },
      {
        id: "d10-6",
        name: "Afternoon Shopping",
        type: "shopping",
        time: "3:00 PM",
        description: "Last chance for Lopapeysa sweaters and souvenirs on Laugavegur",
      },
      {
        id: "d10-7",
        name: "Final Northern Lights Attempt",
        type: "nature",
        time: "8:30 PM",
        description: "If you haven't seen them yet, try one more time! Check vedur.is for forecast",
        bookingUrl: "https://en.vedur.is/weather/forecasts/aurora/",
      },
    ],
  },
  {
    date: "2026-02-17",
    dayNumber: 11,
    dayOfWeek: "Tuesday",
    title: "Last Day in Iceland",
    destination: "reykjavik",
    activities: [
      {
        id: "d11-1",
        name: "Sleep In",
        type: "accommodation",
        time: "9:00 AM",
        description: "Enjoy a relaxed morning at the hotel",
      },
      {
        id: "d11-2",
        name: "Brunch",
        type: "food",
        time: "10:30 AM",
        description: "Promenade or your favorite spot from the trip",
        priceRange: "$$",
      },
      {
        id: "d11-3",
        name: "Last-minute Shopping/Exploring",
        type: "shopping",
        time: "12:00 PM",
        description: "Pick up any souvenirs you missed. Bonus supermarket for snacks for the flight home",
      },
      {
        id: "d11-4",
        name: "Perlan Museum",
        type: "attraction",
        time: "2:00 PM",
        duration: "2 hours",
        description: "Wonders of Iceland exhibits, observation deck - great way to end the trip",
        bookingUrl: "https://www.perlan.is/",
        priceRange: "$$",
      },
      {
        id: "d11-5",
        name: "Early Dinner",
        type: "food",
        time: "5:00 PM",
        description: "Light meal before packing up",
        priceRange: "$",
      },
      {
        id: "d11-6",
        name: "Pack & Prepare",
        type: "accommodation",
        time: "7:00 PM",
        description: "Early night - big travel day tomorrow",
      },
    ],
  },
  {
    date: "2026-02-18",
    dayNumber: 12,
    dayOfWeek: "Wednesday",
    title: "Departure Day",
    destination: "reykjavik",
    activities: [
      {
        id: "d12-1",
        name: "Check Out",
        type: "accommodation",
        time: "12:00 PM",
        description: "Check out of hotel, store luggage if needed",
      },
      {
        id: "d12-2",
        name: "Transfer to Airport",
        type: "transport",
        time: "2:00 PM",
        description: "Allow 45 min to Keflavik + 2-3 hours before international flight",
      },
      {
        id: "d12-3",
        name: "Flight: Reykjavik to Seattle",
        type: "transport",
        time: "5:00 PM",
        description: "Depart KEF",
      },
      {
        id: "d12-4",
        name: "Connection: Seattle to San Francisco",
        type: "transport",
        time: "7:41 PM",
        description: "Final leg home! Trip complete.",
      },
    ],
  },
];

export const alternativeActivities: Activity[] = [
  // Copenhagen alternatives
  {
    id: "alt-cph-1",
    name: "Copenhagen Light Festival Canal Tour",
    type: "tour",
    description: "Evening canal tour focused on light installations",
    bookingUrl: "https://www.stromma.com/en-dk/copenhagen/",
    priceRange: "$$",
  },
  {
    id: "alt-cph-2",
    name: "Carlsberg Brewery Tour",
    type: "tour",
    description: "Winter Brew Tour - history + beer tastings",
    bookingUrl: "https://www.visitcarlsberg.com/",
    priceRange: "$$",
  },
  {
    id: "alt-cph-3",
    name: "Tivoli Gardens",
    type: "attraction",
    description: "Historic amusement park (check if open in Feb)",
    bookingUrl: "https://www.tivoli.dk/en",
    priceRange: "$$",
  },
  {
    id: "alt-cph-4",
    name: "Design Museum Denmark",
    type: "attraction",
    description: "Danish design excellence",
    bookingUrl: "https://designmuseum.dk/en/",
    priceRange: "$",
  },
  // Iceland alternatives
  {
    id: "alt-rvk-1",
    name: "Silfra Snorkeling",
    type: "nature",
    description: "Snorkel between tectonic plates in crystal clear water",
    bookingUrl: "https://www.dive.is/",
    priceRange: "$$$",
  },
  {
    id: "alt-rvk-2",
    name: "Snowmobile on Glacier",
    type: "nature",
    description: "Snowmobile adventure on Langjokull glacier",
    bookingUrl: "https://guidetoiceland.is/book-holiday-trips/snowmobile-tours",
    priceRange: "$$$",
  },
  {
    id: "alt-rvk-3",
    name: "Volcano Helicopter Tour",
    type: "nature",
    description: "Aerial views of volcanic landscapes",
    priceRange: "$$$$",
  },
  {
    id: "alt-rvk-4",
    name: "Food Walk Reykjavik",
    type: "tour",
    description: "Wake Up Reykjavik Food Walk - 3-4 hours, 6-8 tastings",
    bookingUrl: "https://www.wakeupiceland.com/",
    priceRange: "$$",
  },
  {
    id: "alt-rvk-5",
    name: "Kerid Crater",
    type: "nature",
    description: "Volcanic crater lake - add to Golden Circle",
    priceRange: "$",
  },
  {
    id: "alt-rvk-6",
    name: "FlyOver Iceland",
    type: "attraction",
    description: "Virtual flight ride over Iceland - great for bad weather days",
    bookingUrl: "https://www.flyovericeland.com/",
    priceRange: "$$",
  },
];

// Export alias for backward compatibility
export const initialSavedPlaces = savedPlaces;
