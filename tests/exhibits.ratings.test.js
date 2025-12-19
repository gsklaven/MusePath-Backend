import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin, generateUsername, generateEmail } from "./helpers.js";

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
 * EXHIBIT RATING TESTS (Protected)
 * ===================================
 */

// Test that a user can successfully rate an exhibit when authenticated.
test.serial("POST /v1/exhibits/:exhibit_id/ratings - successfully rates exhibit when authenticated", async (t) => {
	// Register and login a new user
	const username = generateUsername("rater");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Get the exhibit's initial rating to compare against later
	const beforeRating = await client("v1/exhibits/1");
	t.is(beforeRating.statusCode, 200);
	const initialRating = beforeRating.body.data.rating;
	
	// Import mock data to calculate the expected new average rating
	const { mockExhibits } = await import("../data/mockData.js");
	const exhibit = mockExhibits.find(e => e.exhibitId === 1);
	
	// Calculate the expected new average rating after the new rating is submitted
	const currentRatings = Array.from(exhibit.ratings.values());
	const newRatingValue = 4;
	const allRatings = [...currentRatings, newRatingValue];
	const rawAverage = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
	// The service rounds the average rating to one decimal place
	const expectedAverage = Math.round(rawAverage * 10) / 10;

	// Submit the new rating for the exhibit
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: newRatingValue
		}
	});

	// Assert that the server returns a 201 Created status and the correct response body
	t.is(statusCode, 201);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.exhibitId, 1);
	t.is(body.data.rating, newRatingValue);
	t.is(body.data.averageRating, expectedAverage);
	
	// Verify that the rating was actually updated in the exhibit data
	const afterRating = await client("v1/exhibits/1");
	t.is(afterRating.statusCode, 200);
	t.is(afterRating.body.data.rating, expectedAverage);
	t.not(afterRating.body.data.rating, initialRating); // The rating should have changed
});

// Test that an unauthenticated user cannot rate an exhibit.
test("POST /v1/exhibits/:exhibit_id/ratings - fails without authentication", async (t) => {
	// Create a new client without logging in
	const client = createClient(t.context.baseUrl);
	
	// Attempt to rate an exhibit
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 5
		}
	});

	// Assert that the server returns a 401 Unauthorized status
	t.is(statusCode, 401);
	t.is(body.success, false);
	t.regex(body.message, /unauthorized|authentication|token/i);
});

// Test that the server validates the exhibit ID format.
test.serial("POST /v1/exhibits/:exhibit_id/ratings - returns 400 for invalid exhibit ID format", async (t) => {
	// Register and login a new user
	const username = generateUsername("raterinvalid");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Attempt to rate an exhibit with an invalid ID format
	const { body, statusCode } = await client.post("v1/exhibits/invalid/ratings", {
		json: {
			rating: 5
		}
	});

	// Assert that the server returns a 400 Bad Request or 404 Not Found status
	t.true(statusCode === 400 || statusCode === 404);
	t.is(body.success, false);
});

// Test that the server validates the rating value (too low).
test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with invalid rating (too low)", async (t) => {
	// Register and login a new user
	const username = generateUsername("rater2");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Attempt to rate an exhibit with a rating value less than 1
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 0
		}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|invalid|valid/i);
});

// Test that the server validates the rating value (too high).
test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with invalid rating (too high)", async (t) => {
	// Register and login a new user
	const username = generateUsername("rater3");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Attempt to rate an exhibit with a rating value greater than 5
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 6
		}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|invalid|valid/i);
});

// Test that the server validates that the rating field is present.
test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with missing rating", async (t) => {
	// Register and login a new user
	const username = generateUsername("rater4");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Attempt to rate an exhibit without providing a rating value
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|required/i);
});

// Test that the server returns a 404 Not Found error when trying to rate a non-existent exhibit.
test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails for non-existent exhibit", async (t) => {
	// Register and login a new user
	const username = generateUsername("rater5");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Attempt to rate an exhibit with an ID that does not exist
	const { body, statusCode } = await client.post("v1/exhibits/99999/ratings", {
		json: {
			rating: 5
		}
	});

	// Assert that the server returns a 404 Not Found status
	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

// Test that if a user rates the same exhibit twice, the rating is updated.
test.serial("POST /v1/exhibits/:exhibit_id/ratings - updates rating when user rates same exhibit twice", async (t) => {
	// Register and login a new user
	const username = generateUsername("updater");
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Get the initial state of the exhibit's ratings from the mock data
	const { mockExhibits } = await import("../data/mockData.js");
	const exhibit = mockExhibits.find(e => e.exhibitId === 3);
	const initialRatingsCount = exhibit.ratings.size;

	// Submit the first rating for the exhibit
	const firstRating = await client.post("v1/exhibits/3/ratings", {
		json: { rating: 3 }
	});
	t.is(firstRating.statusCode, 201);
	
	// Check that the rating was added and the rating count increased by one
	t.is(exhibit.ratings.size, initialRatingsCount + 1);
	t.is(exhibit.ratings.get(userId), 3);

	// Submit a second rating from the same user with a different value
	const secondRating = await client.post("v1/exhibits/3/ratings", {
		json: { rating: 5 }
	});
	t.is(secondRating.statusCode, 201);
	
	// Assert that the rating count did not increase again (rating was updated, not duplicated)
	t.is(exhibit.ratings.size, initialRatingsCount + 1);
	// Assert that the rating value was updated to the new value
	t.is(exhibit.ratings.get(userId), 5);
	t.not(exhibit.ratings.get(userId), 3);
});