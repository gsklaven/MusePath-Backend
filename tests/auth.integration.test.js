import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail } from "./helpers.js";

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
 * AUTHENTICATION INTEGRATION TESTS
 * ===================================
 */

// Test the full authentication flow: register, login, and logout.
test.serial("Full authentication flow: register -> login -> logout", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("fullflow");
	const email = generateEmail(username);
	const password = "Test123!@#";

	// Step 1: Register a new user
	const registerResponse = await client.post("v1/auth/register", {
		json: { username, email, password }
	});
	t.is(registerResponse.statusCode, 201);
	t.is(registerResponse.body.data.username, username);

	// Step 2: Log in with the newly created user's credentials
	const loginResponse = await client.post("v1/auth/login", {
		json: { username, password }
	});
	t.is(loginResponse.statusCode, 200);
	t.is(loginResponse.body.data.username, username);

	// Step 3: Log out
	const logoutResponse = await client.post("v1/auth/logout");
	t.is(logoutResponse.statusCode, 200);
	t.is(logoutResponse.body.message, "Logout successful");
});

// Test that a user can register a new account while already logged in.
test.serial("Can register while already logged in", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username1 = generateUsername("user1");
	const username2 = generateUsername("user2");

	// Register and log in the first user
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

	// Attempt to register a second user while logged in as the first user
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: username2,
			email: generateEmail(username2),
			password: "Test123!@#"
		}
	});

	// The registration should succeed as it doesn't check if a user is already logged in
	t.is(statusCode, 201);
	t.is(body.data.username, username2);
});

// Test that a user can log in again while already logged in, which should refresh the session.
test.serial("Can login again while already logged in (refreshes session)", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("doublelogin");

	// Register a new user
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	// Perform the first login
	const firstLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});
	t.is(firstLogin.statusCode, 200);

	// Attempt a second login while already logged in
	const secondLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// The second login should succeed and refresh the session token
	t.is(secondLogin.statusCode, 200);
	t.is(secondLogin.body.data.username, username);
});

// Test that the session persists across multiple requests.
test.serial("Session persists across multiple requests", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("session");

	// Register and log in a new user
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

	// Make an authenticated request to a protected endpoint
	const firstRequest = await client.post("v1/exhibits/1/ratings", {
		json: { rating: 5 }
	});
	t.true(firstRequest.statusCode === 201 || firstRequest.statusCode === 404);

	// Make another authenticated request to ensure the cookie persists
	const secondRequest = await client.post("v1/exhibits/2/ratings", {
		json: { rating: 4 }
	});
	t.true(secondRequest.statusCode === 201 || secondRequest.statusCode === 404);
	
	// Both requests should have the same status, indicating a persistent session
	t.is(firstRequest.statusCode, secondRequest.statusCode);
});

// Test that logging out invalidates the session.
test.serial("Logout invalidates session", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("logout");

	// Register and log in a new user
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

	// Verify that the user is authenticated by accessing a protected endpoint
	const beforeLogout = await client.post("v1/exhibits/1/ratings", {
		json: { rating: 5 }
	});
	t.true(beforeLogout.statusCode === 201 || beforeLogout.statusCode === 404);

	// Log out the user
	await client.post("v1/auth/logout");

	// Attempt to access the protected endpoint again after logging out
	const afterLogout = await client.post("v1/exhibits/1/ratings", {
		json: { rating: 5 }
	});
	// The request should fail with a 401 Unauthorized status
	t.is(afterLogout.statusCode, 401);
});

// Test that a user can log in again after logging out.
test.serial("Can login again after logout", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("relogin");

	// Register a new user
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	// Perform the first login
	const firstLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});
	t.is(firstLogin.statusCode, 200);

	// Log out the user
	await client.post("v1/auth/logout");

	// Attempt to log in again
	const secondLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});
	// The second login should be successful
	t.is(secondLogin.statusCode, 200);
	t.is(secondLogin.body.data.username, username);
});