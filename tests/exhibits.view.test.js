import test from "ava";
import { setupTestServer, cleanupTestServer, createClient } from "./helpers.js";

// Setup the test server before running the tests
test.before(async (t) => {
	await setupTestServer(t);
});

// Cleanup the test server after all tests have run
test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * EXHIBIT VIEW TESTS
 * ===================================
 */

// Test that the endpoint returns exhibit details for a valid exhibit ID.
test("GET /v1/exhibits/:exhibit_id - returns exhibit details with valid ID", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Make a request to the exhibit endpoint with a valid ID
	const { body, statusCode } = await client("v1/exhibits/1");
	
	// Assert that the server returns a 200 OK status and the response is valid
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.exhibitId, 1);
	t.truthy(body.data.title);
	t.truthy(body.data.category);
	t.truthy(body.data.location);
});

// Test that the endpoint returns a 404 Not Found error for a non-existent exhibit.
test("GET /v1/exhibits/:exhibit_id - returns 404 for non-existent exhibit", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Make a request to the exhibit endpoint with an ID that is unlikely to exist
	const { body, statusCode } = await client("v1/exhibits/99999");
	
	// Assert that the server returns a 404 Not Found status
	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

// Test that the endpoint returns a 400 Bad Request for an invalid ID format.
test("GET /v1/exhibits/:exhibit_id - returns 400 for invalid ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Make a request to the exhibit endpoint with an invalid ID format
	const { body, statusCode } = await client("v1/exhibits/invalid");
	
	// Assert that the server returns a 400 Bad Request or 404 Not Found status
	t.true(statusCode === 400 || statusCode === 404);
	t.is(body.success, false);
});

/**
 * ===================================
 * EXHIBIT AUDIO GUIDE TESTS
 * ===================================
 */

// Test that the audio guide endpoint returns the audio guide for a valid exhibit ID.
test("GET /v1/exhibits/:exhibit_id/audio - returns audio guide with valid ID", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Make a request to the audio guide endpoint with a valid ID
	const { body, statusCode } = await client("v1/exhibits/1/audio");
	
	// Assert that the server returns a 200 OK status and the response is valid
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.truthy(body.data.audioUrl || body.data.audioGuide);
});

// Test that the audio guide endpoint returns a 404 Not Found error for a non-existent exhibit.
test("GET /v1/exhibits/:exhibit_id/audio - returns 404 for non-existent exhibit", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Make a request to the audio guide endpoint with an ID that is unlikely to exist
	const { body, statusCode } = await client("v1/exhibits/99999/audio");
	
	// Assert that the server returns a 404 Not Found status
	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

// Test that the audio guide endpoint returns a 400 Bad Request for an invalid ID format.
test("GET /v1/exhibits/:exhibit_id/audio - returns 400 for invalid exhibit ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Make a request to the audio guide endpoint with an invalid ID format
	const { body, statusCode } = await client("v1/exhibits/invalid/audio");
	
	// Assert that the server returns a 400 Bad Request or 404 Not Found status
	t.true(statusCode === 400 || statusCode === 404);
	t.is(body.success, false);
});

// Test that the audio guide endpoint handles missing audio files gracefully.
test("GET /v1/exhibits/:exhibit_id/audio - handles missing audio file gracefully", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Make a request to the audio guide endpoint with the mode set to offline
	const { body, statusCode } = await client("v1/exhibits/1/audio?mode=offline");
	
	// Assert that the server returns a 402 Payment Required status, as audio is not available in offline mode
	t.is(statusCode, 402);
	t.is(body.success, false);
	t.regex(body.message, /audio.*not.*available.*offline/i);
});