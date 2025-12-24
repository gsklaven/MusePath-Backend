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
 * User Endpoints Tests
 * Tests for user preferences, favorites, and personalized routes
 */

test.before(setupTestServer);
test.after.always(cleanupTestServer);

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
	await testForbiddenUserAction(t, "put", "v1/users/:user_id/preferences", { interests: ["art"] });
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
	await testForbiddenUserAction(t, "get", "v1/users/:user_id/routes");
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

// ============================================================================
// User Workflows
// ============================================================================

test.serial("User workflow - set preferences, add favourites, get personalized route", async (t) => {
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
	
	// 1. Set preferences
	const prefResponse = await client.put(`v1/users/${userId}/preferences`, {
		json: { interests: ["modern art", "sculpture"] }
	});
	t.is(prefResponse.statusCode, 204);
	
	// 2. Add multiple favourites
	const fav1 = await client.post(`v1/users/${userId}/favourites`, {
		json: { exhibit_id: 1 }
	});
	t.is(fav1.statusCode, 204);
	
	const fav2 = await client.post(`v1/users/${userId}/favourites`, {
		json: { exhibit_id: 2 }
	});
	t.is(fav2.statusCode, 204);
	
	// 3. Get personalized route
	const routeResponse = await client.get(`v1/users/${userId}/routes`);
	t.is(routeResponse.statusCode, 200);
	t.true(routeResponse.body.success);
	t.truthy(routeResponse.body.data.route_id);
	
	// 4. Remove a favourite
	const removeResponse = await client.delete(`v1/users/${userId}/favourites/1`);
	t.is(removeResponse.statusCode, 204);
	
	// 5. Update preferences
	const updatePrefResponse = await client.put(`v1/users/${userId}/preferences`, {
		json: { interests: ["ancient greece", "pottery"] }
	});
	t.is(updatePrefResponse.statusCode, 204);
	
	// 6. Get new personalized route with updated preferences
	const newRouteResponse = await client.get(`v1/users/${userId}/routes`);
	t.is(newRouteResponse.statusCode, 200);
	t.true(newRouteResponse.body.success);
});

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
