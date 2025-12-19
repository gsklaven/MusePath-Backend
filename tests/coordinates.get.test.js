import test from 'ava';
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin, generateUsername, generateEmail } from './helpers.js';

// Setup the test server before running the tests
test.before(async (t) => {
  await setupTestServer(t);
});

// Cleanup the test server after all tests have run
test.after.always((t) => {
  cleanupTestServer(t);
});

// ============================================================================
// GET /v1/coordinates/:user_id - Retrieve User Coordinates
// ============================================================================

// Test that the endpoint returns user coordinates when they exist.
test.serial('GET /v1/coordinates/:user_id - should return user coordinates when they exist', async (t) => {
  const username = generateUsername('coorduser1');
  const email = generateEmail(username);
  
  // Register and login a new user
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Create coordinates for the user first
  const coords = { lat: 40.7614, lng: -73.9776 };
  await client.put(`v1/coordinates/${userId}`, { json: coords });
  
  // Get the user's coordinates
  const response = await client.get(`v1/coordinates/${userId}`);
  
  // Assert that the server returns a 200 OK status and the correct coordinates
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.truthy(response.body.data);
  
  // Verify the structure and values of the returned coordinates
  const retrievedCoords = response.body.data;
  t.is(typeof retrievedCoords.lat, 'number');
  t.is(typeof retrievedCoords.lng, 'number');
  t.is(retrievedCoords.lat, coords.lat);
  t.is(retrievedCoords.lng, coords.lng);
  t.true(retrievedCoords.lat >= -90 && retrievedCoords.lat <= 90, 'Latitude within valid range');
  t.true(retrievedCoords.lng >= -180 && retrievedCoords.lng <= 180, 'Longitude within valid range');
});

// Test that the endpoint requires authentication.
test.serial('GET /v1/coordinates/:user_id - should require authentication', async (t) => {
  const client = createClient(t.context.baseUrl);
  
  // Attempt to get coordinates without logging in
  const response = await client.get('v1/coordinates/1');
  
  // Assert that the server returns a 401 Unauthorized status
  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Test that a user cannot access another user's coordinates.
test.serial('GET /v1/coordinates/:user_id - should prevent access to other users coordinates', async (t) => {
  // Create two separate users with their own clients
  const username1 = generateUsername('coorduser2');
  const email1 = generateEmail(username1);
  const username2 = generateUsername('coorduser3');
  const email2 = generateEmail(username2);
  
  const { userId: userId1, client: client1 } = await registerAndLogin(t.context.baseUrl, username1, email1, 'Password123!');
  const { userId: userId2, client: client2 } = await registerAndLogin(t.context.baseUrl, username2, email2, 'Password123!');
  
  // Create coordinates for the second user
  await client2.put(`v1/coordinates/${userId2}`, {
    json: { lat: 51.5074, lng: -0.1278 }
  });
  
  // Attempt to access the second user's coordinates with the first user's session
  const response = await client1.get(`v1/coordinates/${userId2}`);
  
  // Assert that the server returns a 403 Forbidden status
  t.is(response.statusCode, 403);
  t.false(response.body.success);
  t.is(response.body.message, 'Forbidden: cannot access other user data');
});

// Test that the endpoint handles an invalid user ID.
test.serial('GET /v1/coordinates/:user_id - should handle invalid user ID', async (t) => {
  const username = generateUsername('coorduser4');
  const email = generateEmail(username);
  
  // Register and login a new user
  const { client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Attempt to get coordinates with an invalid user ID format
  const response = await client.get('v1/coordinates/invalid');
  
  // Assert that the server returns a 403 Forbidden status
  t.is(response.statusCode, 403);
  t.false(response.body.success);
});