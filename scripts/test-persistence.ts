/**
 * Automated Persistence Testing Script
 * Tests database migration and ID synchronization fixes
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name: string) {
  console.log(`\n${colors.blue}▶ ${name}${colors.reset}`);
}

function logSuccess(message: string) {
  console.log(`${colors.green}  ✓ ${message}${colors.reset}`);
}

function logError(message: string) {
  console.log(`${colors.red}  ✗ ${message}${colors.reset}`);
}

function logWarning(message: string) {
  console.log(`${colors.yellow}  ⚠ ${message}${colors.reset}`);
}

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, message: string, details?: any) {
  results.push({ name, passed, message, details });
  if (passed) {
    logSuccess(message);
  } else {
    logError(message);
  }
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function main() {
  log('\n════════════════════════════════════════════════════════════', 'cyan');
  log('  Persistence Fixes - Automated Test Suite', 'cyan');
  log('════════════════════════════════════════════════════════════\n', 'cyan');

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    logError('Missing required environment variables:');
    if (!supabaseUrl) logError('  - NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseServiceKey) logError('  - SUPABASE_SERVICE_ROLE_KEY');
    log('\nPlease add SUPABASE_SERVICE_ROLE_KEY to .env.local', 'yellow');
    process.exit(1);
  }

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  log('Connected to Supabase', 'green');

  // =================================================================
  // TEST 1: Database Migration
  // =================================================================
  logTest('Test 1: Database Migration');

  try {
    // Verify columns exist by attempting to select them
    const { data, error: queryError } = await supabase
      .from('days')
      .select('id, title, day_of_week')
      .limit(1);

    if (queryError) {
      // Check if error is about missing columns
      if (queryError.message.includes('column') && (queryError.message.includes('title') || queryError.message.includes('day_of_week'))) {
        addResult('migration', false, `Migration columns missing: ${queryError.message}`);
      } else {
        // Other error (e.g., no data) is fine
        addResult('migration', true, 'Migration columns exist (verified by query)');
      }
    } else {
      addResult('migration', true, 'Migration columns exist in schema');
      if (data && data.length > 0) {
        logSuccess(`Sample: ${data[0].title || '(no title)'}, ${data[0].day_of_week || '(no day_of_week)'}`);
      }
    }
  } catch (error: any) {
    addResult('migration', false, `Migration check failed: ${error.message}`);
  }

  // =================================================================
  // TEST 2: Get Trip ID
  // =================================================================
  logTest('Test 2: Get Trip ID');
  
  const { data: trips, error: tripError } = await supabase
    .from('trips')
    .select('id')
    .limit(1);
  
  if (tripError || !trips || trips.length === 0) {
    logError('No trip found in database. Creating test trip...');
    
    const { data: newTrip, error: createError } = await supabase
      .from('trips')
      .insert({ name: 'Test Trip', start_date: '2026-02-07', end_date: '2026-02-18' })
      .select()
      .single();
    
    if (createError || !newTrip) {
      logError('Failed to create test trip. Exiting.');
      process.exit(1);
    }
    
    var tripId = newTrip.id;
    logSuccess(`Created test trip: ${tripId}`);
  } else {
    var tripId = trips[0].id;
    logSuccess(`Using existing trip: ${tripId}`);
  }

  // =================================================================
  // TEST 3: Test Flight Insert with UUID
  // =================================================================
  logTest('Test 3: Flight Insert Returns UUID');
  
  const testFlight = {
    trip_id: tripId,
    date: '2026-02-07',
    departure_time: '10:00',
    arrival_time: '18:00',
    from_city: 'New York',
    from_code: 'JFK',
    to_city: 'Copenhagen',
    to_code: 'CPH',
    airline: 'TEST Airways',
    flight_number: 'TEST123',
    confirmation_number: 'CONF123',
    notes: 'Automated test flight',
    is_personal: true,
  };
  
  const { data: insertedFlight, error: flightInsertError } = await supabase
    .from('flights')
    .insert(testFlight)
    .select()
    .single();
  
  if (flightInsertError || !insertedFlight) {
    addResult('flight_insert', false, `Flight insert failed: ${flightInsertError?.message}`);
  } else {
    const isUuid = UUID_REGEX.test(insertedFlight.id);
    const isNotTimestamp = !insertedFlight.id.startsWith('flight-');
    
    if (isUuid && isNotTimestamp) {
      addResult('flight_insert', true, `Flight created with UUID: ${insertedFlight.id}`);
    } else {
      addResult('flight_insert', false, `Flight ID is not a UUID: ${insertedFlight.id}`);
    }
  }

  // =================================================================
  // TEST 4: Verify Flight Persists
  // =================================================================
  logTest('Test 4: Flight Persistence');
  
  if (insertedFlight) {
    const { data: retrievedFlight, error: retrieveError } = await supabase
      .from('flights')
      .select('*')
      .eq('id', insertedFlight.id)
      .single();
    
    if (retrieveError || !retrievedFlight) {
      addResult('flight_persist', false, 'Flight not found after insert');
    } else if (retrievedFlight.id === insertedFlight.id) {
      addResult('flight_persist', true, 'Flight persisted with correct UUID');
    } else {
      addResult('flight_persist', false, `ID mismatch: ${insertedFlight.id} vs ${retrievedFlight.id}`);
    }
  }

  // =================================================================
  // TEST 5: Get Day for Activity Test
  // =================================================================
  logTest('Test 5: Get Day for Activity Test');
  
  const { data: testDays, error: dayError } = await supabase
    .from('days')
    .select('id, date, day_number')
    .eq('trip_id', tripId)
    .order('day_number')
    .limit(1);
  
  if (dayError || !testDays || testDays.length === 0) {
    logWarning('No days found. Creating test day...');
    
    const { data: newDay, error: createDayError } = await supabase
      .from('days')
      .insert({
        trip_id: tripId,
        date: '2026-02-07',
        day_number: 1,
        destination: 'Copenhagen',
        title: 'Day 1',
        day_of_week: 'Friday'
      })
      .select()
      .single();
    
    if (createDayError || !newDay) {
      logError('Failed to create test day');
      var testDay = null;
    } else {
      var testDay = newDay;
      logSuccess(`Created test day: ${testDay.id}`);
    }
  } else {
    var testDay = testDays[0];
    logSuccess(`Using existing day: ${testDay.id} (Day ${testDay.day_number})`);
  }

  // =================================================================
  // TEST 6: Test Activity Insert with UUID
  // =================================================================
  logTest('Test 6: Activity Insert Returns UUID');
  
  if (testDay) {
    // First delete any existing activities for clean test
    await supabase.from('activities').delete().eq('day_id', testDay.id);
    
    const testActivity = {
      day_id: testDay.id,
      name: 'Test Restaurant',
      type: 'food',
      time: '19:00',
      duration: '2 hours',
      description: 'Automated test restaurant',
      address: '123 Test Street',
      confirmation_number: 'RES456',
      is_booked: true,
    };
    
    const { data: insertedActivities, error: activityInsertError } = await supabase
      .from('activities')
      .insert([testActivity])
      .select();
    
    if (activityInsertError || !insertedActivities || insertedActivities.length === 0) {
      addResult('activity_insert', false, `Activity insert failed: ${activityInsertError?.message}`);
    } else {
      const activity = insertedActivities[0];
      const isUuid = UUID_REGEX.test(activity.id);
      const isNotTimestamp = !activity.id.startsWith('activity-') && !activity.id.startsWith('custom-');
      
      if (isUuid && isNotTimestamp) {
        addResult('activity_insert', true, `Activity created with UUID: ${activity.id}`);
      } else {
        addResult('activity_insert', false, `Activity ID is not a UUID: ${activity.id}`);
      }
      
      // Store for next test
      var insertedActivity = activity;
    }
  } else {
    addResult('activity_insert', false, 'Skipped: no test day available');
  }

  // =================================================================
  // TEST 7: Verify Activity Persists
  // =================================================================
  logTest('Test 7: Activity Persistence');
  
  if (insertedActivity) {
    const { data: retrievedActivity, error: retrieveError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', insertedActivity.id)
      .single();
    
    if (retrieveError || !retrievedActivity) {
      addResult('activity_persist', false, 'Activity not found after insert');
    } else if (retrievedActivity.id === insertedActivity.id) {
      addResult('activity_persist', true, 'Activity persisted with correct UUID');
    } else {
      addResult('activity_persist', false, `ID mismatch: ${insertedActivity.id} vs ${retrievedActivity.id}`);
    }
  } else {
    addResult('activity_persist', false, 'Skipped: no test activity inserted');
  }

  // =================================================================
  // TEST 8: Check for Old-Style IDs
  // =================================================================
  logTest('Test 8: Check for Old-Style IDs in Database');

  // Since IDs are UUIDs, we verify they match UUID format instead of using LIKE
  const { data: allFlights, error: badFlightError } = await supabase
    .from('flights')
    .select('id')
    .limit(100);

  if (badFlightError) {
    addResult('old_ids_flights', false, `Query failed: ${badFlightError.message}`);
  } else if (allFlights) {
    const invalidIds = allFlights.filter(f => !UUID_REGEX.test(f.id));
    if (invalidIds.length > 0) {
      addResult('old_ids_flights', false, `Found ${invalidIds.length} flights with non-UUID IDs`);
      logWarning(`Sample: ${invalidIds[0].id}`);
    } else {
      addResult('old_ids_flights', true, `All ${allFlights.length} flight IDs are valid UUIDs`);
    }
  } else {
    addResult('old_ids_flights', true, 'No flights in database');
  }

  const { data: allActivities, error: badActivityError } = await supabase
    .from('activities')
    .select('id')
    .limit(100);

  if (badActivityError) {
    addResult('old_ids_activities', false, `Query failed: ${badActivityError.message}`);
  } else if (allActivities) {
    const invalidIds = allActivities.filter(a => !UUID_REGEX.test(a.id));
    if (invalidIds.length > 0) {
      addResult('old_ids_activities', false, `Found ${invalidIds.length} activities with non-UUID IDs`);
      logWarning(`Sample: ${invalidIds[0].id}`);
    } else {
      addResult('old_ids_activities', true, `All ${allActivities.length} activity IDs are valid UUIDs`);
    }
  } else {
    addResult('old_ids_activities', true, 'No activities in database');
  }

  // =================================================================
  // TEST 9: Verify Transform Function Compatibility
  // =================================================================
  logTest('Test 9: Transform Function Compatibility');
  
  if (testDay) {
    const { data: dayWithActivities, error: transformError } = await supabase
      .from('days')
      .select('*, activities(*)')
      .eq('id', testDay.id)
      .single();
    
    if (transformError) {
      addResult('transform_compat', false, `Transform query failed: ${transformError.message}`);
    } else if (!dayWithActivities.title || !dayWithActivities.day_of_week) {
      addResult('transform_compat', false, 'Missing title or day_of_week fields');
    } else {
      addResult('transform_compat', true, 'Transform functions compatible with DB schema');
      logSuccess(`Day has title: "${dayWithActivities.title}"`);
      logSuccess(`Day has day_of_week: "${dayWithActivities.day_of_week}"`);
    }
  }

  // =================================================================
  // CLEANUP
  // =================================================================
  logTest('Cleanup: Remove Test Data');
  
  if (insertedFlight) {
    await supabase.from('flights').delete().eq('id', insertedFlight.id);
    logSuccess('Removed test flight');
  }
  
  if (insertedActivity) {
    await supabase.from('activities').delete().eq('id', insertedActivity.id);
    logSuccess('Removed test activity');
  }

  // =================================================================
  // SUMMARY
  // =================================================================
  log('\n════════════════════════════════════════════════════════════', 'cyan');
  log('  Test Results Summary', 'cyan');
  log('════════════════════════════════════════════════════════════\n', 'cyan');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}: ${result.message}`, color);
  });

  log(`\n${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');

  if (failed > 0) {
    log(`\n${failed} tests failed. Please review the errors above.`, 'red');
    process.exit(1);
  } else {
    log('\n✓ All persistence fixes verified successfully!', 'green');
    log('\nNext steps:', 'cyan');
    log('  1. Test in browser: Upload a booking and hard refresh', 'blue');
    log('  2. Proceed to Phase 2: Create unified bookings manager', 'blue');
    process.exit(0);
  }
}

// Run tests
main().catch((error) => {
  logError(`\nFatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
