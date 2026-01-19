-- Create trips table
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Copenhagen & Reykjavik Trip',
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create travelers table
create table if not exists public.travelers (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  name text not null,
  avatar text,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create days table
create table if not exists public.days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  date date not null,
  day_number integer not null,
  destination text not null check (destination in ('copenhagen', 'reykjavik')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create activities table
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references public.days(id) on delete cascade,
  name text not null,
  type text not null,
  time text,
  duration text,
  description text not null,
  address text,
  booking_url text,
  price_range text,
  notes text,
  is_booked boolean default false,
  is_must_do boolean default false,
  avg_entree_price numeric,
  popular_items text[],
  cuisine text,
  reservation_required boolean,
  availability_status text,
  image_url text,
  confirmation_number text,
  attendees uuid[],
  screenshot_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create flights table
create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  date date not null,
  departure_time text not null,
  arrival_time text not null,
  from_city text not null,
  from_code text not null,
  to_city text not null,
  to_code text not null,
  airline text,
  flight_number text,
  notes text,
  confirmation_number text,
  travelers uuid[],
  screenshot_url text,
  is_personal boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create hotels table
create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  name text not null,
  address text not null,
  destination text not null check (destination in ('copenhagen', 'reykjavik')),
  check_in date not null,
  check_out date not null,
  booking_url text,
  confirmation_number text,
  amenities text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create must_dos table
create table if not exists public.must_dos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  traveler_id uuid references public.travelers(id) on delete cascade,
  name text not null,
  type text not null,
  destination text not null check (destination in ('copenhagen', 'reykjavik')),
  description text,
  address text,
  booking_url text,
  price_range text,
  notes text,
  votes uuid[],
  added_to_itinerary boolean default false,
  added_to_day date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create must_do_comments table
create table if not exists public.must_do_comments (
  id uuid primary key default gen_random_uuid(),
  must_do_id uuid references public.must_dos(id) on delete cascade,
  traveler_id uuid references public.travelers(id) on delete cascade,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create saved_places table
create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  name text not null,
  type text not null,
  destination text not null check (destination in ('copenhagen', 'reykjavik')),
  description text,
  address text,
  booking_url text,
  price_range text,
  notes text,
  category text not null,
  avg_entree_price numeric,
  popular_items text[],
  cuisine text,
  reservation_required boolean,
  availability_status text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security on all tables
alter table public.trips enable row level security;
alter table public.travelers enable row level security;
alter table public.days enable row level security;
alter table public.activities enable row level security;
alter table public.flights enable row level security;
alter table public.hotels enable row level security;
alter table public.must_dos enable row level security;
alter table public.must_do_comments enable row level security;
alter table public.saved_places enable row level security;

-- Create RLS policies (allow all authenticated users to read/write for now)
-- In production, you'd want more granular policies
create policy "Allow all authenticated users full access to trips"
  on public.trips for all
  using (true)
  with check (true);

create policy "Allow all authenticated users full access to travelers"
  on public.travelers for all
  using (true)
  with check (true);

create policy "Allow all authenticated users full access to days"
  on public.days for all
  using (true)
  with check (true);

create policy "Allow all authenticated users full access to activities"
  on public.activities for all
  using (true)
  with check (true);

create policy "Allow all authenticated users full access to flights"
  on public.flights for all
  using (true)
  with check (true);

create policy "Allow all authenticated users full access to hotels"
  on public.hotels for all
  using (true)
  with check (true);

create policy "Allow all authenticated users full access to must_dos"
  on public.must_dos for all
  using (true)
  with check (true);

create policy "Allow all authenticated users full access to must_do_comments"
  on public.must_do_comments for all
  using (true)
  with check (true);

create policy "Allow all authenticated users full access to saved_places"
  on public.saved_places for all
  using (true)
  with check (true);

-- Create indexes for better query performance
create index if not exists idx_days_trip_id on public.days(trip_id);
create index if not exists idx_days_date on public.days(date);
create index if not exists idx_activities_day_id on public.activities(day_id);
create index if not exists idx_flights_trip_id on public.flights(trip_id);
create index if not exists idx_hotels_trip_id on public.hotels(trip_id);
create index if not exists idx_must_dos_trip_id on public.must_dos(trip_id);
create index if not exists idx_must_dos_traveler_id on public.must_dos(traveler_id);
create index if not exists idx_saved_places_trip_id on public.saved_places(trip_id);
