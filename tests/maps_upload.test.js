import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail } from "./helpers.js";
import { MOCK_ADMIN_PASSWORD } from '../config/constants.js';

/**
 * Map Upload Tests
 * Tests for POST /v1/maps endpoints
 * 
 * Test Coverage:
 * - Admin authentication requirements
 * - Map data validation
 * - File format support (PNG, JPG, SVG)
 * - Successful upload response structure
 */

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