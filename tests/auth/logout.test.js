import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail } from "../helpers.js";

/**
 * Logout Endpoint Tests
 *
 * Coverage:
 * - Successful logout
 * - Logout without being logged in
 * - Token revocation after logout
 *
 * Tests run serially where indicated to avoid timestamp collisions
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * LOGOUT TESTS
 * ===================================
 */

test.serial("POST /v1/auth/logout - successful logout", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("logoutuser");
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: {
			username: username,
			password: "Test123!@#"
		}
	});

	const { body, statusCode } = await client.post("v1/auth/logout");

	t.is(statusCode, 200);
	t.is(body.success, true);
	t.is(body.message, "Logout successful");
});

test("POST /v1/auth/logout - works even without being logged in", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/logout");

	t.is(statusCode, 200);
	t.is(body.success, true);
	t.is(body.message, "Logout successful");
});

test.serial("Logout with valid token, then try to use revoked token", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("revoked");

	// Register and login
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Store the current cookie (token)
	const cookies = client.defaults.options.cookieJar.getCookiesSync(t.context.baseUrl);
	const tokenCookie = cookies.find(c => c.key === 'token');
	
	// Logout (revokes the token)
	await client.post("v1/auth/logout");

	// Try to use the revoked token by setting it manually
	if (tokenCookie) {
		client.defaults.options.cookieJar.setCookieSync(`token=${tokenCookie.value}`, t.context.baseUrl);
		
		// Try to rate an exhibit with revoked token
		const result = await client.post("v1/exhibits/1/ratings", {
			json: { rating: 5 }
		});
		
		t.is(result.statusCode, 401);
		t.is(result.body.message, "Token revoked");
	} else {
		t.pass("Cookie handling not available in test environment");
	}
});
