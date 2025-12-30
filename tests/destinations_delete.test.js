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
 * Destination Deletion Tests
 * 
 * Test Coverage:
 * - Delete existing destinations (DELETE /destinations/:destination_id)
 * - Admin authentication and authorization requirements
 * - Successful deletion workflow
 * - Error handling for non-existent destinations
 */

test.before(async t => {
  await setupTestServer(t);
});

test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== Delete Destination Tests ====================

test('DELETE /destinations/:destination_id - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.delete('v1/destinations/1');

  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.regex(response.body.message, /token|authentication/i);
});

test.serial('DELETE /destinations/:destination_id - should require admin role', async t => {
  const client = createClient(t.context.baseUrl);
  
  const { client: userClient } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('destdelete'),
    generateEmail('destdelete'),
    'Password123!'
  );

  const response = await userClient.delete('v1/destinations/1');

  t.is(response.statusCode, 403);
  t.false(response.body.success);
  t.regex(response.body.message, /admin/i);
});

test.serial('DELETE /destinations/:destination_id - should delete destination with admin credentials', async t => {
  const client = createClient(t.context.baseUrl);
  
  // Login as admin using existing mock user
  const loginResponse = await client.post('v1/auth/login', {
    json: {
      username: 'john_smith',
      password: MOCK_ADMIN_PASSWORD
    }
  });
  
  const { token } = loginResponse.body.data;
  
  // First, create a destination to delete
  const uploadResponse = await client.post('v1/destinations', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    json: {
      map_id: 1,
      destinations: [
        {
          exhibit_id: 1,
          name: 'Destination to Delete',
          type: 'exhibit',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          description: 'This will be deleted'
        }
      ]
    }
  });
  
  t.is(uploadResponse.statusCode, 200);
  const destinationId = uploadResponse.body.data.destinationIds[0];
  
  // Now delete it
  const deleteResponse = await client.delete(`v1/destinations/${destinationId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  t.is(deleteResponse.statusCode, 204);
  
  // Verify it's deleted
  const getResponse = await client.get(`v1/destinations/${destinationId}`);
  t.is(getResponse.statusCode, 404);
});

test('DELETE /destinations/:destination_id - should return 404 for non-existent destination', async t => {
  const client = createClient(t.context.baseUrl);
  
  // Login as admin using existing mock user
  const loginResponse = await client.post('v1/auth/login', {
    json: {
      username: 'john_smith',
      password: MOCK_ADMIN_PASSWORD
    }
  });
  
  const { token } = loginResponse.body.data;
  
  const response = await client.delete('v1/destinations/99999', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  t.is(response.statusCode, 404);
  t.false(response.body.success);
});