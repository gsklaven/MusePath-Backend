import test from 'ava';
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin, generateUsername, generateEmail } from './helpers.js';

/**
 * Coordinate Management Tests
 * 
 * Tests for GET/PUT /v1/coordinates/:user_id endpoints
 * 
 * Test Coverage:
 * - New user state (no coordinates)
 * - Coordinate lifecycle (create, update, retrieve)
 * - Basic retrieval and update functionality
 * - Multiple update persistence
 */

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

// ============================================================================
// GET /v1/coordinates/:user_id - Retrieve User Coordinates
// ============================================================================

test.serial('GET /v1/coordinates/:user_id - should return user coordinates when they exist', async (t) => {
  const username = generateUsername('coorduser1');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Create coordinates first
  const coords = { lat: 40.7614, lng: -73.9776 };
  await client.put(`v1/coordinates/${userId}`, { json: coords });
  
  // Get coordinates
  const response = await client.get(`v1/coordinates/${userId}`);
  
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.truthy(response.body.data);
  
  // Verify coordinate structure
  const retrievedCoords = response.body.data;
  t.is(typeof retrievedCoords.lat, 'number');
  t.is(typeof retrievedCoords.lng, 'number');
  t.is(retrievedCoords.lat, coords.lat);
  t.is(retrievedCoords.lng, coords.lng);
  t.true(retrievedCoords.lat >= -90 && retrievedCoords.lat <= 90, 'Latitude within valid range');
  t.true(retrievedCoords.lng >= -180 && retrievedCoords.lng <= 180, 'Longitude within valid range');
});

// ============================================================================
// PUT /v1/coordinates/:user_id - Update User Coordinates
// ============================================================================

test.serial('PUT /v1/coordinates/:user_id - should update coordinates with valid data', async (t) => {
  const username = generateUsername('coorduser5');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Update coordinates (simulating GPS data)
  const newCoords = { lat: 40.7128, lng: -74.0060 }; // New York City
  const response = await client.put(`v1/coordinates/${userId}`, {
    json: newCoords
  });
  
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.truthy(response.body.data);
  t.is(response.body.data.lat, newCoords.lat);
  t.is(response.body.data.lng, newCoords.lng);
  
  // Verify coordinates were persisted
  const getResponse = await client.get(`v1/coordinates/${userId}`);
  t.is(getResponse.body.data.lat, newCoords.lat);
  t.is(getResponse.body.data.lng, newCoords.lng);
});

test.serial('PUT /v1/coordinates/:user_id - should update coordinates multiple times', async (t) => {
  const username = generateUsername('coorduser6');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // First update - London
  const london = { lat: 51.5074, lng: -0.1278 };
  await client.put(`v1/coordinates/${userId}`, { json: london });
  
  // Second update - Tokyo
  const tokyo = { lat: 35.6762, lng: 139.6503 };
  const response = await client.put(`v1/coordinates/${userId}`, { json: tokyo });
  
  t.is(response.statusCode, 200);
  t.is(response.body.data.lat, tokyo.lat);
  t.is(response.body.data.lng, tokyo.lng);
  
  // Verify latest coordinates
  const getResponse = await client.get(`v1/coordinates/${userId}`);
  t.is(getResponse.body.data.lat, tokyo.lat);
  t.is(getResponse.body.data.lng, tokyo.lng);
});
