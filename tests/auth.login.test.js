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
 * LOGIN TESTS
 * ===================================
 */

// Test that a user can successfully log in with valid credentials.
test.serial("POST /v1/auth/login - successful login with valid credentials", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("loginuser");
	
	// Register a new user to test login functionality
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	// Attempt to log in with the newly created user's credentials
	const { body, statusCode, headers } = await client.post("v1/auth/login", {
		json: {
			username: username,
			password: "Test123!@#"
		}
	});

	// Assert that the server returns a 200 OK status and the correct response body
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.is(body.message, "Login successful");
	t.truthy(body.data);
	t.is(body.data.username, username);
	t.falsy(body.data.password);
	
	// Assert that a token is set in the cookies
	t.truthy(headers["set-cookie"]);
	const cookieHeader = Array.isArray(headers["set-cookie"]) 
		? headers["set-cookie"][0] 
		: headers["set-cookie"];
	t.regex(cookieHeader, /token=/);
});

// Test that login fails when the username is missing.
test("POST /v1/auth/login - fails with missing username", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Attempt to log in without providing a username
	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			password: "Test123!@#"
		}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username.*required/i);
});

// Test that login fails when the password is missing.
test("POST /v1/auth/login - fails with missing password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Attempt to log in without providing a password
	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			username: "testuser"
		}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /password.*required/i);
});

// Test that login fails with a non-existent username.
test("POST /v1/auth/login - fails with non-existent username", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Attempt to log in with a username that does not exist
	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			username: "nonexistentuser123456",
			password: "Test123!@#"
		}
	});

	// Assert that the server returns a 401 Unauthorized status
	t.is(statusCode, 401);
	t.is(body.success, false);
	t.regex(body.message, /invalid credentials/i);
});

// Test that login fails with the wrong password.
test.serial("POST /v1/auth/login - fails with wrong password", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("wrongpw");
	
	// Register a new user
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	// Attempt to log in with the correct username but a wrong password
	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			username: username,
			password: "WrongPassword123!@#"
		}
	});

	// Assert that the server returns a 401 Unauthorized status
	t.is(statusCode, 401);
	t.is(body.success, false);
	t.regex(body.message, /invalid credentials/i);
});

// Test that login fails with an invalid username format.
test("POST /v1/auth/login - fails with invalid username format", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Attempt to log in with a username that has an invalid format
	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			username: "invalid@user",
			password: "Test123!@#"
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username can only contain|invalid username format|username must be a string|username must be 3-30 characters/i);
});

// Test that login fails with non-string input types to prevent NoSQL injection.
test("POST /v1/auth/login - fails with non-string input types (NoSQL injection prevention)", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Attempt to log in with a username and password that are not strings
	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			username: { "$ne": null },
			password: { "$ne": null }
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username must be a string|invalid input types/i);
});