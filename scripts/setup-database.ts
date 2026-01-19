#!/usr/bin/env tsx
/**
 * Database Setup Script
 *
 * This script creates all required tables for the TripBuilder application.
 * It reads the SQL schema file and executes it via the Supabase client.
 *
 * Usage: npm run setup:database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

function log(message: string, color: 'green' | 'red' | 'yellow' | 'blue' = 'blue') {
  const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function setupDatabase() {
  log('🚀 Starting Database Setup...', 'blue');

  // Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log('❌ Missing required environment variables:', 'red');
    log('  - NEXT_PUBLIC_SUPABASE_URL', 'red');
    log('  - SUPABASE_SERVICE_ROLE_KEY', 'red');
    log('\nMake sure these are set in your .env.local file', 'yellow');
    process.exit(1);
  }

  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  log('✓ Connected to Supabase', 'green');

  // Read the SQL schema file
  const schemaPath = join(__dirname, '001_initial_schema.sql');
  const schemaSql = readFileSync(schemaPath, 'utf-8');

  log('✓ Loaded schema from 001_initial_schema.sql', 'green');

  // Split SQL into individual statements (by semicolon + newline)
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  log(`\n📝 Executing ${statements.length} SQL statements...\n`, 'blue');

  let successCount = 0;
  let errorCount = 0;

  // Execute each statement individually
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Skip comment-only statements
    if (statement.startsWith('--')) continue;

    // Get a short description of the statement
    let description = statement.substring(0, 60).replace(/\n/g, ' ');
    if (statement.length > 60) description += '...';

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Try direct query as fallback
        const { error: directError } = await supabase.from('_sql').select(statement);

        if (directError) {
          log(`❌ Statement ${i + 1}: ${directError.message}`, 'red');
          log(`   ${description}`, 'yellow');
          errorCount++;
        } else {
          log(`✓ Statement ${i + 1}: Success`, 'green');
          successCount++;
        }
      } else {
        log(`✓ Statement ${i + 1}: Success`, 'green');
        successCount++;
      }
    } catch (err) {
      log(`❌ Statement ${i + 1}: ${err}`, 'red');
      log(`   ${description}`, 'yellow');
      errorCount++;
    }
  }

  log(`\n📊 Results:`, 'blue');
  log(`  ✓ Successful: ${successCount}`, 'green');
  if (errorCount > 0) {
    log(`  ❌ Failed: ${errorCount}`, 'red');
  }

  // Verify tables were created
  log('\n🔍 Verifying tables...', 'blue');

  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE');

  if (tablesError) {
    log('❌ Could not verify tables', 'red');
  } else {
    log('\n✓ Tables in database:', 'green');
    tables?.forEach(t => log(`  - ${t.table_name}`, 'green'));
  }

  log('\n✅ Database setup complete!', 'green');
  log('\nNext steps:', 'blue');
  log('  1. Run: npm run test:persistence', 'yellow');
  log('  2. Verify all tests pass', 'yellow');
  log('  3. Test in browser with upload → refresh cycle', 'yellow');
}

setupDatabase().catch((err) => {
  log(`\n❌ Fatal error: ${err.message}`, 'red');
  process.exit(1);
});
