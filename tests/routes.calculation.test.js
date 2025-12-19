import test from 'ava';
import {
  registerAndLogin,
  setupTestServer,
  cleanupTestServer,
  createClient,
  generateUsername,
  generateEmail
} from './helpers.js';

// Setup the test server before running the tests
test.before(async t => {
  await setupTestServer(t);
});

// Cleanup the test server after all tests have run
test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== Route Calculation Tests ====================
// Purpose: ensure the route calculation endpoint returns deterministic
// results for valid inputs and rejects invalid or unauthorized requests.

// Test case for successful route calculation with valid data and authentication.
test.serial('POST /routes - should calculate route with valid data when authenticated', async t => {
  // Register and login a new user
  const { userId, client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route'),
    generateEmail('route'),
    'Password123!'
  );

  // Attempt to calculate a new route with valid data
  const response = await client.post('v1/routes', {
    json: {
      destination_id: 1,
      startLat: 40.7610,
      startLng: -73.9780
    }
  });

  // Assert that the server returns a 200 OK status and the correct response body
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.truthy(response.body.data.route_id);
  t.is(response.body.data.user_id, userId);
  t.is(response.body.data.destination_id, 1);
  t.is(typeof response.body.data.calculationTime, 'number');
});

// Test case to ensure that route calculation requires authentication.
test('POST /routes - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  // Attempt to calculate a new route without logging in
  const response = await client.post('v1/routes', {
    json: {
      destination_id: 1,
      startLat: 40.7610,
      startLng: -73.9780
    }
  });

  // Assert that the server returns a 401 Unauthorized status
  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Test case to ensure that route calculation rejects requests with a missing destination_id.
test.serial('POST /routes - should reject missing destination_id', async t => {
  // Register and login a new user
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routenodest'),
    generateEmail('routenodest'),
    'Password123!'
  );

  // Attempt to calculate a new route without a destination_id
  const response = await client.post('v1/routes', {
    json: {
      startLat: 40.7610,
      startLng: -73.9780
    }
  });

  // Assert that the server returns a 400 Bad Request status
  t.is(response.statusCode, 400);
  t.false(response.body.success);
});

// Test case to ensure that route calculation rejects requests with missing coordinates.
test.serial('POST /routes - should reject missing coordinates', async t => {
  // Register and login a new user
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route'),
    generateEmail('route'),
    'Password123!'
  );

  // Attempt to calculate a new route without start coordinates
  const response = await client.post('v1/routes', {
    json: {
      destination_id: 1
    }
  });

  // Assert that the server returns a 400 Bad Request status
  t.is(response.statusCode, 400);
  t.false(response.body.success);
});

// Test case to ensure that route calculation rejects requests with an invalid destination_id.
test.serial('POST /routes - should reject invalid destination_id', async t => {
  // Register and login a new user
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routeinvdest'),
    generateEmail('routeinvdest'),
    'Password123!'
  );

  // Attempt to calculate a new route with a destination_id that does not exist
  const response = await client.post('v1/routes', {
    json: {
      destination_id: 99999,
      startLat: 40.7610,
      startLng: -73.9780
    }
  });

  // Assert that the server returns a 404 Not Found status
  t.is(response.statusCode, 404);
  t.false(response.body.success);
  t.regex(response.body.message, /destination not found/i);
});

// Test case to ensure that route calculation rejects requests with invalid start coordinates (latitude out of range).
test.serial('POST /routes - should reject invalid start coordinates (latitude out of range)', async t => {
  // Register and login a new user
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routeinvlat'),
    generateEmail('routeinvlat'),
    'Password123!'
  );

  // Attempt to calculate a new route with a latitude that is out of range
  const response = await client.post('v1/routes', {
    json: {
      destination_id: 1,
      startLat: 95.0,
      startLng: -73.9780
    }
  });

  // Assert that the server returns a 400 Bad Request status
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.regex(response.body.message, /invalid.*coordinates/i);
});

// Test case to ensure that route calculation rejects requests with invalid start coordinates (longitude out of range).
test('POST /routes - should reject invalid start coordinates (longitude out of range)', async t => {
  // Register and login a new user
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routeinvlng'),
    generateEmail('routeinvlng'),
    'Password123!'
  );

  // Attempt to calculate a new route with a longitude that is out of range
  const response = await client.post('v1/routes', {
    json: {
      destination_id: 1,
      startLat: 40.7610,
      startLng: -200.0
    }
  });

  // Assert that the server returns a 400 Bad Request status
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.regex(response.body.message, /invalid.*coordinates/i);
});