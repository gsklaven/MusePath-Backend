import test from 'ava';
import {
  registerAndLogin,
  setupTestServer,
  cleanupTestServer,
  createClient,
  generateUsername,
  generateEmail
} from './helpers.js';

test.before(async t => {
  await setupTestServer(t);
});

test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== Route Calculation Tests ====================
// Purpose: ensure the route calculation endpoint returns deterministic
// results for valid inputs and rejects invalid or unauthorized requests.

// Test case for successful route calculation with valid data and authentication.
test.serial('POST /routes - should calculate route with valid data when authenticated', async t => {
  const { userId, client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route'),
    generateEmail('route'),
    'Password123!'
  );

  const response = await client.post('v1/routes', {
    json: {
      destination_id: 1,
      startLat: 40.7610,
      startLng: -73.9780
    }
  });

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

  const response = await client.post('v1/routes', {
    json: {
      destination_id: 1,
      startLat: 40.7610,
      startLng: -73.9780
    }
  });

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Test case to ensure that route calculation rejects requests with a missing destination_id.
test.serial('POST /routes - should reject missing destination_id', async t => {
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routenodest'),
    generateEmail('routenodest'),
    'Password123!'
  );

  const response = await client.post('v1/routes', {
    json: {
      startLat: 40.7610,
      startLng: -73.9780
    }
  });

  t.is(response.statusCode, 400);
  t.false(response.body.success);
});

// Test case to ensure that route calculation rejects requests with missing coordinates.
test.serial('POST /routes - should reject missing coordinates', async t => {
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route'),
    generateEmail('route'),
    'Password123!'
  );

  const response = await client.post('v1/routes', {
    json: {
      destination_id: 1
    }
  });

  t.is(response.statusCode, 400);
  t.false(response.body.success);
});

// Test case to ensure that route calculation rejects requests with an invalid destination_id.
test.serial('POST /routes - should reject invalid destination_id', async t => {
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routeinvdest'),
    generateEmail('routeinvdest'),
    'Password123!'
  );

  const response = await client.post('v1/routes', {
    json: {
      destination_id: 99999,
      startLat: 40.7610,
      startLng: -73.9780
    }
  });

  t.is(response.statusCode, 404);
  t.false(response.body.success);
  t.regex(response.body.message, /destination not found/i);
});

// Test case to ensure that route calculation rejects requests with invalid start coordinates (latitude out of range).
test.serial('POST /routes - should reject invalid start coordinates (latitude out of range)', async t => {
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routeinvlat'),
    generateEmail('routeinvlat'),
    'Password123!'
  );

  const response = await client.post('v1/routes', {
    json: {
      destination_id: 1,
      startLat: 95.0,
      startLng: -73.9780
    }
  });

  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.regex(response.body.message, /invalid.*coordinates/i);
});

// Test case to ensure that route calculation rejects requests with invalid start coordinates (longitude out of range).
test('POST /routes - should reject invalid start coordinates (longitude out of range)', async t => {
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routeinvlng'),
    generateEmail('routeinvlng'),
    'Password123!'
  );

  const response = await client.post('v1/routes', {
    json: {
      destination_id: 1,
      startLat: 40.7610,
      startLng: -200.0
    }
  });

  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.regex(response.body.message, /invalid.*coordinates/i);
});
