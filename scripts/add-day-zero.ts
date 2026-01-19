#!/usr/bin/env tsx
/**
 * Migration: Add Day 0 (Travel Day - Feb 6, 2026)
 *
 * This adds the travel day as Day 0 so that:
 * - Feb 6 = Day 0 (travel day)
 * - Feb 7 = Day 1 (first full day)
 * - Feb 10 = Day 4
 *
 * When users select a booking date, it will match the displayed day correctly.
 */

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

async function addDayZero() {
  console.log('🔄 Adding Day 0 (Travel Day - Feb 6, 2026)...\n');

  // Get the trip ID
  const { data: trips, error: tripError } = await supabase
    .from('trips')
    .select('id')
    .limit(1);

  if (tripError || !trips || trips.length === 0) {
    console.error('❌ Error: No trip found');
    process.exit(1);
  }

  const tripId = trips[0].id;
  console.log(`Trip ID: ${tripId}`);

  // Check if Day 0 already exists
  const { data: existingDay } = await supabase
    .from('days')
    .select('id')
    .eq('trip_id', tripId)
    .eq('date', '2026-02-06')
    .single();

  if (existingDay) {
    console.log('ℹ️  Day 0 already exists, skipping migration');
    process.exit(0);
  }

  // Insert Day 0
  const { data: newDay, error: insertError } = await supabase
    .from('days')
    .insert({
      trip_id: tripId,
      date: '2026-02-06',
      day_number: 0,
      destination: 'copenhagen',
      title: 'Day 0: Travel Day',
      day_of_week: 'Friday',
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ Error adding Day 0:', insertError.message);
    process.exit(1);
  }

  console.log('✅ Day 0 added successfully!');
  console.log(`   ID: ${newDay.id}`);
  console.log(`   Date: ${newDay.date}`);
  console.log(`   Title: ${newDay.title}`);

  // Verify the current day structure
  console.log('\n📊 Current day structure:');
  const { data: allDays } = await supabase
    .from('days')
    .select('day_number, date, title')
    .eq('trip_id', tripId)
    .order('day_number');

  if (allDays) {
    allDays.forEach(d => {
      console.log(`   Day ${d.day_number}: ${d.date} - ${d.title}`);
    });
  }

  console.log('\n✅ Migration complete! Day 0 is now available.');
  console.log('   Feb 6 = Day 0 (travel day)');
  console.log('   Feb 7 = Day 1');
  console.log('   Feb 10 = Day 4');
}

addDayZero().catch(console.error);
