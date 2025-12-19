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
// GET /users/:user_id/routes
// ============================================================================

test("GET /users/:user_id/routes - should require authentication", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/users/1/routes");
	
	t.is(response.statusCode, 401);
	t.false(response.body.success);
});

test.serial("GET /users/:user_id/routes - should generate personalized route with preferences", async (t) => {
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
	
	// Set user preferences
	await client.put(`v1/users/${userId}/preferences`, {
		json: { interests: ["paintings", "modern art"] }
	});
	
	// Get personalized route
	const response = await client.get(`v1/users/${userId}/routes`);
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.truthy(response.body.data);
	t.truthy(response.body.data.route_id);
	t.truthy(response.body.data.exhibits);
	t.true(Array.isArray(response.body.data.exhibits));
});

test.serial("GET /users/:user_id/routes - should fail for user without preferences", async (t) => {
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
	
	// Don't set preferences, try to get personalized route
	const response = await client.get(`v1/users/${userId}/routes`);
	
	t.is(response.statusCode, 400);
	t.false(response.body.success);
	t.truthy(response.body.error);
});

test.serial("GET /users/:user_id/routes - should prevent accessing other user routes", async (t) => {
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
	const { userId: userId2, client: client2 } = await registerAndLogin(
		t.context.baseUrl,
		username2,
		email2,
		"Password123!"
	);
	
	// User 2 sets preferences
	await client2.put(`v1/users/${userId2}/preferences`, {
		json: { interests: ["art"] }
	});
	
	// User 1 tries to access User 2's personalized route
	const response = await client1.get(`v1/users/${userId2}/routes`);
	
	t.is(response.statusCode, 403);
	t.false(response.body.success);
});

test("GET /users/:user_id/routes - should fail when no exhibits match user preferences", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Login as chen_wei (user 3) who has preferences that don't match any exhibits
	await client.post("v1/auth/login", {
		json: {
			username: "chen_wei",
			password: "Password123!"
		}
	});
	
	// Try to get personalized route - should fail because preferences don't match any exhibits
	const response = await client.get("v1/users/3/routes");
	
	t.is(response.statusCode, 400);
	t.false(response.body.success);
	t.regex(response.body.message, /no matching exhibits/i);
});
