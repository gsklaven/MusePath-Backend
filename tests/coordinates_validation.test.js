import test from 'ava';
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin, generateUsername, generateEmail } from './helpers.js';

/**
 * Coordinate Validation Tests
 * 
 * Tests for input validation of coordinate endpoints
 * 
 * Test Coverage:
 * - Latitude validation (-90 to 90)
 * - Longitude validation (-180 to 180)
 * - Boundary value handling (poles, date line)
 * - Data type validation (numeric checks)
 * - Missing field validation
 * - Real-world coordinate scenarios
 */

test.before(async (t) => {
  await setupTestServer(t);
});

test.after.always((t) => {
  cleanupTestServer(t);
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