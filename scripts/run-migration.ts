/**
 * Database Migration Runner
 * Runs the 002_add_day_metadata.sql migration
 */

import { createClient } from '@supabase/supabase-js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n═══════════════════════════════════════', 'cyan');
  log('  Running Database Migration', 'cyan');
  log('═══════════════════════════════════════\n', 'cyan');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log('Missing required environment variables:', 'red');
    if (!supabaseUrl) log('  - NEXT_PUBLIC_SUPABASE_URL', 'red');
    if (!supabaseServiceKey) log('  - SUPABASE_SERVICE_ROLE_KEY', 'red');
    log('\nAdd SUPABASE_SERVICE_ROLE_KEY to .env.local', 'yellow');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  log('Step 1: Add title column', 'cyan');
  const { error: error1 } = await supabase
    .from('days')
    .select('title')
    .limit(1);
  
  if (error1 && error1.message.includes('column "title" does not exist')) {
    log('Column title does not exist, migration needed', 'yellow');
    log('\nPlease run this SQL in Supabase Dashboard → SQL Editor:', 'yellow');
    log('\nALTER TABLE public.days ADD COLUMN IF NOT EXISTS title TEXT;', 'cyan');
    log('ALTER TABLE public.days ADD COLUMN IF NOT EXISTS day_of_week TEXT;', 'cyan');
    log('\nUPDATE public.days SET', 'cyan');
    log('  title = CONCAT(\'Day \', day_number),', 'cyan');
    log('  day_of_week = TO_CHAR(date, \'Day\')', 'cyan');
    log('WHERE title IS NULL OR day_of_week IS NULL;', 'cyan');
    log('\nALTER TABLE public.days', 'cyan');
    log('  ALTER COLUMN title SET NOT NULL,', 'cyan');
    log('  ALTER COLUMN day_of_week SET NOT NULL;', 'cyan');
    log('\n', 'reset');
  } else if (!error1) {
    log('✓ Columns already exist', 'green');
  }

  log('\nStep 2: Verify migration', 'cyan');
  const { data: days, error: error2 } = await supabase
    .from('days')
    .select('id, day_number, date, title, day_of_week')
    .limit(1);

  if (error2) {
    log(`✗ Verification failed: ${error2.message}`, 'red');
    process.exit(1);
  } else if (days && days.length > 0 && days[0].title && days[0].day_of_week) {
    log('✓ Migration verified successfully', 'green');
    log(`  Sample: ${days[0].title} (${days[0].day_of_week})`, 'green');
  } else {
    log('⚠ Migration incomplete or no days in database', 'yellow');
  }
}

main().catch(error => {
  log(`\n✗ Error: ${error.message}`, 'red');
  process.exit(1);
});
