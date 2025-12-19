import test from 'ava';
import {
  setupTestServer,
  cleanupTestServer,
  createClient,
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
  const client = createClient(t.context.baseUrl);

  // Make a request to the destinations endpoint
  const response = await client.get('v1/destinations');

  // Assert that the server returns a 200 OK status and the response is valid
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.true(Array.isArray(response.body.data));
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
  const client = createClient(t.context.baseUrl);

  // Make a request to the destinations endpoint with a map_id query parameter
  const response = await client.get('v1/destinations', {
    searchParams: { map_id: 1 }
  });

  // Assert that the server returns a 200 OK status and the response is valid
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.true(Array.isArray(response.body.data));
  
  // Verify that all returned destinations belong to the specified map_id
  response.body.data.forEach(dest => {
    t.is(dest.mapId, 1);
  });
});

// Test that the endpoint returns an empty array for a non-existent map_id.
test('GET /destinations - should return empty array for non-existent map', async t => {
  const client = createClient(t.context.baseUrl);

  // Make a request to the destinations endpoint with a map_id that is unlikely to exist
  const response = await client.get('v1/destinations', {
    searchParams: { map_id: 99999 }
  });

  // Assert that the server returns a 200 OK status and an empty data array
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.true(Array.isArray(response.body.data));
  t.is(response.body.data.length, 0);
});

// ==================== Get Destination Info Tests ====================

// Test that the endpoint returns the details of a specific destination by its ID.
test('GET /destinations/:destination_id - should get destination by ID', async t => {
  const client = createClient(t.context.baseUrl);

  // Make a request to the destination endpoint with a valid ID
  const response = await client.get('v1/destinations/1');

  // Assert that the server returns a 200 OK status and the correct destination details
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.is(response.body.data.destination_id, 1);
  t.truthy(response.body.data.name);
  t.truthy(response.body.data.type);
  t.truthy(response.body.data.coordinates);
  t.truthy(response.body.data.coordinates.lat);
  t.truthy(response.body.data.coordinates.lng);
});

// Test that the endpoint returns a 404 Not Found error for a non-existent destination.
test('GET /destinations/:destination_id - should return 404 for non-existent destination', async t => {
  const client = createClient(t.context.baseUrl);

  // Make a request to the destination endpoint with an ID that is unlikely to exist
  const response = await client.get('v1/destinations/99999');

  // Assert that the server returns a 404 Not Found status
  t.is(response.statusCode, 404);
  t.false(response.body.success);
  t.regex(response.body.message, /destination not found/i);
});

// Test that the endpoint can include the status of a destination when requested.
test('GET /destinations/:destination_id - should include status when requested', async t => {
  const client = createClient(t.context.baseUrl);

  // Make a request to the destination endpoint with the includeStatus query parameter
  const response = await client.get('v1/destinations/1', {
    searchParams: { includeStatus: 'true' }
  });

  // Assert that the server returns a 200 OK status and the destination details include the status
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.truthy(response.body.data.status);
  t.truthy(response.body.data.crowdLevel);
  t.truthy(response.body.data.lastUpdated);
});

// Test that the endpoint excludes the status of a destination by default.
test('GET /destinations/:destination_id - should exclude status by default', async t => {
  const client = createClient(t.context.baseUrl);

  // Make a request to the destination endpoint without any query parameters
  const response = await client.get('v1/destinations/1');

  // Assert that the server returns a 200 OK status and the destination details do not include the status
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.is(response.body.data.status, undefined);
  t.is(response.body.data.crowdLevel, undefined);
  t.is(response.body.data.lastUpdated, undefined);
});

// Test that the endpoint can include alternatives for an unavailable destination when requested.
test('GET /destinations/:destination_id - should include alternatives when requested and unavailable', async t => {
  const client = createClient(t.context.baseUrl);

  // Make a request to the destination endpoint for a closed destination with the includeAlternatives and includeStatus query parameters
  const response = await client.get('v1/destinations/7', {
    searchParams: { 
      includeAlternatives: 'true',
      includeStatus: 'true'
    }
  });

  // Assert that the server returns a 200 OK status and the destination details include alternatives
  t.is(response.statusCode, 200);
  t.true(response.body.success);
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
  const client = createClient(t.context.baseUrl);

  // Make a request to the destinations endpoint
  const response = await client.get('v1/destinations');

  // Assert that the server returns a 200 OK status and the response is valid
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  
  // Check that the returned destinations have different types
  const types = response.body.data.map(d => d.type);
  const uniqueTypes = [...new Set(types)];
  
  t.true(uniqueTypes.length > 1, 'Should have multiple destination types');
  t.true(types.includes('entrance') || types.includes('exhibit') || types.includes('restroom') || types.includes('cafe'));
});

// Test that the endpoint returns destinations with valid coordinates.
test('GET /destinations - should return destinations with coordinates', async t => {
  const client = createClient(t.context.baseUrl);

  // Make a request to the destinations endpoint
  const response = await client.get('v1/destinations');

  // Assert that the server returns a 200 OK status and the response is valid
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  
  // Verify that all returned destinations have valid coordinates
  response.body.data.forEach(dest => {
    t.truthy(dest.coordinates);
    t.is(typeof dest.coordinates.lat, 'number');
    t.is(typeof dest.coordinates.lng, 'number');
    t.true(dest.coordinates.lat >= -90 && dest.coordinates.lat <= 90);
    t.true(dest.coordinates.lng >= -180 && dest.coordinates.lng <= 180);
  });
});