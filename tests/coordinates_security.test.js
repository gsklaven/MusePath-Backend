import test from 'ava';
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin, generateUsername, generateEmail } from './helpers.js';

/**
 * Coordinate Security Tests
 * 
 * Tests for authentication and authorization of coordinate endpoints
 * 
 * Test Coverage:
 * - Authentication requirements for GET/PUT
 * - Authorization checks (prevent access to other users' data)
 * - Invalid user ID handling
 */

test.before(async (t) => {
  await setupTestServer(t);
});

test.after.always((t) => {
  cleanupTestServer(t);
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