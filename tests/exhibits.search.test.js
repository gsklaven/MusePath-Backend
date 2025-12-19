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
 * EXHIBIT SEARCH TESTS
 * ===================================
 */

// Test that the search endpoint returns all exhibits when no query is provided.
test("GET /v1/exhibits/search - returns all exhibits without query", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Make a request to the search endpoint without any query parameters
	const { body, statusCode } = await client("v1/exhibits/search");
	
	// Assert that the server returns a 200 OK status and the response is valid
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	t.true(body.data.length > 0);
});

// Test that the search endpoint can find exhibits by a keyword.
test("GET /v1/exhibits/search - searches by keyword", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Make a request to the search endpoint with a keyword query parameter
	const { body, statusCode } = await client("v1/exhibits/search?keyword=starry");
	
	// Assert that the server returns a 200 OK status and the response is valid
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	// Check if the search results contain the keyword "starry"
	if (body.data.length > 0) {
		t.regex(body.data[0].title.toLowerCase(), /starry/i);
	}
});

// Test that the search endpoint can find exhibits by category.
test("GET /v1/exhibits/search - searches by category", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Make a request to the search endpoint with a category query parameter
	const { body, statusCode } = await client("v1/exhibits/search?category=paintings");
	
	// Assert that the server returns a 200 OK status and the response is valid
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	// Check if the search results contain exhibits with the "paintings" category
	if (body.data.length > 0) {
		const hasCategory = body.data.some(exhibit => 
			exhibit.category && exhibit.category.includes("paintings")
		);
		t.true(hasCategory);
	}
});

// Test that the search endpoint returns an empty array when no matches are found.
test("GET /v1/exhibits/search - returns empty array for no matches", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Make a request to the search endpoint with a keyword that is unlikely to exist
	const { body, statusCode } = await client("v1/exhibits/search?keyword=nonexistent123456");
	
	// Assert that the server returns a 200 OK status and an empty data array
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	t.is(body.data.length, 0);
});