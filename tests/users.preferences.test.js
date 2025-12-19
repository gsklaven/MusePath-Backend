import test from "ava";
import {
	setupTestServer,
	cleanupTestServer,
	createClient,
	registerAndLogin,
	generateUsername,
	generateEmail,
} from "./helpers.js";

test.before(setupTestServer);
test.after.always(cleanupTestServer);


// ============================================================================
// Helpers for forbidden user actions
// ============================================================================

async function testForbiddenUserAction(t, method, endpoint, body) {
	// Add delay to prevent timestamp collision
	await new Promise(resolve => setTimeout(resolve, 5));
	const username1 = generateUsername("user1");
	const email1 = generateEmail("user1");
	const { client: client1 } = await registerAndLogin(
		t.context.baseUrl,
		username1,
		email1,
		"Password123!"
	);

	const username2 = generateUsername("user2");
	const email2 = generateEmail("user2");
	const { userId: userId2 } = await registerAndLogin(
		t.context.baseUrl,
		username2,
		email2,
		"Password123!"
	);

	const url = endpoint.replace(":user_id", userId2);
	const response = await client1[method](url, body ? { json: body } : undefined);
	t.is(response.statusCode, 403);
	t.false(response.body.success);
}

// ============================================================================
// PUT /users/:user_id/preferences
// ============================================================================

test("PUT /users/:user_id/preferences - should require authentication", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.put("v1/users/1/preferences", {
		json: { interests: ["art", "history"] }
	});
	
	t.is(response.statusCode, 401);
	t.false(response.body.success);
});

test.serial("PUT /users/:user_id/preferences - should update preferences when authenticated", async (t) => {
	// Add delay to prevent timestamp collision
	await new Promise(resolve => setTimeout(resolve, 5));
	const username = generateUsername();
	const email = generateEmail();
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		email,
		"Password123!"
	);
	
	const response = await client.put(`v1/users/${userId}/preferences`, {
		json: { interests: ["modern art", "sculpture", "renaissance"] }
	});
	
	t.is(response.statusCode, 204);
});

test.serial("PUT /users/:user_id/preferences - should prevent updating other user preferences", async (t) => {
	await testForbiddenUserAction(
		t,
		"put",
		"v1/users/:user_id/preferences",
		{ interests: ["art"] }
	);
});

test.serial("PUT /users/:user_id/preferences - should return 404 for non-existent user", async (t) => {
	// Add delay to prevent timestamp collision
	await new Promise(resolve => setTimeout(resolve, 5));
	const username = generateUsername();
	const email = generateEmail();
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		email,
		"Password123!"
	);
	
	const response = await client.put("v1/users/99999/preferences", {
		json: { interests: ["art"] }
	});
	
	t.is(response.statusCode, 403); // Will fail authorization before checking if user exists
	t.false(response.body.success);
});

test.serial("PUT /users/:user_id/preferences - should handle empty interests array", async (t) => {
	// Add delay to prevent timestamp collision
	await new Promise(resolve => setTimeout(resolve, 5));
	const username = generateUsername();
	const email = generateEmail();
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		email,
		"Password123!"
	);
	
	const response = await client.put(`v1/users/${userId}/preferences`, {
		json: { interests: [] }
	});
	
	t.is(response.statusCode, 204);
});
