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

async function checkLatestBooking() {
  console.log('\n🔍 Checking latest booking in database...\n');

  // Get the latest activity (most recent created_at)
  const { data: activities, error } = await supabase
    .from('activities')
    .select(`
      *,
      days (
        date,
        day_number,
        title
      )
    `)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (activities && activities.length > 0) {
    const activity = activities[0];
    console.log('Latest Activity:');
    console.log('  Name:', activity.name);
    console.log('  Type:', activity.type);
    console.log('  Time:', activity.time);
    console.log('  Created at:', activity.created_at);
    console.log('\nAssociated Day:');
    console.log('  Date:', activity.days?.date);
    console.log('  Day Number:', activity.days?.day_number);
    console.log('  Title:', activity.days?.title);
  } else {
    console.log('No activities found');
  }
}

checkLatestBooking().catch(console.error);
