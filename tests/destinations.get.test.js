import test from 'ava';
import {
  setupTestServer,
  cleanupTestServer,
  createClient,
  assertListDestinations,
  assertGetDestination
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
test('GET /destinations - should list all destinations', async t => {
  const response = await assertListDestinations(t);
  t.true(response.body.data.length > 0);
  
  // Verify the structure of a destination object in the response
  const destination = response.body.data[0];
  t.truthy(destination.destinationId);
  t.truthy(destination.name);
  t.truthy(destination.type);
  t.truthy(destination.coordinates);
});

// Test that the endpoint can filter destinations by map_id.
test('GET /destinations - should filter by map_id', async t => {
  const response = await assertListDestinations(t, { map_id: 1 });
  
  // Verify that all returned destinations belong to the specified map_id
  response.body.data.forEach(dest => {
    t.is(dest.mapId, 1);
  });
});

// Test that the endpoint returns an empty array for a non-existent map_id.
test('GET /destinations - should return empty array for non-existent map', async t => {
  const response = await assertListDestinations(t, { map_id: 99999 });
  t.is(response.body.data.length, 0);
});

// ==================== Get Destination Info Tests ====================

// Test that the endpoint returns the details of a specific destination by its ID.
test('GET /destinations/:destination_id - should get destination by ID', async t => {
  const response = await assertGetDestination(t, 1);
  t.truthy(response.body.data.name);
  t.truthy(response.body.data.type);
  t.truthy(response.body.data.coordinates);
  t.truthy(response.body.data.coordinates.lat);
  t.truthy(response.body.data.coordinates.lng);
});

// Test that the endpoint returns a 404 Not Found error for a non-existent destination.
test('GET /destinations/:destination_id - should return 404 for non-existent destination', async t => {
  const response = await assertGetDestination(t, 99999, {}, 404);
  t.false(response.body.success);
  t.regex(response.body.message, /destination not found/i);
});

// Test that the endpoint can include the status of a destination when requested.
test('GET /destinations/:destination_id - should include status when requested', async t => {
  const response = await assertGetDestination(t, 1, { includeStatus: 'true' });
  t.truthy(response.body.data.status);
  t.truthy(response.body.data.crowdLevel);
  t.truthy(response.body.data.lastUpdated);
});

// Test that the endpoint excludes the status of a destination by default.
test('GET /destinations/:destination_id - should exclude status by default', async t => {
  const response = await assertGetDestination(t, 1);
  t.is(response.body.data.status, undefined);
  t.is(response.body.data.crowdLevel, undefined);
  t.is(response.body.data.lastUpdated, undefined);
});

// Test that the endpoint can include alternatives for an unavailable destination when requested.
test('GET /destinations/:destination_id - should include alternatives when requested and unavailable', async t => {
  const response = await assertGetDestination(t, 7, { 
    includeAlternatives: 'true',
    includeStatus: 'true'
  });
  t.is(response.body.data.status, 'closed');
  t.truthy(response.body.data.alternatives);
  t.true(Array.isArray(response.body.data.alternatives));
  t.true(response.body.data.alternatives.length > 0);
  t.truthy(response.body.data.suggestedTimes);
  t.true(Array.isArray(response.body.data.suggestedTimes));
});

// ==================== Destination Types Tests ====================

// Test that the endpoint returns destinations with different types.
test('GET /destinations - should return different destination types', async t => {
  const response = await assertListDestinations(t);
  
  // Check that the returned destinations have different types
  const types = response.body.data.map(d => d.type);
  const uniqueTypes = [...new Set(types)];
  
  t.true(uniqueTypes.length > 1, 'Should have multiple destination types');
  t.true(types.includes('entrance') || types.includes('exhibit') || types.includes('restroom') || types.includes('cafe'));
});

// Test that the endpoint returns destinations with valid coordinates.
test('GET /destinations - should return destinations with coordinates', async t => {
  const response = await assertListDestinations(t);
  
  // Verify that all returned destinations have valid coordinates
  response.body.data.forEach(dest => {
    t.truthy(dest.coordinates);
    t.is(typeof dest.coordinates.lat, 'number');
    t.is(typeof dest.coordinates.lng, 'number');
    t.true(dest.coordinates.lat >= -90 && dest.coordinates.lat <= 90);
    t.true(dest.coordinates.lng >= -180 && dest.coordinates.lng <= 180);
  });
});