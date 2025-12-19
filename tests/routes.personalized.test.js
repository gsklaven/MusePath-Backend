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

// ==================== Personalized Route Tests ====================

// Test case for successful personalized route generation for a user with preferences.
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

// Test case to ensure that personalized route generation requires authentication.
test('GET /users/:user_id/routes - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.get('v1/users/1/routes');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Test case to prevent a user from accessing another user's personalized routes.
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

// Test case to ensure that personalized route generation fails for a user without preferences.
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
