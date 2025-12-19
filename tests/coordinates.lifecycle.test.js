import test from 'ava';
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin, generateUsername, generateEmail } from './helpers.js';

test.before(async (t) => {
  await setupTestServer(t);
});

test.after.always((t) => {
  cleanupTestServer(t);
});

// ============================================================================
// New User - No Coordinates Initially
// ============================================================================

test.serial('GET /v1/coordinates/:user_id - newly created user should not have coordinates', async (t) => {
  const username = generateUsername('newcoorduser');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Try to get coordinates - should return 404
  const response = await client.get(`v1/coordinates/${userId}`);
  
  t.is(response.statusCode, 404);
  t.false(response.body.success);
});

test.serial('Coordinate lifecycle - create, update, and retrieve coordinates', async (t) => {
  const username = generateUsername('lifecycleuser');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Verify no coordinates exist initially
  const noCoords = await client.get(`v1/coordinates/${userId}`);
  t.is(noCoords.statusCode, 404);
  
  // Create coordinates via PUT (simulating first GPS update)
  const newYork = { lat: 40.7128, lng: -74.0060 };
  const createResponse = await client.put(`v1/coordinates/${userId}`, {
    json: newYork
  });
  
  t.is(createResponse.statusCode, 200);
  t.true(createResponse.body.success);
  t.is(createResponse.body.data.lat, newYork.lat);
  t.is(createResponse.body.data.lng, newYork.lng);
  
  // Retrieve coordinates via GET
  const getResponse = await client.get(`v1/coordinates/${userId}`);
  t.is(getResponse.statusCode, 200);
  t.true(getResponse.body.success);
  t.is(getResponse.body.data.lat, newYork.lat);
  t.is(getResponse.body.data.lng, newYork.lng);
  
  // Update coordinates (simulating GPS movement)
  const london = { lat: 51.5074, lng: -0.1278 };
  const updateResponse = await client.put(`v1/coordinates/${userId}`, {
    json: london
  });
  
  t.is(updateResponse.statusCode, 200);
  t.is(updateResponse.body.data.lat, london.lat);
  t.is(updateResponse.body.data.lng, london.lng);
  
  // Verify updated coordinates
  const verifyResponse = await client.get(`v1/coordinates/${userId}`);
  t.is(verifyResponse.statusCode, 200);
  t.is(verifyResponse.body.data.lat, london.lat);
  t.is(verifyResponse.body.data.lng, london.lng);
});
