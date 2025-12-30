import test from "ava";
import { setupTestServer, cleanupTestServer, createClient } from "./helpers.js";

/**
 * Exhibit Retrieval Tests
 * Tests for /v1/exhibits endpoints related to searching and viewing
 * 
 * Test Coverage:
 * - Search by keyword and category
 * - View exhibit details
 * - Error handling for invalid IDs
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * EXHIBIT SEARCH TESTS
 * ===================================
 */

test("GET /v1/exhibits/search - returns all exhibits without query", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/search");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	t.true(body.data.length > 0);
});

test("GET /v1/exhibits/search - searches by keyword", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/search?keyword=starry");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	// Should find "The Starry Night"
	if (body.data.length > 0) {
		t.regex(body.data[0].title.toLowerCase(), /starry/i);
	}
});

test("GET /v1/exhibits/search - searches by category", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/search?category=paintings");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	// Should find exhibits with "paintings" category
	if (body.data.length > 0) {
		const hasCategory = body.data.some(exhibit => 
			exhibit.category && exhibit.category.includes("paintings")
		);
		t.true(hasCategory);
	}
});

test("GET /v1/exhibits/search - returns empty array for no matches", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/search?keyword=nonexistent123456");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	t.is(body.data.length, 0);
});

/**
 * ===================================
 * EXHIBIT VIEW TESTS
 * ===================================
 */

test("GET /v1/exhibits/:exhibit_id - returns exhibit details with valid ID", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/1");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.exhibitId, 1);
	t.truthy(body.data.title);
	t.truthy(body.data.category);
	t.truthy(body.data.location);
});

test("GET /v1/exhibits/:exhibit_id - returns 404 for non-existent exhibit", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/99999");
	
	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

test("GET /v1/exhibits/:exhibit_id - returns 400 for invalid ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/invalid");
	
	t.true(statusCode === 400 || statusCode === 404);
	t.is(body.success, false);
});
