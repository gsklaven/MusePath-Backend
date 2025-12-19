import test from "ava";
import { setupTestServer, cleanupTestServer, createClient } from "./helpers.js";

/**
 * Map Endpoint Tests
 * Tests for /v1/maps endpoints
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * GET /maps/:map_id TESTS
 * ===================================
 */

test("GET /maps/:map_id - should get map by valid ID", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.get("v1/maps/1");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.map_id, 1);
	t.truthy(body.data.title);
	t.truthy(body.data.map_url);
});

test("GET /maps/:map_id - should return 404 for non-existent map", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.get("v1/maps/99999");
	
	t.is(statusCode, 404);
	t.is(body.success, false);
	t.is(body.message, "Map not found");
});

test("GET /maps/:map_id - should accept zoom parameter", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.get("v1/maps/1?zoom=2");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.is(body.data.zoom, 2);
});

test("GET /maps/:map_id - should accept rotation parameter", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.get("v1/maps/1?rotation=90");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.is(body.data.rotation, 90);
});

test("GET /maps/:map_id - should accept mode=offline parameter", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.get("v1/maps/1?mode=offline");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data.offline_available !== undefined);
});

test("GET /maps/:map_id - should accept multiple parameters", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.get("v1/maps/1?zoom=3&rotation=180&mode=offline");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.is(body.data.zoom, 3);
	t.is(body.data.rotation, 180);
	t.truthy(body.data.offline_available !== undefined);
});

test("Map retrieval - multiple maps with different parameters", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Get map 1 with zoom
	const map1 = await client.get("v1/maps/1?zoom=1.5");
	t.is(map1.statusCode, 200);
	t.is(map1.body.data.map_id, 1);
	t.is(map1.body.data.zoom, 1.5);
	
	// Get map 2 with rotation
	const map2 = await client.get("v1/maps/2?rotation=270");
	t.is(map2.statusCode, 200);
	t.is(map2.body.data.map_id, 2);
	t.is(map2.body.data.rotation, 270);
	
	// Get map 1 with offline mode
	const map1Offline = await client.get("v1/maps/1?mode=offline");
	t.is(map1Offline.statusCode, 200);
	t.truthy(map1Offline.body.data.offline_available !== undefined);
});
