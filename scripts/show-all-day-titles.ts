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

async function showAllDays() {
  console.log('\n📋 All Days (DB day_number vs title):\n');

  const { data: days } = await supabase
    .from('days')
    .select('date, day_number, title')
    .order('date');

  if (days) {
    days.forEach(d => {
      console.log(`${d.date} → day_number: ${d.day_number}, title: "${d.title}"`);
    });
  }
}

showAllDays().catch(console.error);
