import test from 'ava';
import {
  setupTestServer,
  cleanupTestServer,
  createClient
} from './helpers.js';

/**
 * Destination List Tests
 * 
 * Test Coverage:
 * - List all destinations (GET /destinations)
 * - Filter destinations by map_id
 * - Empty results handling
 * - Basic structure validation of list items
 */

test.before(async t => {
  await setupTestServer(t);
});

test.after.always(async t => {
  await cleanupTestServer(t);
});

// ==================== List Destinations Tests ====================

test('GET /destinations - should list all destinations', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.get('v1/destinations');

  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.true(Array.isArray(response.body.data));
  t.true(response.body.data.length > 0);
  
  // Verify destination structure
  const destination = response.body.data[0];
  t.truthy(destination.destinationId);
  t.truthy(destination.name);
  t.truthy(destination.type);
  t.truthy(destination.coordinates);
});

test('GET /destinations - should filter by map_id', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.get('v1/destinations', {
    searchParams: { map_id: 1 }
  });

  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.true(Array.isArray(response.body.data));
  
  // All destinations should be for map_id 1
  response.body.data.forEach(dest => {
    t.is(dest.mapId, 1);
  });
});

test('GET /destinations - should return empty array for non-existent map', async t => {
  const client = createClient(t.context.baseUrl);

  const response = await client.get('v1/destinations', {
    searchParams: { map_id: 99999 }
  });

  t.is(response.statusCode, 200);
  t.true(response.body.success);
  t.true(Array.isArray(response.body.data));
  t.is(response.body.data.length, 0);
});
