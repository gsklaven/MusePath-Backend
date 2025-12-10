import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin, generateUsername, generateEmail } from "./helpers.js";

/**
 * Exhibit Endpoint Tests
 * Tests for /v1/exhibits endpoints: search, view, audio, ratings
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

/**
 * ===================================
 * EXHIBIT RATING TESTS (Protected)
 * ===================================
 */

test.serial("POST /v1/exhibits/:exhibit_id/ratings - successfully rates exhibit when authenticated", async (t) => {
	const username = generateUsername("rater");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Get exhibit before rating to check current average
	const beforeRating = await client("v1/exhibits/1");
	t.is(beforeRating.statusCode, 200);
	const initialRating = beforeRating.body.data.rating;
	
	// Import mock data to calculate expected new average
	const { mockExhibits } = await import("../data/mockData.js");
	const exhibit = mockExhibits.find(e => e.exhibitId === 1);
	
	// Calculate expected new average rating
	const currentRatings = Array.from(exhibit.ratings.values());
	const newRatingValue = 4;
	const allRatings = [...currentRatings, newRatingValue];
	const rawAverage = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
	// The service rounds to 1 decimal place
	const expectedAverage = Math.round(rawAverage * 10) / 10;

	// Rate exhibit
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: newRatingValue
		}
	});

	t.is(statusCode, 201);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.exhibitId, 1);
	t.is(body.data.rating, newRatingValue);
	t.is(body.data.averageRating, expectedAverage);
	
	// Verify the rating was actually updated in the exhibit
	const afterRating = await client("v1/exhibits/1");
	t.is(afterRating.statusCode, 200);
	t.is(afterRating.body.data.rating, expectedAverage);
	t.not(afterRating.body.data.rating, initialRating); // Rating should have changed
});

test("POST /v1/exhibits/:exhibit_id/ratings - fails without authentication", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 5
		}
	});

	t.is(statusCode, 401);
	t.is(body.success, false);
	t.regex(body.message, /unauthorized|authentication|token/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with invalid rating (too low)", async (t) => {
	const username = generateUsername("rater2");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Try to rate with invalid value
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 0
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|invalid|valid/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with invalid rating (too high)", async (t) => {
	const username = generateUsername("rater3");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Try to rate with invalid value
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 6
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|invalid|valid/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with missing rating", async (t) => {
	const username = generateUsername("rater4");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Try to rate without rating value
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|required/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails for non-existent exhibit", async (t) => {
	const username = generateUsername("rater5");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Try to rate non-existent exhibit
	const { body, statusCode } = await client.post("v1/exhibits/99999/ratings", {
		json: {
			rating: 5
		}
	});

	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - updates rating when user rates same exhibit twice", async (t) => {
	const username = generateUsername("updater");
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Get initial state
	const { mockExhibits } = await import("../data/mockData.js");
	const exhibit = mockExhibits.find(e => e.exhibitId === 3);
	const initialRatingsCount = exhibit.ratings.size;

	// First rating
	const firstRating = await client.post("v1/exhibits/3/ratings", {
		json: { rating: 3 }
	});
	t.is(firstRating.statusCode, 201);
	
	// Check that one rating was added
	t.is(exhibit.ratings.size, initialRatingsCount + 1);
	t.is(exhibit.ratings.get(userId), 3);

	// Second rating from same user with different value
	const secondRating = await client.post("v1/exhibits/3/ratings", {
		json: { rating: 5 }
	});
	t.is(secondRating.statusCode, 201);
	
	// Rating count should NOT increase (update, not duplicate)
	t.is(exhibit.ratings.size, initialRatingsCount + 1);
	// Rating value should be updated
	t.is(exhibit.ratings.get(userId), 5);
	t.not(exhibit.ratings.get(userId), 3);
});
