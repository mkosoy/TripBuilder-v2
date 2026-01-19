import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Checking database schema...\n');
  
  // Try to list tables
  const { data: trips } = await supabase.from('trips').select('count').limit(1);
  const { data: days } = await supabase.from('days').select('count').limit(1);
  const { data: flights } = await supabase.from('flights').select('count').limit(1);
  const { data: activities } = await supabase.from('activities').select('count').limit(1);
  
  console.log('Tables found:');
  console.log('- trips:', trips ? 'EXISTS' : 'NOT FOUND');
  console.log('- days:', days ? 'EXISTS' : 'NOT FOUND');
  console.log('- flights:', flights ? 'EXISTS' : 'NOT FOUND');
  console.log('- activities:', activities ? 'EXISTS' : 'NOT FOUND');
  
  if (trips) {
    const { count } = await supabase.from('trips').select('*', { count: 'exact', head: true });
    console.log(`\ntrips table has ${count} records`);
  }
}

main();
