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
// PUT /v1/coordinates/:user_id - Update User Coordinates
// ============================================================================

// Test that a user can successfully update their coordinates with valid data.
test.serial('PUT /v1/coordinates/:user_id - should update coordinates with valid data', async (t) => {
  const username = generateUsername('coorduser5');
  const email = generateEmail(username);
  
  // Register and login a new user
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Define the new coordinates to be updated
  const newCoords = { lat: 40.7128, lng: -74.0060 }; // New York City
  // Make a PUT request to update the user's coordinates
  const response = await client.put(`v1/coordinates/${userId}`, {
    json: newCoords
  });
  
  // Assert that the server returns a 200 OK status and the correct response body
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.truthy(response.body.data);
  t.is(response.body.data.lat, newCoords.lat);
  t.is(response.body.data.lng, newCoords.lng);
  
  // Verify that the coordinates were persisted by fetching them again
  const getResponse = await client.get(`v1/coordinates/${userId}`);
  t.is(getResponse.body.data.lat, newCoords.lat);
  t.is(getResponse.body.data.lng, newCoords.lng);
});

// Test that a user can update their coordinates multiple times.
test.serial('PUT /v1/coordinates/:user_id - should update coordinates multiple times', async (t) => {
  const username = generateUsername('coorduser6');
  const email = generateEmail(username);
  
  // Register and login a new user
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Perform the first update with a location in London
  const london = { lat: 51.5074, lng: -0.1278 };
  await client.put(`v1/coordinates/${userId}`, { json: london });
  
  // Perform the second update with a location in Tokyo
  const tokyo = { lat: 35.6762, lng: 139.6503 };
  const response = await client.put(`v1/coordinates/${userId}`, { json: tokyo });
  
  // Assert that the second update was successful and the coordinates are updated to the new location
  t.is(response.statusCode, 200);
  t.is(response.body.data.lat, tokyo.lat);
  t.is(response.body.data.lng, tokyo.lng);
  
  // Verify that the latest coordinates are persisted
  const getResponse = await client.get(`v1/coordinates/${userId}`);
  t.is(getResponse.body.data.lat, tokyo.lat);
  t.is(getResponse.body.data.lng, tokyo.lng);
});

// Test that the endpoint requires authentication.
test.serial('PUT /v1/coordinates/:user_id - should require authentication', async (t) => {
  const client = createClient(t.context.baseUrl);
  
  // Attempt to update coordinates without logging in
  const response = await client.put('v1/coordinates/1', {
    json: { lat: 40.7128, lng: -74.0060 }
  });
  
  // Assert that the server returns a 401 Unauthorized status
  t.is(response.statusCode, 401);
  t.false(response.body.success);
});

// Test that a user cannot update another user's coordinates.
test.serial('PUT /v1/coordinates/:user_id - should prevent updating other users coordinates', async (t) => {
  const username1 = generateUsername('coorduser7');
  const email1 = generateEmail(username1);
  const username2 = generateUsername('coorduser8');
  const email2 = generateEmail(username2);
  
  // Create two separate users
  const { client: client1 } = await registerAndLogin(t.context.baseUrl, username1, email1, 'Password123!');
  const { userId: userId2, client: client2 } = await registerAndLogin(t.context.baseUrl, username2, email2, 'Password123!');
  
  // Attempt to update the second user's coordinates with the first user's session
  const response = await client1.put(`v1/coordinates/${userId2}`, {
    json: { lat: 40.7128, lng: -74.0060 }
  });
  
  // Assert that the server returns a 403 Forbidden status
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
  
  // Register and login a new user
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Test with the North Pole coordinates
  const northPole = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 90, lng: 0 }
  });
  t.is(northPole.statusCode, 200);
  t.is(northPole.body.data.lat, 90);
  
  // Test with the South Pole coordinates
  const southPole = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: -90, lng: 0 }
  });
  t.is(southPole.statusCode, 200);
  t.is(southPole.body.data.lat, -90);
});

// Test that the endpoint accepts boundary longitude values.
test.serial('PUT /v1/coordinates/:user_id - should accept boundary longitude values', async (t) => {
  const username = generateUsername('coorduser14');
  const email = generateEmail(username);
  
  // Register and login a new user
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Test with the International Date Line (East)
  const dateLine1 = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 0, lng: 180 }
  });
  t.is(dateLine1.statusCode, 200);
  t.is(dateLine1.body.data.lng, 180);
  
  // Test with the International Date Line (West)
  const dateLine2 = await client.put(`v1/coordinates/${userId}`, {
    json: { lat: 0, lng: -180 }
  });
  t.is(dateLine2.statusCode, 200);
  t.is(dateLine2.body.data.lng, -180);
});


// ============================================================================
// Real-World Coordinate Examples
// ============================================================================

// Test that the endpoint can handle various real-world coordinates.
test.serial('PUT /v1/coordinates/:user_id - should handle real-world coordinates', async (t) => {
  const username = generateUsername('coorduser19');
  const email = generateEmail(username);
  
  // Register and login a new user
  const { userId, client } = await registerAndLogin(t.context.baseUrl, username, email, 'Password123!');
  
  // Define a list of real-world locations
  const realWorldLocations = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  ];
  
  // Iterate through the locations and update the user's coordinates for each one
  for (const location of realWorldLocations) {
    const response = await client.put(`v1/coordinates/${userId}`, {
      json: { lat: location.lat, lng: location.lng }
    });
    
    // Assert that the server accepts the coordinates and the response is valid
    t.is(response.statusCode, 200, `${location.name} coordinates should be accepted`);
    t.is(response.body.data.lat, location.lat);
    t.is(response.body.data.lng, location.lng);
  }
});
