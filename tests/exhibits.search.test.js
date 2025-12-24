import test from "ava";
import { setupTestServer, cleanupTestServer, assertSearchExhibits } from "./helpers.js";

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
	await assertSearchExhibits(t, null, (t, data) => {
		t.true(data.length > 0);
	});
});

// Test that the search endpoint can find exhibits by a keyword.
test("GET /v1/exhibits/search - searches by keyword", async (t) => {
	await assertSearchExhibits(t, "keyword=starry", (t, data) => {
		if (data.length > 0) {
			t.regex(data[0].title.toLowerCase(), /starry/i);
		}
	});
});

// Test that the search endpoint can find exhibits by category.
test("GET /v1/exhibits/search - searches by category", async (t) => {
	await assertSearchExhibits(t, "category=paintings", (t, data) => {
		const hasCategory = data.some(exhibit => 
			exhibit.category && exhibit.category.includes("paintings")
		);
		t.true(hasCategory);
	});
});

// Test that the search endpoint returns an empty array when no matches are found.
test("GET /v1/exhibits/search - returns empty array for no matches", async (t) => {
	await assertSearchExhibits(t, "keyword=nonexistent123456", (t, data) => {
		t.is(data.length, 0);
	});
});