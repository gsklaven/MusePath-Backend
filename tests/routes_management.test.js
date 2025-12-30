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
 * Route Management Tests
 * Tests for Update, Recalculation, and Deletion of routes
 */

test.before(async t => {
  await setupTestServer(t);
});

test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== Route Update Tests ====================

// Verify that a route can be updated with new stops
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

// Ensure that route updates require authentication
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

// Verify that users cannot update routes belonging to other users
test.serial('PUT /routes/:route_id - should prevent updating other user routes', async t => {
  await testForbiddenRouteAction(t, 'put', { addStops: [2] });
});

// ==================== Route Recalculation Tests ====================

// Verify that a route can be recalculated (e.g., if user goes off-route)
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

// Ensure that route recalculation requires authentication
test('POST /routes/:route_id - should require authentication for recalculation', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.post('v1/routes/1');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Verify that users cannot recalculate routes belonging to other users
test.serial('POST /routes/:route_id - should prevent recalculating other user routes', async t => {
  await testForbiddenRouteAction(t, 'post');
});

// ==================== Route Deletion Tests ====================

// Verify that a route can be deleted by its owner
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

// Ensure that route deletion requires authentication
test('DELETE /routes/:route_id - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.delete('v1/routes/1');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Verify that users cannot delete routes belonging to other users
test.serial('DELETE /routes/:route_id - should prevent deleting other user routes', async t => {
  await testForbiddenRouteAction(t, 'delete');
});

// Verify that deleting a non-existent route returns 404
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