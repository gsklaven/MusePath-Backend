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

// ==================== Route Retrieval Tests ====================
// Purpose: verify retrieval enforces ownership and supports optional
// query parameters like walkingSpeed.

// Test case for successful route retrieval with authentication.
test.serial('GET /routes/:route_id - should retrieve route details when authenticated', async t => {
  const { userId, client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route'),
    generateEmail('route'),
    'Password123!'
  );

  // First create a route
  const createResponse = await client.post('v1/routes', {
    json: {
      destination_id: 1,
      startLat: 40.7610,
      startLng: -73.9780
    }
  });
  const routeId = createResponse.body.data.route_id;

  // Then retrieve it
  const response = await client.get(`v1/routes/${routeId}`);

  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.is(response.body.data.route_id, routeId);
  t.is(typeof response.body.data.estimatedTime, 'number');
  t.is(typeof response.body.data.distance, 'number');
  t.truthy(response.body.data.path);
  t.truthy(response.body.data.instructions);
});

// Test case to ensure that route retrieval requires authentication.
test('GET /routes/:route_id - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.get('v1/routes/1');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Test case to prevent a user from accessing another user's route.
test.serial('GET /routes/:route_id - should prevent access to other user routes', async t => {
  // Create route with user1
  const { userId: user1Id, client: client1 } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route1'),
    generateEmail('route1'),
    'Password123!'
  );

  const createResponse = await client1.post('v1/routes', {
    json: {
      destination_id: 1,
      startLat: 40.7610,
      startLng: -73.9780
    }
  });
  const routeId = createResponse.body.data.route_id;

  // Try to access with user2
  const { userId: user2Id, client: client2 } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route2'),
    generateEmail('route2'),
    'Password123!'
  );

  const response = await client2.get(`v1/routes/${routeId}`);

  t.is(response.statusCode, 403);
  t.false(response.body.success);
  t.regex(response.body.message, /forbidden/i);
});

// Test case to ensure a 404 is returned for a non-existent route.
test.serial('GET /routes/:route_id - should return 404 for non-existent route', async t => {
  // Add delay to prevent timestamp collision
  await new Promise(resolve => setTimeout(resolve, 5));
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route'),
    generateEmail('route'),
    'Password123!'
  );

  const response = await client.get('v1/routes/99999');

  t.is(response.statusCode, 404);
  t.false(response.body.success);
  t.regex(response.body.message, /route not found/i);
});

// Test case to ensure the walkingSpeed parameter is accepted.
test.serial('GET /routes/:route_id - should accept walkingSpeed parameter', async t => {
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route'),
    generateEmail('route'),
    'Password123!'
  );

  const createResponse = await client.post('v1/routes', {
    json: {
      destination_id: 1,
      startLat: 40.7610,
      startLng: -73.9780
    }
  });
  const routeId = createResponse.body.data.route_id;

  const response = await client.get(`v1/routes/${routeId}`, {
    searchParams: { walkingSpeed: 6 }
  });

  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.is(typeof response.body.data.estimatedTime, 'number');
});
