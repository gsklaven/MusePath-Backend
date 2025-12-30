import test from "ava";
import { setupTestServer, cleanupTestServer, createClient } from "./helpers.js";

/**
 * Exhibit Audio Guide Tests
 * Tests for /v1/exhibits/:exhibit_id/audio endpoints
 * 
 * Test Coverage:
 * - Audio guide retrieval
 * - Offline mode handling
 * - Error handling for missing audio or invalid IDs
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * EXHIBIT AUDIO GUIDE TESTS
 * ===================================
 */

test("GET /v1/exhibits/:exhibit_id/audio - returns audio guide with valid ID", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/1/audio");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.truthy(body.data.audioUrl || body.data.audioGuide);
});

test("GET /v1/exhibits/:exhibit_id/audio - returns 404 for non-existent exhibit", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/99999/audio");
	
	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

test("GET /v1/exhibits/:exhibit_id/audio - returns 400 for invalid exhibit ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/invalid/audio");
	
	t.true(statusCode === 400 || statusCode === 404);
	t.is(body.success, false);
});

test("GET /v1/exhibits/:exhibit_id/audio - handles missing audio file gracefully", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Test offline mode - audio should not be available
	const { body, statusCode } = await client("v1/exhibits/1/audio?mode=offline");
	
	// Should return 402 error when audio not available in offline mode
	t.is(statusCode, 402);
	t.is(body.success, false);
	t.regex(body.message, /audio.*not.*available.*offline/i);
});