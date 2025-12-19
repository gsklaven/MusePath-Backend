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
// POST /users/:user_id/favourites
// ============================================================================

test("POST /users/:user_id/favourites - should require authentication", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.post("v1/users/1/favourites", {
		json: { exhibit_id: 1 }
	});
	
	t.is(response.statusCode, 401);
	t.false(response.body.success);
});

test.serial("POST /users/:user_id/favourites - should add exhibit to favourites", async (t) => {
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
	
	const response = await client.post(`v1/users/${userId}/favourites`, {
		json: { exhibit_id: 1 }
	});
	
	t.is(response.statusCode, 204);
});

test.serial("POST /users/:user_id/favourites - should handle duplicate favourites", async (t) => {
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
	
	// Add exhibit to favourites
	const response1 = await client.post(`v1/users/${userId}/favourites`, {
		json: { exhibit_id: 1 }
	});
	t.is(response1.statusCode, 204);
	
	// Add same exhibit again
	const response2 = await client.post(`v1/users/${userId}/favourites`, {
		json: { exhibit_id: 1 }
	});
	t.is(response2.statusCode, 204); // Should still succeed (idempotent)
});

test.serial("POST /users/:user_id/favourites - should prevent adding to other user favourites", async (t) => {
	await testForbiddenUserAction(
		t,
		"post",
		"v1/users/:user_id/favourites",
		{ exhibit_id: 1 }
	);
});

// ============================================================================
// DELETE /users/:user_id/favourites/:exhibit_id
// ============================================================================

test("DELETE /users/:user_id/favourites/:exhibit_id - should require authentication", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.delete("v1/users/1/favourites/1");
	
	t.is(response.statusCode, 401);
	t.false(response.body.success);
});

test.serial("DELETE /users/:user_id/favourites/:exhibit_id - should remove exhibit from favourites", async (t) => {
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
	
	// Add exhibit to favourites
	await client.post(`v1/users/${userId}/favourites`, {
		json: { exhibit_id: 1 }
	});
	
	// Remove exhibit from favourites
	const response = await client.delete(`v1/users/${userId}/favourites/1`);
	
	t.is(response.statusCode, 204);
});

test.serial("DELETE /users/:user_id/favourites/:exhibit_id - should handle removing non-existent favourite", async (t) => {
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
	
	// Try to remove exhibit that was never added
	const response = await client.delete(`v1/users/${userId}/favourites/99`);
	
	t.is(response.statusCode, 204); // Should still succeed (idempotent)
});

test.serial("DELETE /users/:user_id/favourites/:exhibit_id - should prevent removing from other user favourites", async (t) => {
	// Add delay to prevent timestamp collision
	await new Promise(resolve => setTimeout(resolve, 5));
	const username1 = generateUsername("user1");
	const email1 = generateEmail("user1");
	const { userId: userId1, client: client1 } = await registerAndLogin(
		t.context.baseUrl,
		username1,
		email1,
		"Password123!"
	);
	
	const username2 = generateUsername("user2");
	const email2 = generateEmail("user2");
	const { userId: userId2, client: client2 } = await registerAndLogin(
		t.context.baseUrl,
		username2,
		email2,
		"Password123!"
	);
	
	// User 2 adds exhibit to favourites
	await client2.post(`v1/users/${userId2}/favourites`, {
		json: { exhibit_id: 1 }
	});
	
	// User 1 tries to remove from User 2's favourites
	const response = await client1.delete(`v1/users/${userId2}/favourites/1`);
	
	t.is(response.statusCode, 403);
	t.false(response.body.success);
});
