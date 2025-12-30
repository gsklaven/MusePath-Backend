import test from 'ava';
import {
  registerAndLogin,
  setupTestServer,
  cleanupTestServer,
  createClient,
  generateUsername,
  generateEmail,
  testForbiddenRouteAction
} from './helpers.js';

/**
 * Route Retrieval Tests
 * Tests for GET /routes/:route_id
 */

test.before(async t => {
  await setupTestServer(t);
});

test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== Route Retrieval Tests ====================

// Verify that a created route can be retrieved by its ID
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

// Ensure that route retrieval requires authentication
test('GET /routes/:route_id - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.get('v1/routes/1');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Verify that users cannot access routes belonging to other users (IDOR protection)
test.serial('GET /routes/:route_id - should prevent access to other user routes', async t => {
  await testForbiddenRouteAction(t, 'get');
});

// Verify that requesting a non-existent route ID returns a 404 error
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

// Verify that the walking speed parameter affects the estimated time calculation
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