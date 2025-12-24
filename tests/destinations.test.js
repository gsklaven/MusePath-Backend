import test from 'ava';
import {
  registerAndLogin,
  setupTestServer,
  cleanupTestServer,
  createClient,
  generateUsername,
  generateEmail,
  assertListDestinations,
  assertGetDestination
} from './helpers.js';
import { MOCK_ADMIN_PASSWORD } from '../config/constants.js';

/**
 * Destination Management Tests
 * 
 * Test Coverage:
 * - List destinations (GET /destinations)
 * - Get destination info (GET /destinations/:destination_id)
 * - Upload destinations (POST /destinations)
 * - Query parameters (map_id, includeStatus, includeAlternatives)
 * - Authentication and authorization
 * - Admin-only endpoints
 * - Input validation
 */

test.before(async t => {
  await setupTestServer(t);
});

test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== List Destinations Tests ====================

test('GET /destinations - should list all destinations', async t => {
  const response = await assertListDestinations(t);
  t.true(response.body.data.length > 0);
  
  // Verify destination structure
  const destination = response.body.data[0];
  t.truthy(destination.destinationId);
  t.truthy(destination.name);
  t.truthy(destination.type);
  t.truthy(destination.coordinates);
});

test('GET /destinations - should filter by map_id', async t => {
  const response = await assertListDestinations(t, { map_id: 1 });
  
  // All destinations should be for map_id 1
  response.body.data.forEach(dest => {
    t.is(dest.mapId, 1);
  });
});

test('GET /destinations - should return empty array for non-existent map', async t => {
  const response = await assertListDestinations(t, { map_id: 99999 });
  t.is(response.body.data.length, 0);
});

// ==================== Get Destination Info Tests ====================

test('GET /destinations/:destination_id - should get destination by ID', async t => {
  const response = await assertGetDestination(t, 1);
  t.truthy(response.body.data.name);
  t.truthy(response.body.data.type);
  t.truthy(response.body.data.coordinates);
  t.truthy(response.body.data.coordinates.lat);
  t.truthy(response.body.data.coordinates.lng);
});

test('GET /destinations/:destination_id - should return 404 for non-existent destination', async t => {
  const response = await assertGetDestination(t, 99999, {}, 404);
  t.false(response.body.success);
  t.regex(response.body.message, /destination not found/i);
});

test('GET /destinations/:destination_id - should include status when requested', async t => {
  const response = await assertGetDestination(t, 1, { includeStatus: 'true' });
  t.truthy(response.body.data.status);
  t.truthy(response.body.data.crowdLevel);
  t.truthy(response.body.data.lastUpdated);
});

test('GET /destinations/:destination_id - should exclude status by default', async t => {
  const response = await assertGetDestination(t, 1);
  t.is(response.body.data.status, undefined);
  t.is(response.body.data.crowdLevel, undefined);
  t.is(response.body.data.lastUpdated, undefined);
});

test('GET /destinations/:destination_id - should include alternatives when requested and unavailable', async t => {
  const response = await assertGetDestination(t, 7, { 
    includeAlternatives: 'true',
    includeStatus: 'true'
  });
  
  // Should include alternatives for closed destination
  t.is(response.body.data.status, 'closed');
  t.truthy(response.body.data.alternatives);
  t.true(Array.isArray(response.body.data.alternatives));
  t.true(response.body.data.alternatives.length > 0);
  t.truthy(response.body.data.suggestedTimes);
  t.true(Array.isArray(response.body.data.suggestedTimes));
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

test('POST /destinations - should reject missing map_id', async t => {
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
      destinations: []
    }
  });
  
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.truthy(response.body.message);
});

test('POST /destinations - should reject missing destinations array', async t => {
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
      map_id: 1
    }
  });
  
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.truthy(response.body.message);
});

test('POST /destinations - should reject non-array destinations', async t => {
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
      destinations: 'not an array'
    }
  });
  
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.truthy(response.body.message);
});

// ==================== Destination Types Tests ====================

test('GET /destinations - should return different destination types', async t => {
  const response = await assertListDestinations(t);
  
  // Check for different types in mock data
  const types = response.body.data.map(d => d.type);
  const uniqueTypes = [...new Set(types)];
  
  t.true(uniqueTypes.length > 1, 'Should have multiple destination types');
  t.true(types.includes('entrance') || types.includes('exhibit') || types.includes('restroom') || types.includes('cafe'));
});

test('GET /destinations - should return destinations with coordinates', async t => {
  const response = await assertListDestinations(t);
  
  // All destinations should have valid coordinates
  response.body.data.forEach(dest => {
    t.truthy(dest.coordinates);
    t.is(typeof dest.coordinates.lat, 'number');
    t.is(typeof dest.coordinates.lng, 'number');
    t.true(dest.coordinates.lat >= -90 && dest.coordinates.lat <= 90);
    t.true(dest.coordinates.lng >= -180 && dest.coordinates.lng <= 180);
  });
});

// ==================== Integration Tests ====================

test('Destination workflow - list, filter, and get details', async t => {
  const client = createClient(t.context.baseUrl);

  // Step 1: List all destinations
  const listResponse = await client.get('v1/destinations');
  t.is(listResponse.statusCode, 200);
  t.true(listResponse.body.data.length > 0);

  // Step 2: Filter by map_id
  const filterResponse = await client.get('v1/destinations', {
    searchParams: { map_id: 1 }
  });
  t.is(filterResponse.statusCode, 200);
  t.true(filterResponse.body.data.length > 0);

  // Step 3: Get details of first destination
  const destinationId = filterResponse.body.data[0].destinationId;
  const detailResponse = await client.get(`v1/destinations/${destinationId}`, {
    searchParams: { includeStatus: 'true' }
  });
  
  t.is(detailResponse.statusCode, 200);
  t.is(detailResponse.body.data.destination_id, destinationId);
  t.truthy(detailResponse.body.data.status);
  t.truthy(detailResponse.body.data.crowdLevel);
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
