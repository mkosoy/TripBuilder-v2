#!/usr/bin/env tsx

// Simulate what happens with date strings
const testDate = '2026-02-10';

console.log('\n🔍 Testing Date Handling:\n');
console.log('Input date string:', testDate);
console.log('Date object:', new Date(testDate));
console.log('Local date string:', new Date(testDate).toLocaleDateString());
console.log('ISO string:', new Date(testDate).toISOString());
console.log('Date portion:', new Date(testDate).toISOString().split('T')[0]);

// Check timezone offset
console.log('\nTimezone offset (minutes):', new Date().getTimezoneOffset());
console.log('Your timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

// Simulate the date comparison
const days = [
  { date: '2026-02-06', dayNumber: 0 },
  { date: '2026-02-07', dayNumber: 1 },
  { date: '2026-02-08', dayNumber: 2 },
  { date: '2026-02-09', dayNumber: 3 },
  { date: '2026-02-10', dayNumber: 4 },
];

const bookingDate = '2026-02-10';
const dayIndex = days.findIndex((d) => d.date === bookingDate);

console.log('\n📍 Simulation:');
console.log('Booking date:', bookingDate);
console.log('Found at index:', dayIndex);
console.log('Matched day:', days[dayIndex]);
