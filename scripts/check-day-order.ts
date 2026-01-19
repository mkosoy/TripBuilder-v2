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

async function checkDayOrder() {
  console.log('\n🔍 Days in order from database:\n');

  const { data: days } = await supabase
    .from('days')
    .select('date, day_number, title')
    .order('date');

  if (days) {
    console.log('Ordered by date:');
    days.forEach((day, index) => {
      console.log(`  [${index}] ${day.date} → Day ${day.day_number}: ${day.title}`);
    });
    
    // Check what Day 4 is
    const day4 = days.find(d => d.day_number === 4);
    if (day4) {
      console.log(`\n📍 Day 4 in database:`);
      console.log(`   Date: ${day4.date}`);
      console.log(`   Title: ${day4.title}`);
    }
  }
}

checkDayOrder().catch(console.error);
