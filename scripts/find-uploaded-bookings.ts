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

async function findUploadedBookings() {
  console.log('\n🔍 User-Uploaded Bookings:\n');

  // Find activities with confirmation numbers (indicates uploaded booking)
  const { data: activities } = await supabase
    .from('activities')
    .select('*, days!inner(date, day_number, title)')
    .not('confirmation_number', 'is', null)
    .order('created_at', { ascending: false });

  if (activities && activities.length > 0) {
    console.log(`Found ${activities.length} uploaded booking(s):\n`);
    activities.forEach(a => {
      const day = a.days;
      console.log(`📍 ${a.name} (${a.type})`);
      console.log(`   Date: ${day.date} (Day ${day.day_number})`);
      console.log(`   Time: ${a.time || 'No time'}`);
      console.log(`   Confirmation: ${a.confirmation_number}`);
      console.log(`   Screenshot: ${a.screenshot_url || 'No screenshot'}`);
      console.log('');
    });
  } else {
    console.log('❌ No uploaded bookings found (no confirmation numbers)\n');
    
    // Check for activities named "Test" or similar
    const { data: testActivities } = await supabase
      .from('activities')
      .select('*, days!inner(date, day_number, title)')
      .or('name.ilike.%test%,name.ilike.%new booking%')
      .order('created_at', { ascending: false });
    
    if (testActivities && testActivities.length > 0) {
      console.log(`\nℹ️  Found ${testActivities.length} activity/activities with "test" in name:\n`);
      testActivities.forEach(a => {
        const day = a.days;
        console.log(`📍 ${a.name} (${a.type})`);
        console.log(`   Date: ${day.date} (Day ${day.day_number})`);
        console.log(`   Time: ${a.time || 'No time'}`);
        console.log(`   Is Booked: ${a.is_booked ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
  }
}

findUploadedBookings().catch(console.error);
