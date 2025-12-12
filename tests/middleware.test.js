import test from "ava";
import {
	setupTestServer,
	cleanupTestServer,
	createClient,
	registerAndLogin,
	generateUsername,
	generateEmail,
} from "./helpers.js";

/**
 * Middleware Tests
 * Tests for authentication and authorization middleware
 */

test.before(setupTestServer);
test.after.always(cleanupTestServer);

// ============================================================================
// optionalAuth Middleware Tests
// ============================================================================

test("optionalAuth middleware - should work without token", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Routes that use optionalAuth should work without authentication
	const response = await client.get("v1/exhibits/search");
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
});

test.serial("optionalAuth middleware - should work with valid token", async (t) => {
	const username = generateUsername();
	const email = generateEmail();
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		email,
		"Password123!"
	);
	
	// Should work with authentication
	const response = await client.get("v1/exhibits/search");
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
});

test("optionalAuth middleware - should continue with invalid token", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Send request with invalid token (optionalAuth should not block)
	const response = await client.get("v1/exhibits/search", {
		headers: {
			Authorization: "Bearer invalid-token-here"
		}
	});
	
	// Should still work (optionalAuth doesn't block on bad tokens)
	t.is(response.statusCode, 200);
});

// ============================================================================
// requireAdmin Middleware Tests  
// ============================================================================

test.serial("requireAdmin middleware - should block non-admin users from admin routes", async (t) => {
	const username = generateUsername();
	const email = generateEmail();
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		email,
		"Password123!"
	);
	
	// Try to access admin-only route (e.g., creating exhibits)
	const response = await client.post("v1/exhibits", {
		json: {
			exhibitId: 999,
			name: "Test Exhibit",
			description: "Test Description",
			artist: "Test Artist",
			year: 2024,
			category: "Modern Art"
		}
	});
	
	// Regular users should be blocked
	t.true(response.statusCode === 403 || response.statusCode === 401);
	t.false(response.body.success);
});

// ============================================================================
// Token Revocation Tests
// ============================================================================

test.serial("Token revocation - logout should revoke token", async (t) => {
	const username = generateUsername();
	const email = generateEmail();
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		email,
		"Password123!"
	);
	
	// Access a protected route - should work
	const beforeLogout = await client.put(`v1/users/${userId}/preferences`, {
		json: { interests: ["art"] }
	});
	t.is(beforeLogout.statusCode, 204);
	
	// Logout
	const logoutResponse = await client.post("v1/auth/logout");
	t.true(logoutResponse.statusCode === 200 || logoutResponse.statusCode === 204);
	
	// Try to access protected route with revoked token - should fail
	const afterLogout = await client.put(`v1/users/${userId}/preferences`, {
		json: { interests: ["history"] }
	});
	t.is(afterLogout.statusCode, 401);
});

// ============================================================================
// Authorization Edge Cases
// ============================================================================

test.serial("authorizeSameUser - should block access to other users", async (t) => {
	const user1 = generateUsername("user1");
	const email1 = generateEmail("user1");
	const { userId: userId1 } = await registerAndLogin(
		t.context.baseUrl,
		user1,
		email1,
		"Password123!"
	);
	
	const user2 = generateUsername("user2");
	const email2 = generateEmail("user2");
	const { client: client2 } = await registerAndLogin(
		t.context.baseUrl,
		user2,
		email2,
		"Password123!"
	);
	
	// User 2 tries to access User 1's data
	const response = await client2.put(`v1/users/${userId1}/preferences`, {
		json: { interests: ["art"] }
	});
	
	t.is(response.statusCode, 403);
	t.false(response.body.success);
	t.regex(response.body.message, /forbidden/i);
});

test("verifyToken - should reject requests with missing token", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.put("v1/users/1/preferences", {
		json: { interests: ["art"] }
	});
	
	t.is(response.statusCode, 401);
	t.false(response.body.success);
	t.regex(response.body.message, /token required/i);
});

test.serial("verifyToken - should reject invalid token signature", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Send request with malformed token
	const response = await client.put("v1/users/1/preferences", {
		json: { interests: ["art"] },
		headers: {
			Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"
		}
	});
	
	t.is(response.statusCode, 403);
	t.false(response.body.success);
});
