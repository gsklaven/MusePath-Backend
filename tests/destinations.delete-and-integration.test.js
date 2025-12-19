import test from 'ava';
import {
  registerAndLogin,
  setupTestServer,
  cleanupTestServer,
  createClient,
} from './helpers.js';
import { MOCK_ADMIN_PASSWORD } from '../config/constants.js';

// Setup the test server before running the tests
test.before(async t => {
  await setupTestServer(t);
});

// Cleanup the test server after all tests have run
test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== Integration Tests ====================

// Test the full workflow for a destination: list, filter, and get details.
test('Destination workflow - list, filter, and get details', async t => {
  const client = createClient(t.context.baseUrl);

  // Step 1: List all available destinations
  const listResponse = await client.get('v1/destinations');
  t.is(listResponse.statusCode, 200);
  t.true(listResponse.body.data.length > 0);

  // Step 2: Filter the destinations by a specific map_id
  const filterResponse = await client.get('v1/destinations', {
    searchParams: { map_id: 1 }
  });
  t.is(filterResponse.statusCode, 200);
  t.true(filterResponse.body.data.length > 0);

  // Step 3: Get the details of the first destination from the filtered list
  const destinationId = filterResponse.body.data[0].destinationId;
  const detailResponse = await client.get(`v1/destinations/${destinationId}`, {
    searchParams: { includeStatus: 'true' }
  });
  
  // Assert that the server returns a 200 OK status and the correct destination details
  t.is(detailResponse.statusCode, 200);
  t.is(detailResponse.body.data.destination_id, destinationId);
  t.truthy(detailResponse.body.data.status);
  t.truthy(detailResponse.body.data.crowdLevel);
});

// ==================== Delete Destination Tests ====================

// Test that an unauthenticated user cannot delete a destination.
test('DELETE /destinations/:destination_id - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  // Attempt to delete a destination without logging in
  const response = await client.delete('v1/destinations/1');

  // Assert that the server returns a 401 Unauthorized status
  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.regex(response.body.message, /token|authentication/i);
});

// Test that a non-admin user cannot delete a destination.
test.serial('DELETE /destinations/:destination_id - should require admin role', async t => {
  // Create a new client without admin privileges
  const { client: userClient } = await registerAndLogin(
    t.context.baseUrl,
    'destdelete',
    'destdelete@example.com',
    'Password123!'
  );

  // Attempt to delete a destination with a non-admin user
  const response = await userClient.delete('v1/destinations/1');

  // Assert that the server returns a 403 Forbidden status
  t.is(response.statusCode, 403);
  t.false(response.body.success);
  t.regex(response.body.message, /admin/i);
});

// Test that an admin user can successfully delete a destination.
test.serial('DELETE /destinations/:destination_id - should delete destination with admin credentials', async t => {
  const client = createClient(t.context.baseUrl);
  
  // Login as an admin user to get an authentication token
  const loginResponse = await client.post('v1/auth/login', {
    json: {
      username: 'john_smith',
      password: MOCK_ADMIN_PASSWORD
    }
  });
  
  const { token } = loginResponse.body.data;
  
  // First, create a new destination to be deleted
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
  
  // Now, delete the newly created destination
  const deleteResponse = await client.delete(`v1/destinations/${destinationId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  // Assert that the server returns a 204 No Content status, indicating successful deletion
  t.is(deleteResponse.statusCode, 204);
  
  // Verify that the destination is no longer accessible
  const getResponse = await client.get(`v1/destinations/${destinationId}`);
  t.is(getResponse.statusCode, 404);
});

// Test that the server returns a 404 Not Found error when trying to delete a non-existent destination.
test('DELETE /destinations/:destination_id - should return 404 for non-existent destination', async t => {
  const client = createClient(t.context.baseUrl);
  
  // Login as an admin user
  const loginResponse = await client.post('v1/auth/login', {
    json: {
      username: 'john_smith',
      password: MOCK_ADMIN_PASSWORD
    }
  });
  
  const { token } = loginResponse.body.data;
  
  // Attempt to delete a destination with an ID that does not exist
  const response = await client.delete('v1/destinations/99999', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  // Assert that the server returns a 404 Not Found status
  t.is(response.statusCode, 404);
  t.false(response.body.success);
});