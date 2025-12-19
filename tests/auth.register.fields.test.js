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
 * REGISTRATION FIELDS VALIDATION TESTS
 * ===================================
 */

// Test that a user can successfully register with valid data.
test.serial("POST /v1/auth/register - successful registration with valid data", async (t) => {
	const client = createClient(t.context.baseUrl);
	const uniqueUsername = generateUsername();
	const uniqueEmail = generateEmail(uniqueUsername);
	
	// Attempt to register a new user with valid data
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: uniqueUsername,
			email: uniqueEmail,
			password: "Test123!@#"
		}
	});

	// Assert that the server returns a 201 Created status and the correct response body
	t.is(statusCode, 201);
	t.is(body.success, true);
	t.is(body.message, "User created successfully");
	t.truthy(body.data);
	t.is(body.data.username, uniqueUsername);
	t.is(body.data.email, uniqueEmail);
	t.is(body.data.role, "user");
	t.falsy(body.data.password);
	t.is(body.data.personalizationAvailable, false);
});

// Test that registration fails when the username is missing.
test.serial("POST /v1/auth/register - fails with missing username", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Attempt to register without providing a username
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			email: "test@example.com",
			password: "Test123!@#"
		}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username.*required/i);
});

// Test that registration fails when the email is missing.
test.serial("POST /v1/auth/register - fails with missing email", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Attempt to register without providing an email
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			password: "Test123!@#"
		}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /email.*required/i);
});

// Test that registration fails when the password is missing.
test.serial("POST /v1/auth/register - fails with missing password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Attempt to register without providing a password
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com"
		}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /password.*required/i);
});

// Test that registration fails with an invalid email format.
test.serial("POST /v1/auth/register - fails with invalid email format", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Attempt to register with an email that has an invalid format
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "invalid-email",
			password: "Test123!@#"
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid email|email must be a string/i);
});

// Test that registration fails with an invalid username format (contains special characters).
test.serial("POST /v1/auth/register - fails with invalid username format (special chars)", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Attempt to register with a username that contains special characters
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "test@user!",
			email: "test@example.com",
			password: "Test123!@#"
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username can only contain|username must be a string|username must be 3-30 characters/i);
});

// Test that registration fails when the username is too short.
test("POST /v1/auth/register - fails with username too short", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Attempt to register with a username that has less than 3 characters
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "ab",
			email: "test@example.com",
			password: "Test123!@#"
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username must be 3-30 characters|username must be a string|username can only contain/i);
});

// Test that registration fails when the username is too long.
test("POST /v1/auth/register - fails with username too long", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Attempt to register with a username that has more than 30 characters
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "a".repeat(31),
			email: "test@example.com",
			password: "Test123!@#"
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username must be 3-30 characters|username must be a string|username can only contain/i);
});