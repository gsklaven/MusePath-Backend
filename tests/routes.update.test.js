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

// ==================== Helpers for forbidden route actions ====================

// Helper function to test forbidden actions on a route.
async function testForbiddenRouteAction(t, method, routeAction, body) {
  // Create route with user1
  const { client: client1 } = await registerAndLogin(
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

  // Try to modify with user2
  const { client: client2 } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route2'),
    generateEmail('route2'),
    'Password123!'
  );

  const url = `v1/routes/${routeId}`;
  const response = body
    ? await client2[method](url, { json: body })
    : await client2[method](url);

  t.is(response.statusCode, 403);
  t.false(response.body.success);
  t.regex(response.body.message, /forbidden/i);
}

// ==================== Route Update Tests ====================
// Purpose: updating a route should only be allowed by the owner and
// must return updated timing information when stops change.

// Test case for a successful route stop update.
test.serial('PUT /routes/:route_id - should update route stops when authenticated', async t => {
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routeupdate'),
    generateEmail('routeupdate'),
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

  const response = await client.put(`v1/routes/${routeId}`, {
    json: {
      addStops: [2, 3]
    }
  });

  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.is(response.body.data.route_id, routeId);
  t.true(response.body.data.stopsUpdated);
  t.truthy(response.body.data.newEstimatedTime);
});

// Test case to ensure that route updates require authentication.
test('PUT /routes/:route_id - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.put('v1/routes/1', {
    json: {
      addStops: [2]
    }
  });

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Test case to prevent a user from updating another user's route.
test.serial('PUT /routes/:route_id - should prevent updating other user routes', async t => {
	await testForbiddenRouteAction(
		t,
		'put',
		'update',
		{ addStops: [2] }
	);
});

// ==================== Route Recalculation Tests ====================

// Test case for successful route recalculation.
test.serial('POST /routes/:route_id - should recalculate route when authenticated', async t => {
  const { userId, client } = await registerAndLogin(
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

  const response = await client.post(`v1/routes/${routeId}`);

  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.is(response.body.data.route_id, routeId);
  t.truthy(response.body.data.calculationTime);
});

// Test case to ensure route recalculation requires authentication.
test('POST /routes/:route_id - should require authentication for recalculation', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.post('v1/routes/1');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Test case to prevent a user from recalculating another user's route.
test.serial('POST /routes/:route_id - should prevent recalculating other user routes', async t => {
	await testForbiddenRouteAction(
		t,
		'post',
		'recalculate',
		undefined
	);
});
