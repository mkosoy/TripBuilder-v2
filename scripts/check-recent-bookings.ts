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

async function checkRecentBookings() {
  console.log('\n📋 Recent Bookings (last 5):\n');

  // Get recent activities
  const { data: activities } = await supabase
    .from('activities')
    .select('*, days!inner(date, day_number, title)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (activities && activities.length > 0) {
    activities.forEach(a => {
      const day = a.days;
      console.log(`\n📍 ${a.name} (${a.type})`);
      console.log(`   ID: ${a.id}`);
      console.log(`   Time: ${a.time || 'No time'}`);
      console.log(`   Day: Day ${day.day_number} - ${day.date}`);
      console.log(`   Confirmation: ${a.confirmation_number || 'None'}`);
      if (a.attendees && a.attendees.length > 0) {
        console.log(`   Attendees: ${a.attendees.length} person(s)`);
      }
    });
  }

  console.log('\n');
}

checkRecentBookings().catch(console.error);
