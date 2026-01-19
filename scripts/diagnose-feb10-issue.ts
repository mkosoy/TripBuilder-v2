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

async function diagnose() {
  console.log('\n🔍 Diagnosing Feb 10 Booking Issue:\n');
  
  // Get all days with their array positions
  const { data: days } = await supabase
    .from('days')
    .select('id, date, day_number, title')
    .order('date');
  
  if (days) {
    console.log('Days array (as loaded from database):');
    days.forEach((day, index) => {
      console.log(`  [${index}] ${day.date} → Day ${day.day_number}: ${day.title}`);
    });
    
    // Simulate what happens when user selects Feb 10
    const bookingDate = '2026-02-10';
    const dayIndex = days.findIndex((d) => d.date === bookingDate);
    
    console.log(`\n📍 When user selects ${bookingDate}:`);
    console.log(`  findIndex result: ${dayIndex}`);
    
    if (dayIndex !== -1) {
      const matchedDay = days[dayIndex];
      console.log(`  Matched day: Day ${matchedDay.day_number} - ${matchedDay.date}`);
      console.log(`  ✅ This is CORRECT - booking should go to Day ${matchedDay.day_number}`);
    } else {
      console.log(`  ❌ No matching day found!`);
    }
    
    // Check what day the user THINKS they see
    console.log(`\n🤔 Hypothesis: User sees Feb 10 booking on Feb 8`);
    const feb8 = days.find(d => d.date === '2026-02-08');
    const feb10 = days.find(d => d.date === '2026-02-10');
    
    if (feb8 && feb10) {
      console.log(`  Feb 8 is Day ${feb8.day_number}`);
      console.log(`  Feb 10 is Day ${feb10.day_number}`);
      console.log(`  Offset: ${feb10.day_number - feb8.day_number} days`);
    }
  }
}

diagnose().catch(console.error);
