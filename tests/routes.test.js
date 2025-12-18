import test from 'ava';
import {
  registerAndLogin,
  setupTestServer,
  cleanupTestServer,
  createClient,
  generateUsername,
  generateEmail
} from './helpers.js';

/**
 * Route Management Tests
 *
 * Purpose and scope:
 * - Validate route lifecycle: creation, retrieval, update, recalculation and deletion
 * - Verify authorization: users may only operate on their own routes
 * - Check input validation and optional query parameters (e.g., walkingSpeed)
 *
 * Notes:
 * - Many tests run `serial` to avoid timestamp and ID collisions with mock data
 */

test.before(async t => {
  await setupTestServer(t);
});

test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== Route Calculation Tests ====================
// Purpose: ensure the route calculation endpoint returns deterministic
// results for valid inputs and rejects invalid or unauthorized requests.

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

// ==================== Route Retrieval Tests ====================
// Purpose: verify retrieval enforces ownership and supports optional
// query parameters like walkingSpeed.

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

test('GET /routes/:route_id - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.get('v1/routes/1');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

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


// ==================== Helpers for forbidden route actions ====================

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

test.serial('PUT /routes/:route_id - should prevent updating other user routes', async t => {
	await testForbiddenRouteAction(
		t,
		'put',
		'update',
		{ addStops: [2] }
	);
});

// ==================== Route Recalculation Tests ====================

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

test('POST /routes/:route_id - should require authentication for recalculation', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.post('v1/routes/1');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

test.serial('POST /routes/:route_id - should prevent recalculating other user routes', async t => {
	await testForbiddenRouteAction(
		t,
		'post',
		'recalculate',
		undefined
	);
});

// ==================== Route Deletion Tests ====================

test.serial('DELETE /routes/:route_id - should delete route when authenticated', async t => {
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routedelete'),
    generateEmail('routedelete'),
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

  const response = await client.delete(`v1/routes/${routeId}`);

  t.is(response.statusCode, 204);
  
  // Verify deletion
  const getResponse = await client.get(`v1/routes/${routeId}`);
  t.is(getResponse.statusCode, 404);
});

test('DELETE /routes/:route_id - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.delete('v1/routes/1');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

test.serial('DELETE /routes/:route_id - should prevent deleting other user routes', async t => {
  // Create route with user1
  const { client: client1 } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routedel1'),
    generateEmail('routedel1'),
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

  // Try to delete with user2
  const { client: client2 } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routedel2'),
    generateEmail('routedel2'),
    'Password123!'
  );

  const response = await client2.delete(`v1/routes/${routeId}`);

  t.is(response.statusCode, 403);
  t.false(response.body.success);
  t.regex(response.body.message, /forbidden/i);
});

test.serial('DELETE /routes/:route_id - should return 404 for non-existent route', async t => {
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routedel404'),
    generateEmail('routedel404'),
    'Password123!'
  );

  const response = await client.delete('v1/routes/99999');

  t.is(response.statusCode, 404);
  t.false(response.body.success);
});

// ==================== Personalized Route Tests ====================

test.serial('GET /users/:user_id/routes - should generate personalized route for user with preferences', async t => {
  const { userId, client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route'),
    generateEmail('route'),
    'Password123!'
  );

  // Set user preferences first
  await client.put(`v1/users/${userId}/preferences`, {
    json: {
      interests: ['modern art', 'paintings']
    }
  });

  const response = await client.get(`v1/users/${userId}/routes`);

  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.truthy(response.body.data.route_id);
  t.truthy(response.body.data.exhibits);
  t.true(Array.isArray(response.body.data.exhibits));
  t.truthy(response.body.data.estimated_duration);
});

test('GET /users/:user_id/routes - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.get('v1/users/1/routes');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

test.serial('GET /users/:user_id/routes - should prevent accessing other user personalized routes', async t => {
  const { userId: user1Id, client: client1 } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route1'),
    generateEmail('route1'),
    'Password123!'
  );

  const { userId: user2Id, client: client2 } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('route2'),
    generateEmail('route2'),
    'Password123!'
  );

  const response = await client2.get(`v1/users/${user1Id}/routes`);

  t.is(response.statusCode, 403);
  t.false(response.body.success);
  t.regex(response.body.message, /forbidden/i);
});

test.serial('GET /users/:user_id/routes - should fail for user without preferences', async t => {
  const { userId, client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('routenopref'),
    generateEmail('routenopref'),
    'Password123!'
  );

  const response = await client.get(`v1/users/${userId}/routes`);

  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.regex(response.body.message, /preferences/i);
});
