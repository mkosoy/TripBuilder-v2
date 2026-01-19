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

async function fixDayZeroTitle() {
  console.log('\n🔧 Fixing Day 0 title...\n');
  
  const { data: day0, error } = await supabase
    .from('days')
    .update({ title: 'Travel Day' })
    .eq('day_number', 0)
    .select()
    .single();
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('✅ Day 0 title updated:');
    console.log(`   Old: "Day 0: Travel Day"`);
    console.log(`   New: "${day0.title}"`);
  }
}

fixDayZeroTitle().catch(console.error);
