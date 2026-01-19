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

async function checkFeb11() {
  console.log('\n🔍 Checking Feb 9 and Feb 11 activities:\n');

  const { data: days } = await supabase
    .from('days')
    .select('id, date, day_number, title')
    .in('date', ['2026-02-09', '2026-02-11'])
    .order('date');

  if (days) {
    for (const day of days) {
      console.log(`\n📅 ${day.date} - Day ${day.day_number}: ${day.title}`);
      
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('day_id', day.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (activities && activities.length > 0) {
        console.log(`   Recent activities:`);
        activities.forEach(a => {
          console.log(`   - ${a.name} (${a.type}) at ${a.time || 'no time'}`);
        });
      }
    }
  }
}

checkFeb11().catch(console.error);
