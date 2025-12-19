import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail } from "../helpers.js";

/**
 * Authentication Integration Tests
 *
 * Coverage:
 * - Full authentication flow (register, login, logout)
 * - Session management
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
 * AUTHENTICATION INTEGRATION TESTS
 * ===================================
 */

test.serial("Full authentication flow: register -> login -> logout", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("fullflow");
	const email = generateEmail(username);
	const password = "Test123!@#";

	const registerResponse = await client.post("v1/auth/register", {
		json: { username, email, password }
	});
	t.is(registerResponse.statusCode, 201);
	t.is(registerResponse.body.data.username, username);

	const loginResponse = await client.post("v1/auth/login", {
		json: { username, password }
	});
	t.is(loginResponse.statusCode, 200);
	t.is(loginResponse.body.data.username, username);

	const logoutResponse = await client.post("v1/auth/logout");
	t.is(logoutResponse.statusCode, 200);
	t.is(logoutResponse.body.message, "Logout successful");
});

test.serial("Can register while already logged in", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username1 = generateUsername("user1");
	const username2 = generateUsername("user2");

	// Register and login first user
	await client.post("v1/auth/register", {
		json: {
			username: username1,
			email: generateEmail(username1),
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: { username: username1, password: "Test123!@#" }
	});

	// Try to register another user while logged in
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: username2,
			email: generateEmail(username2),
			password: "Test123!@#"
		}
	});

	// Should succeed - registration doesn't check if already logged in
	t.is(statusCode, 201);
	t.is(body.data.username, username2);
});

test.serial("Can login again while already logged in (refreshes session)", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("doublelogin");

	// Register user
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	// First login
	const firstLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});
	t.is(firstLogin.statusCode, 200);

	// Second login attempt (already logged in)
	const secondLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Should succeed - just refreshes the session token
	t.is(secondLogin.statusCode, 200);
	t.is(secondLogin.body.data.username, username);
});

test.serial("Session persists across multiple requests", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("session");

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

	// Make authenticated requests (using a protected endpoint)
	const firstRequest = await client.post("v1/exhibits/1/ratings", {
		json: { rating: 5 }
	});
	t.true(firstRequest.statusCode === 201 || firstRequest.statusCode === 404);

	// Make another authenticated request (cookie should persist)
	const secondRequest = await client.post("v1/exhibits/2/ratings", {
		json: { rating: 4 }
	});
	t.true(secondRequest.statusCode === 201 || secondRequest.statusCode === 404);
	
	// Both should succeed or both should fail with same status
	t.is(firstRequest.statusCode, secondRequest.statusCode);
});

test.serial("Logout invalidates session", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("logout");

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

	// Verify authenticated (can rate exhibits)
	const beforeLogout = await client.post("v1/exhibits/1/ratings", {
		json: { rating: 5 }
	});
	t.true(beforeLogout.statusCode === 201 || beforeLogout.statusCode === 404);

	// Logout
	await client.post("v1/auth/logout");

	// Try authenticated request after logout (should fail with 401)
	const afterLogout = await client.post("v1/exhibits/1/ratings", {
		json: { rating: 5 }
	});
	t.is(afterLogout.statusCode, 401);
});

test.serial("Can login again after logout", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("relogin");

	// Register
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	// First login
	const firstLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});
	t.is(firstLogin.statusCode, 200);

	// Logout
	await client.post("v1/auth/logout");

	// Login again
	const secondLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});
	t.is(secondLogin.statusCode, 200);
	t.is(secondLogin.body.data.username, username);
});
