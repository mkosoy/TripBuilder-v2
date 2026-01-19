#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local file
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  console.log('\n📊 Database Status:\n');

  const { data: trips } = await supabase.from('trips').select('*');
  console.log(`Trips: ${trips?.length || 0}`);
  if (trips && trips.length > 0) {
    console.log(`  Trip ID: ${trips[0].id}`);
    console.log(`  Name: ${trips[0].name}`);
  }

  const { data: days } = await supabase.from('days').select('*').order('day_number');
  console.log(`\nDays: ${days?.length || 0}`);
  if (days) {
    days.forEach(d => console.log(`  Day ${d.day_number}: ${d.title} (${d.date})`));
  }

  const { data: activities } = await supabase.from('activities').select('*');
  console.log(`\nActivities: ${activities?.length || 0}`);
  if (activities) {
    activities.forEach(a => console.log(`  - ${a.name} (${a.type})`));
  }

  const { data: flights } = await supabase.from('flights').select('*');
  console.log(`\nFlights: ${flights?.length || 0}`);
  if (flights) {
    flights.forEach(f => console.log(`  - ${f.from_city} → ${f.to_city} (${f.date})`));
  }
}

checkData().catch(console.error);
