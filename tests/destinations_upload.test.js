import test from 'ava';
import {
  registerAndLogin,
  setupTestServer,
  cleanupTestServer,
  createClient,
  generateUsername,
  generateEmail
} from './helpers.js';
import { MOCK_ADMIN_PASSWORD } from '../config/constants.js';

/**
 * Destination Upload Tests
 * 
 * Test Coverage:
 * - Upload new destinations (POST /destinations)
 * - Admin authentication and authorization requirements
 * - Successful upload workflow with admin credentials
 * - Response structure verification
 */

test.before(async t => {
  await setupTestServer(t);
});

test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== Upload Destinations Tests ====================

test('POST /destinations - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.post('v1/destinations', {
    json: {
      map_id: 1,
      destinations: [
        {
          name: 'Test Destination',
          type: 'exhibit',
          coordinates: { lat: 40.7620, lng: -73.9771 }
        }
      ]
    }
  });

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

test('POST /destinations - should require admin role', async t => {
  // Register a regular user (not admin)
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('destuser'),
    generateEmail('destuser'),
    'Password123!'
  );

  const response = await client.post('v1/destinations', {
    json: {
      map_id: 1,
      destinations: [
        {
          name: 'Test Destination',
          type: 'exhibit',
          coordinates: { lat: 40.7620, lng: -73.9771 }
        }
      ]
    }
  });

  t.is(response.statusCode, 403);
  t.false(response.body.success);
  t.regex(response.body.message, /admin/i);
});

test.serial('POST /destinations - should upload destinations with admin credentials', async t => {
  const client = createClient(t.context.baseUrl);
  
  // Login as admin using existing mock user
  const loginResponse = await client.post('v1/auth/login', {
    json: {
      username: 'john_smith',
      password: MOCK_ADMIN_PASSWORD
    }
  });
  
  const { token } = loginResponse.body.data;
  
  const response = await client.post('v1/destinations', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    json: {
      map_id: 1,
      destinations: [
        {
          exhibit_id: 1,
          name: 'New Test Destination',
          type: 'exhibit',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          description: 'A test destination'
        }
      ]
    }
  });
  
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.is(response.body.data.uploaded, 1);
});