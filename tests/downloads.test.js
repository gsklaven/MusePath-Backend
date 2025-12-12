import test from "ava";
import {
	setupTestServer,
	cleanupTestServer,
	createClient,
} from "./helpers.js";

/**
 * Downloads Endpoints Tests
 * Tests for exhibit and map download functionality
 */

test.before(setupTestServer);
test.after.always(cleanupTestServer);

// ============================================================================
// GET /downloads/exhibits/:exhibit_id
// ============================================================================

test("GET /downloads/exhibits/:exhibit_id - should download exhibit info with valid ID", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/downloads/exhibits/1");
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.truthy(response.body.data);
	t.is(response.body.data.exhibitId, 1);
	t.truthy(response.body.data.title);
	t.truthy(response.body.data.description);
});

test("GET /downloads/exhibits/:exhibit_id - should return 404 for non-existent exhibit", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/downloads/exhibits/99999");
	
	t.is(response.statusCode, 404);
	t.false(response.body.success);
});

test("GET /downloads/exhibits/:exhibit_id - should return 400 for invalid ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/downloads/exhibits/invalid");
	
	t.is(response.statusCode, 400);
	t.false(response.body.success);
});

test("GET /downloads/exhibits/:exhibit_id - should include all exhibit details", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/downloads/exhibits/1");
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	
	const exhibit = response.body.data;
	t.truthy(exhibit.title);
	t.truthy(exhibit.artist);
	t.truthy(exhibit.description);
	t.true(Array.isArray(exhibit.category));
	t.truthy(exhibit.location);
	t.truthy(exhibit.audioGuide);
});

test("GET /downloads/exhibits/:exhibit_id - should work for multiple exhibits", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response1 = await client.get("v1/downloads/exhibits/1");
	t.is(response1.statusCode, 200);
	t.is(response1.body.data.exhibitId, 1);
	
	const response2 = await client.get("v1/downloads/exhibits/2");
	t.is(response2.statusCode, 200);
	t.is(response2.body.data.exhibitId, 2);
	
	const response3 = await client.get("v1/downloads/exhibits/3");
	t.is(response3.statusCode, 200);
	t.is(response3.body.data.exhibitId, 3);
});

test("GET /downloads/exhibits/:exhibit_id - should not require authentication", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// No authentication - just making a request directly
	const response = await client.get("v1/downloads/exhibits/1");
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
});

// ============================================================================
// GET /downloads/maps/:map_id
// ============================================================================

test("GET /downloads/maps/:map_id - should download map with valid ID", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/downloads/maps/1");
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.truthy(response.body.data);
	t.is(response.body.data.mapId, 1);
	t.truthy(response.body.data.name);
	t.truthy(response.body.data.imageUrl);
});

test("GET /downloads/maps/:map_id - should return 404 for non-existent map", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/downloads/maps/99999");
	
	t.is(response.statusCode, 404);
	t.false(response.body.success);
});

test("GET /downloads/maps/:map_id - should return 400 for invalid ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/downloads/maps/invalid");
	
	t.is(response.statusCode, 400);
	t.false(response.body.success);
});

test("GET /downloads/maps/:map_id - should include all map details", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/downloads/maps/1");
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	
	const map = response.body.data;
	t.truthy(map.name);
	t.truthy(map.floor);
	t.truthy(map.imageUrl);
	t.is(typeof map.mapId, 'number');
});

test("GET /downloads/maps/:map_id - should work for multiple maps", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response1 = await client.get("v1/downloads/maps/1");
	t.is(response1.statusCode, 200);
	t.is(response1.body.data.mapId, 1);
	
	const response2 = await client.get("v1/downloads/maps/2");
	t.is(response2.statusCode, 200);
	t.is(response2.body.data.mapId, 2);
});

test("GET /downloads/maps/:map_id - should not require authentication", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// No authentication - just making a request directly
	const response = await client.get("v1/downloads/maps/1");
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
});

// ============================================================================
// Download Workflows
// ============================================================================

test("Download workflow - download multiple exhibits and maps", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Download multiple exhibits
	const exhibit1 = await client.get("v1/downloads/exhibits/1");
	t.is(exhibit1.statusCode, 200);
	t.truthy(exhibit1.body.data.title);
	
	const exhibit2 = await client.get("v1/downloads/exhibits/2");
	t.is(exhibit2.statusCode, 200);
	t.truthy(exhibit2.body.data.title);
	
	// Download multiple maps
	const map1 = await client.get("v1/downloads/maps/1");
	t.is(map1.statusCode, 200);
	t.truthy(map1.body.data.name);
	
	const map2 = await client.get("v1/downloads/maps/2");
	t.is(map2.statusCode, 200);
	t.truthy(map2.body.data.name);
	
	// Verify data is different
	t.not(exhibit1.body.data.exhibitId, exhibit2.body.data.exhibitId);
	t.not(map1.body.data.mapId, map2.body.data.mapId);
});

test("Download workflow - prepare offline content bundle", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Simulate downloading content for offline use
	const downloads = [];
	
	// Download all available exhibits
	for (let i = 1; i <= 5; i++) {
		const response = await client.get(`v1/downloads/exhibits/${i}`);
		if (response.statusCode === 200) {
			downloads.push({
				type: 'exhibit',
				id: i,
				data: response.body.data
			});
		}
	}
	
	// Download all available maps
	for (let i = 1; i <= 2; i++) {
		const response = await client.get(`v1/downloads/maps/${i}`);
		if (response.statusCode === 200) {
			downloads.push({
				type: 'map',
				id: i,
				data: response.body.data
			});
		}
	}
	
	// Verify we have content
	t.true(downloads.length > 0);
	
	// Verify we have both types
	const hasExhibits = downloads.some(d => d.type === 'exhibit');
	const hasMaps = downloads.some(d => d.type === 'map');
	t.true(hasExhibits);
	t.true(hasMaps);
});
