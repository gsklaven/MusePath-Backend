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

// ==================== Route Deletion Tests ====================

// Test case for successful route deletion.
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

// Test case to ensure that route deletion requires authentication.
test('DELETE /routes/:route_id - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.delete('v1/routes/1');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Test case to prevent a user from deleting another user's route.
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

// Test case to ensure a 404 is returned when trying to delete a non-existent route.
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