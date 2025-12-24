import test from 'ava';
import {
  setupTestServer,
  cleanupTestServer,
  createClient,
  testListDestinations,
  testGetDestination
} from './helpers.js';

// Setup the test server before running the tests
test.before(async t => {
  await setupTestServer(t);
});

// Cleanup the test server after all tests have run
test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== List Destinations Tests ====================

// Test that the endpoint returns a list of all available destinations.
test('GET /destinations - should list all destinations', testListDestinations, {}, (t, data) => {
  t.true(data.length > 0);
  const destination = data[0];
  t.truthy(destination.destinationId);
  t.truthy(destination.name);
  t.truthy(destination.type);
  t.truthy(destination.coordinates);
});

// Test that the endpoint can filter destinations by map_id.
test('GET /destinations - should filter by map_id', testListDestinations, { map_id: 1 }, (t, data) => {
  data.forEach(dest => {
    t.is(dest.mapId, 1);
  });
});

// Test that the endpoint returns an empty array for a non-existent map_id.
test('GET /destinations - should return empty array for non-existent map', testListDestinations, { map_id: 99999 }, (t, data) => {
  t.is(data.length, 0);
});

// ==================== Get Destination Info Tests ====================

// Test that the endpoint returns the details of a specific destination by its ID.
test('GET /destinations/:destination_id - should get destination by ID', testGetDestination, 1, {}, 200, (t, data) => {
  t.truthy(data.name);
  t.truthy(data.type);
  t.truthy(data.coordinates);
});

// Test that the endpoint returns a 404 Not Found error for a non-existent destination.
test('GET /destinations/:destination_id - should return 404 for non-existent destination', testGetDestination, 99999, {}, 404, (t, body) => {
  t.false(body.success);
  t.regex(body.message, /destination not found/i);
});

// Test that the endpoint can include the status of a destination when requested.
test('GET /destinations/:destination_id - should include status when requested', testGetDestination, 1, { includeStatus: 'true' }, 200, (t, data) => {
  t.truthy(data.status);
  t.truthy(data.crowdLevel);
  t.truthy(data.lastUpdated);
});

// Test that the endpoint excludes the status of a destination by default.
test('GET /destinations/:destination_id - should exclude status by default', testGetDestination, 1, {}, 200, (t, data) => {
  t.is(data.status, undefined);
  t.is(data.crowdLevel, undefined);
  t.is(data.lastUpdated, undefined);
});

// Test that the endpoint can include alternatives for an unavailable destination when requested.
test('GET /destinations/:destination_id - should include alternatives when requested and unavailable', testGetDestination, 7, { 
  includeAlternatives: 'true',
  includeStatus: 'true'
}, 200, (t, data) => {
  t.is(data.status, 'closed');
  t.truthy(data.alternatives);
  t.true(Array.isArray(data.alternatives));
  t.true(data.alternatives.length > 0);
  t.truthy(data.suggestedTimes);
  t.true(Array.isArray(data.suggestedTimes));
});

// ==================== Destination Types Tests ====================

// Test that the endpoint returns destinations with different types.
test('GET /destinations - should return different destination types', testListDestinations, {}, (t, data) => {
  const types = data.map(d => d.type);
  const uniqueTypes = [...new Set(types)];
  
  t.true(uniqueTypes.length > 1, 'Should have multiple destination types');
  t.true(types.includes('entrance') || types.includes('exhibit') || types.includes('restroom') || types.includes('cafe'));
});

// Test that the endpoint returns destinations with valid coordinates.
test('GET /destinations - should return destinations with coordinates', testListDestinations, {}, (t, data) => {
  data.forEach(dest => {
    t.truthy(dest.coordinates);
    t.is(typeof dest.coordinates.lat, 'number');
    t.is(typeof dest.coordinates.lng, 'number');
    t.true(dest.coordinates.lat >= -90 && dest.coordinates.lat <= 90);
    t.true(dest.coordinates.lng >= -180 && dest.coordinates.lng <= 180);
  });
});