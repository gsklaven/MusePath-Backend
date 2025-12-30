import test from "ava";
import {
	setupTestServer,
	cleanupTestServer,
	createClient,
	registerAndLogin,
	generateUsername,
	generateEmail,
	testForbiddenUserAction,
} from "./helpers.js";

/**
 * Favourites Endpoints Tests
 * Tests for user favourites management
 * 
 * Test Coverage:
 * - Adding exhibits to favourites (POST)
 * - Removing exhibits from favourites (DELETE)
 * - Idempotency checks (duplicate adds/removes)
 * - Authorization checks
 */

test.before(setupTestServer);
test.after.always(cleanupTestServer);

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

test.serial("POST /users/:user_id/favourites - should add multiple exhibits to favourites", async (t) => {
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
	
	const response1 = await client.post(`v1/users/${userId}/favourites`, {
		json: { exhibit_id: 1 }
	});
	t.is(response1.statusCode, 204);
	
	const response2 = await client.post(`v1/users/${userId}/favourites`, {
		json: { exhibit_id: 2 }
	});
	t.is(response2.statusCode, 204);
	
	const response3 = await client.post(`v1/users/${userId}/favourites`, {
		json: { exhibit_id: 3 }
	});
	t.is(response3.statusCode, 204);
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
	await testForbiddenUserAction(t, "post", "v1/users/:user_id/favourites", { exhibit_id: 1 });
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
	await testForbiddenUserAction(t, "delete", "v1/users/:user_id/favourites/1");
});

// ============================================================================
// Favourites Workflows
// ============================================================================

test.serial("User workflow - manage favourites list", async (t) => {
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
	
	// Add multiple favourites
	await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 1 } });
	await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 2 } });
	await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 3 } });
	await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 4 } });
	
	// Remove some favourites
	const remove1 = await client.delete(`v1/users/${userId}/favourites/2`);
	t.is(remove1.statusCode, 204);
	
	const remove2 = await client.delete(`v1/users/${userId}/favourites/3`);
	t.is(remove2.statusCode, 204);
	
	// Add them back
	const add1 = await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 2 } });
	t.is(add1.statusCode, 204);
	
	const add2 = await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 3 } });
	t.is(add2.statusCode, 204);
});