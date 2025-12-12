import test from 'ava';
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin, generateUsername, generateEmail } from './helpers.js';

/**
 * Coordinate Management Tests
 * 
 * Tests for GET/PUT /v1/coordinates/:user_id endpoints
 * - Authentication required for both endpoints
 * - authorizeSameUser: users can only access their own coordinates
 * - Coordinate validation: lat (-90 to 90), lng (-180 to 180)
 * - Automatic GPS tracking from frontend via navigator.geolocation
 * - New users don't have coordinates until first GPS update
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

test.serial('GET /v1/coordinates/:user_id - should require authentication', async (t) => {
  const client = createClient(t.context.baseUrl);
  
  // Try to get coordinates without authentication
  const response = await client.get('v1/coordinates/1');
  
  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

test.serial('GET /v1/coordinates/:user_id - should prevent access to other users coordinates', async (t) => {
  // Create two users with separate clients
  const username1 = generateUsername('coorduser2');
  const email1 = generateEmail(username1);
  const username2 = generateUsername('coorduser3');
  const email2 = generateEmail(username2);
  
  const { userId: userId1, client: client1 } = await registerAndLogin(t.context.baseUrl, username1, email1, 'Password123!');
  const { userId: userId2, client: client2 } = await registerAndLogin(t.context.baseUrl, username2, email2, 'Password123!');
  
  // Create coordinates for user2
  await client2.put(`v1/coordinates/${userId2}`, {
    json: { lat: 51.5074, lng: -0.1278 }
  });
  
  // Try to access user2's coordinates with user1's session
  const response = await client1.get(`v1/coordinates/${userId2}`);
  
  t.is(response.statusCode, 403);
  t.false(response.body.success);
  t.is(response.body.message, 'Forbidden: cannot access other user data');
});

test.serial('GET /v1/coordinates/:user_id - should handle invalid user ID', async (t) => {
  const username = generateUsername('coorduser4');
  const email = generateEmail(username);
  
  const { client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Try with invalid user ID
  const response = await client.get('v1/coordinates/invalid');
  
  t.is(response.statusCode, 403);
  t.false(response.body.success);
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

test.serial('PUT /v1/coordinates/:user_id - should require authentication', async (t) => {
  const client = createClient(t.context.baseUrl);
  
  // Try to update coordinates without authentication
  const response = await client.put('v1/coordinates/1', {
    json: { lat: 40.7128, lng: -74.0060 }
  });
  
  t.is(response.statusCode, 401);
  t.false(response.body.success);
});

test.serial('PUT /v1/coordinates/:user_id - should prevent updating other users coordinates', async (t) => {
  const username1 = generateUsername('coorduser7');
  const email1 = generateEmail(username1);
  const username2 = generateUsername('coorduser8');
  const email2 = generateEmail(username2);
  
  const { client: client1 } = await registerAndLogin(t.context.baseUrl, username1, email1, 'Password123!');
  const { userId: userId2, client: client2 } = await registerAndLogin(t.context.baseUrl, username2, email2, 'Password123!');
  
  // Try to update user2's coordinates with user1's session
  const response = await client1.put(`v1/coordinates/${userId2}`, {
    json: { lat: 40.7128, lng: -74.0060 }
  });
  
  t.is(response.statusCode, 403);
  t.false(response.body.success);
});

// ============================================================================
// Coordinate Validation Tests
// ============================================================================

test.serial('PUT /v1/coordinates/:user_id - should reject invalid latitude (too high)', async (t) => {
  const username = generateUsername('coorduser9');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  const response = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 91, lng: 0 } // Latitude > 90
  });
  
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.regex(response.body.message, /latitude/i);
});

test.serial('PUT /v1/coordinates/:user_id - should reject invalid latitude (too low)', async (t) => {
  const username = generateUsername('coorduser10');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  const response = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: -91, lng: 0 } // Latitude < -90
  });
  
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.regex(response.body.message, /latitude/i);
});

test.serial('PUT /v1/coordinates/:user_id - should reject invalid longitude (too high)', async (t) => {
  const username = generateUsername('coorduser11');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  const response = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 0, lng: 181 } // Longitude > 180
  });
  
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.regex(response.body.message, /longitude/i);
});

test.serial('PUT /v1/coordinates/:user_id - should reject invalid longitude (too low)', async (t) => {
  const username = generateUsername('coorduser12');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  const response = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 0, lng: -181 } // Longitude < -180
  });
  
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.regex(response.body.message, /longitude/i);
});

test.serial('PUT /v1/coordinates/:user_id - should accept boundary latitude values', async (t) => {
  const username = generateUsername('coorduser13');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Test North Pole
  const northPole = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 90, lng: 0 }
  });
  t.is(northPole.statusCode, 200);
  t.is(northPole.body.data.lat, 90);
  
  // Test South Pole
  const southPole = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: -90, lng: 0 }
  });
  t.is(southPole.statusCode, 200);
  t.is(southPole.body.data.lat, -90);
});

test.serial('PUT /v1/coordinates/:user_id - should accept boundary longitude values', async (t) => {
  const username = generateUsername('coorduser14');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Test International Date Line (East)
  const dateLine1 = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 0, lng: 180 }
  });
  t.is(dateLine1.statusCode, 200);
  t.is(dateLine1.body.data.lng, 180);
  
  // Test International Date Line (West)
  const dateLine2 = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 0, lng: -180 }
  });
  t.is(dateLine2.statusCode, 200);
  t.is(dateLine2.body.data.lng, -180);
});

test.serial('PUT /v1/coordinates/:user_id - should reject missing latitude', async (t) => {
  const username = generateUsername('coorduser15');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  const response = await client.put(`v1/coordinates/${userId}`, {
    json: { lng: 0 } // Missing lat
  });
  
  t.is(response.statusCode, 400);
  t.false(response.body.success);
});

test.serial('PUT /v1/coordinates/:user_id - should reject missing longitude', async (t) => {
  const username = generateUsername('coorduser16');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  const response = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 0 } // Missing lng
  });
  
  t.is(response.statusCode, 400);
  t.false(response.body.success);
});

test.serial('PUT /v1/coordinates/:user_id - should reject non-numeric latitude', async (t) => {
  const username = generateUsername('coorduser17');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  const response = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 'invalid', lng: 0 }
  });
  
  t.is(response.statusCode, 400);
  t.false(response.body.success);
});

test.serial('PUT /v1/coordinates/:user_id - should reject non-numeric longitude', async (t) => {
  const username = generateUsername('coorduser18');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  const response = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 0, lng: 'invalid' }
  });
  
  t.is(response.statusCode, 400);
  t.false(response.body.success);
});

// ============================================================================
// Real-World Coordinate Examples
// ============================================================================

test.serial('PUT /v1/coordinates/:user_id - should handle real-world coordinates', async (t) => {
  const username = generateUsername('coorduser19');
  const email = generateEmail(username);
  
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  const realWorldLocations = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  ];
  
  for (const location of realWorldLocations) {
    const response = await client.put(`v1/coordinates/${userId}`, {
      json: { lat: location.lat, lng: location.lng }
    });
    
    t.is(response.statusCode, 200, `${location.name} coordinates should be accepted`);
    t.is(response.body.data.lat, location.lat);
    t.is(response.body.data.lng, location.lng);
  }
});
