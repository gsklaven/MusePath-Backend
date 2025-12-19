gitimport test from "ava";
import {
	setupTestServer,
	cleanupTestServer,
	createClient,
	registerAndLogin,
	generateUsername,
	generateEmail,
	testForbiddenUserAction,
} from "./helpers.js";

// Setup the test server before running the tests
test.before(setupTestServer);
// Cleanup the test server after all tests have run
test.after.always(cleanupTestServer);

// ============================================================================
// PUT /users/:user_id/preferences
// ============================================================================

// Test that updating preferences requires authentication.
test("PUT /users/:user_id/preferences - should require authentication", async (t) => {
	// Create a new client without logging in
	const client = createClient(t.context.baseUrl);
	
	// Attempt to update preferences without authentication
	const response = await client.put("v1/users/1/preferences", {
		json: { interests: ["art", "history"] }
	});
	
	// Assert that the server returns a 401 Unauthorized status
	t.is(response.statusCode, 401);
	t.false(response.body.success);
});

// Test that an authenticated user can update their preferences.
test.serial("PUT /users/:user_id/preferences - should update preferences when authenticated", async (t) => {
	// Add a delay to prevent timestamp collision
	await new Promise(resolve => setTimeout(resolve, 5));
	const username = generateUsername();
	const email = generateEmail();
	// Register and login a new user
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		email,
		"Password123!"
	);
	
	// Attempt to update the user's preferences with a new set of interests
	const response = await client.put(`v1/users/${userId}/preferences`, {
		json: { interests: ["modern art", "sculpture", "renaissance"] }
	});
	
	// Assert that the server returns a 204 No Content status, indicating a successful update
	t.is(response.statusCode, 204);
});

// Test that a user cannot update another user's preferences.
test.serial("PUT /users/:user_id/preferences - should prevent updating other user preferences", async (t) => {
	// Use the helper function to test a forbidden action on the preferences endpoint
	await testForbiddenUserAction(
		t,
		"put",
		"v1/users/:user_id/preferences",
		{ interests: ["art"] }
	);
});

// Test that the server returns a 404 Not Found error for a non-existent user.
test.serial("PUT /users/:user_id/preferences - should return 404 for non-existent user", async (t) => {
	// Add a delay to prevent timestamp collision
	await new Promise(resolve => setTimeout(resolve, 5));
	const username = generateUsername();
	const email = generateEmail();
	// Register and login a new user
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		email,
		"Password123!"
	);
	
	// Attempt to update preferences for a user that does not exist
	const response = await client.put("v1/users/99999/preferences", {
		json: { interests: ["art"] }
	});
	
	// Assert that the server returns a 403 Forbidden status because the user is not authorized to update another user's preferences
	t.is(response.statusCode, 403); 
	t.false(response.body.success);
});

// Test that the server can handle an empty interests array.
test.serial("PUT /users/:user_id/preferences - should handle empty interests array", async (t) => {
	// Add a delay to prevent timestamp collision
	await new Promise(resolve => setTimeout(resolve, 5));
	const username = generateUsername();
	const email = generateEmail();
	// Register and login a new user
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		email,
		"Password123!"
	);
	
	// Attempt to update the user's preferences with an empty interests array
	const response = await client.put(`v1/users/${userId}/preferences`, {
		json: { interests: [] }
	});
	
	// Assert that the server returns a 204 No Content status, indicating a successful update
	t.is(response.statusCode, 204);
});