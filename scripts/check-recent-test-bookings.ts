#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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

async function checkRecentTests() {
  console.log('\n🔍 Recent "Test" bookings:\n');

  const { data: activities } = await supabase
    .from('activities')
    .select('id, name, time, day_id, created_at, days!inner(date, day_number, title)')
    .ilike('name', '%test%')
    .order('created_at', { ascending: false })
    .limit(5);

  if (activities) {
    activities.forEach(a => {
      const day = a.days;
      console.log(`📍 ${a.name}`);
      console.log(`   Time: ${a.time}`);
      console.log(`   Saved to: ${day.date} (Day ${day.day_number})`);
      console.log(`   Created: ${new Date(a.created_at).toLocaleString()}`);
      console.log('');
    });
  }
}

checkRecentTests().catch(console.error);
