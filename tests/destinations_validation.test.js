import test from 'ava';
import {
  setupTestServer,
  cleanupTestServer,
  createClient
} from './helpers.js';
import { MOCK_ADMIN_PASSWORD } from '../config/constants.js';

/**
 * Destination Validation Tests
 * 
 * Test Coverage:
 * - Input validation for upload endpoints
 * - Missing required fields (map_id, destinations)
 * - Invalid data types
 */

test.before(async t => {
  await setupTestServer(t);
});

test.after.always(async t => {
  await cleanupTestServer(t);
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