import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail } from "./helpers.js";
import { MOCK_ADMIN_PASSWORD } from '../config/constants.js';

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * POST /maps TESTS (Upload)
 * ===================================
 */

test("POST /maps - should require authentication", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/maps", {
		json: {
			mapData: "base64encodeddata",
			format: "png"
		}
	});
	
	t.is(statusCode, 401);
	t.is(body.success, false);
});

test("POST /maps - should require admin role", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername();
	
	// Register and login as regular user
	await client.post("v1/auth/register", {
		json: {
			username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});
	
	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});
	
	const { body, statusCode } = await client.post("v1/maps", {
		json: {
			mapData: "base64encodeddata",
			format: "png"
		}
	});
	
	t.is(statusCode, 403);
	t.is(body.success, false);
});

test.serial('POST /maps - should upload map with admin credentials', async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	await client.post("v1/auth/login", {
		json: { username: "john_smith", password: MOCK_ADMIN_PASSWORD }
	});
	
	const { body, statusCode } = await client.post("v1/maps", {
		json: {
			mapData: "base64encodedmapdata",
			format: "png"
		}
	});
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data.map_id);
});

test("POST /maps - should validate required fields", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	await client.post("v1/auth/login", {
		json: { username: "maria_garcia", password: MOCK_ADMIN_PASSWORD }
	});
	
	const { body, statusCode } = await client.post("v1/maps", {
		json: {
			mapData: "base64encodeddata"
			// missing format
		}
	});
	
	t.is(statusCode, 400);
	t.is(body.success, false);
});

test.serial('POST /maps - should accept different image formats', async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	await client.post("v1/auth/login", {
		json: { username: "chen_wei", password: MOCK_ADMIN_PASSWORD }
	});
	
	const formats = ["png", "jpg", "svg"];
	
	for (const format of formats) {
		const { body, statusCode } = await client.post("v1/maps", {
			json: {
				mapData: "base64encodeddata",
				format
			}
		});
		
		t.is(statusCode, 200);
		t.is(body.success, true);
	}
});

/**
 * ===================================
 * DELETE /maps/:map_id TESTS
 * ===================================
 */

test("DELETE /maps/:map_id - should require authentication", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.delete("v1/maps/1");
	
	t.is(statusCode, 401);
	t.is(body.success, false);
});

test("DELETE /maps/:map_id - should require admin role", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername();
	
	// Register and login as regular user
	await client.post("v1/auth/register", {
		json: {
			username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});
	
	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});
	
	const { body, statusCode } = await client.delete("v1/maps/1");
	
	t.is(statusCode, 403);
	t.is(body.success, false);
});

test("DELETE /maps/:map_id - should delete map with admin credentials", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	await client.post("v1/auth/login", {
		json: { username: "john_smith", password: MOCK_ADMIN_PASSWORD }
	});
	
	// First upload a map
	const uploadResponse = await client.post("v1/maps", {
		json: {
			mapData: "base64encodeddata",
			format: "png"
		}
	});
	
	const mapId = uploadResponse.body.data.map_id;
	
	// Delete the map
	const { statusCode } = await client.delete(`v1/maps/${mapId}`);
	
	t.is(statusCode, 204);
	
	// Verify map is deleted
	const getResponse = await client.get(`v1/maps/${mapId}`);
	t.is(getResponse.statusCode, 404);
});

test("DELETE /maps/:map_id - should return 404 for non-existent map", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	await client.post("v1/auth/login", {
		json: { username: "maria_garcia", password: MOCK_ADMIN_PASSWORD }
	});
	
	const { body, statusCode } = await client.delete("v1/maps/99999");
	
	t.is(statusCode, 404);
	t.is(body.success, false);
});

test("DELETE /maps/:map_id - should validate map ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	await client.post("v1/auth/login", {
		json: { username: "chen_wei", password: MOCK_ADMIN_PASSWORD }
	});
	
	const { body, statusCode } = await client.delete("v1/maps/invalid");
	
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.truthy(body.message.includes("Invalid"));
});

/**
 * ===================================
 * WORKFLOW TESTS
 * ===================================
 */

test.serial('Admin workflow - upload, retrieve, and delete map', async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	await client.post("v1/auth/login", {
		json: { username: "john_smith", password: MOCK_ADMIN_PASSWORD }
	});
	
	// Upload map
	const uploadResponse = await client.post("v1/maps", {
		json: {
			mapData: "workflowmapdata",
			format: "jpg"
		}
	});
	
	t.is(uploadResponse.statusCode, 200);
	const mapId = uploadResponse.body.data.map_id;
	
	// Retrieve map
	const getResponse = await client.get(`v1/maps/${mapId}`);
	t.is(getResponse.statusCode, 200);
	t.is(getResponse.body.data.map_id, mapId);
	
	// Retrieve with parameters
	const getWithParams = await client.get(`v1/maps/${mapId}?zoom=2&rotation=45`);
	t.is(getWithParams.statusCode, 200);
	t.is(getWithParams.body.data.zoom, 2);
	t.is(getWithParams.body.data.rotation, 45);
	
	// Delete map
	const deleteResponse = await client.delete(`v1/maps/${mapId}`);
	t.is(deleteResponse.statusCode, 204);
	
	// Verify deletion
	const finalGetResponse = await client.get(`v1/maps/${mapId}`);
	t.is(finalGetResponse.statusCode, 404);
});
