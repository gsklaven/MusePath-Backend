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

// Setup the test server before running the tests
test.before(async t => {
  await setupTestServer(t);
});

// Cleanup the test server after all tests have run
test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== Upload Destinations Tests ====================

// Test that an unauthenticated user cannot upload destinations.
test('POST /destinations - should require authentication', async t => {
  const client = createClient(t.context.baseUrl);

  // Attempt to upload destinations without logging in
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

  // Assert that the server returns a 401 Unauthorized status
  t.is(response.statusCode, 401);
  t.false(response.body.success);
  t.is(response.body.message, 'Authentication token required');
});

// Test that a non-admin user cannot upload destinations.
test('POST /destinations - should require admin role', async t => {
  // Register and login a regular user (not an admin)
  const { client } = await registerAndLogin(
    t.context.baseUrl,
    generateUsername('destuser'),
    generateEmail('destuser'),
    'Password123!'
  );

  // Attempt to upload destinations with a non-admin user
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

  // Assert that the server returns a 403 Forbidden status
  t.is(response.statusCode, 403);
  t.false(response.body.success);
  t.regex(response.body.message, /admin/i);
});

// Test that an admin user can successfully upload destinations.
test.serial('POST /destinations - should upload destinations with admin credentials', async t => {
  const client = createClient(t.context.baseUrl);
  
  // Login as an admin user to get an authentication token
  const loginResponse = await client.post('v1/auth/login', {
    json: {
      username: 'john_smith',
      password: MOCK_ADMIN_PASSWORD
    }
  });
  
  const { token } = loginResponse.body.data;
  
  // Upload a new destination with valid data
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
  
  // Assert that the server returns a 200 OK status and the correct response body
  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.is(response.body.data.uploaded, 1);
});

// Test that the server rejects a request with a missing map_id.
test('POST /destinations - should reject missing map_id', async t => {
  const client = createClient(t.context.baseUrl);
  
  // Login as an admin user
  const loginResponse = await client.post('v1/auth/login', {
    json: {
      username: 'john_smith',
      password: MOCK_ADMIN_PASSWORD
    }
  });
  
  const { token } = loginResponse.body.data;
  
  // Attempt to upload destinations without a map_id
  const response = await client.post('v1/destinations', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    json: {
      destinations: []
    }
  });
  
  // Assert that the server returns a 400 Bad Request status
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.truthy(response.body.message);
});

// Test that the server rejects a request with a missing destinations array.
test('POST /destinations - should reject missing destinations array', async t => {
  const client = createClient(t.context.baseUrl);
  
  // Login as an admin user
  const loginResponse = await client.post('v1/auth/login', {
    json: {
      username: 'john_smith',
      password: MOCK_ADMIN_PASSWORD
    }
  });
  
  const { token } = loginResponse.body.data;
  
  // Attempt to upload destinations without a destinations array
  const response = await client.post('v1/destinations', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    json: {
      map_id: 1
    }
  });
  
  // Assert that the server returns a 400 Bad Request status
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.truthy(response.body.message);
});

// Test that the server rejects a request with a non-array destinations field.
test('POST /destinations - should reject non-array destinations', async t => {
  const client = createClient(t.context.baseUrl);
  
  // Login as an admin user
  const loginResponse = await client.post('v1/auth/login', {
    json: {
      username: 'john_smith',
      password: MOCK_ADMIN_PASSWORD
    }
  });
  
  const { token } = loginResponse.body.data;
  
  // Attempt to upload destinations with a non-array destinations field
  const response = await client.post('v1/destinations', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    json: {
      map_id: 1,
      destinations: 'not an array'
    }
  });
  
  // Assert that the server returns a 400 Bad Request status
  t.is(response.statusCode, 400);
  t.false(response.body.success);
  t.truthy(response.body.message);
});