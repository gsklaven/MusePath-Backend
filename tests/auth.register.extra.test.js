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
 * REGISTRATION EXTRA TESTS
 * ===================================
 */

// Test that registration fails with non-string input types to prevent NoSQL injection.
test("POST /v1/auth/register - fails with non-string input types (NoSQL injection prevention)", async (t) => {
	const client = createClient(t.context.baseUrl);
	// Attempt to register with a username that is not a string
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: { "$ne": null },
			email: "test@example.com",
			password: "Test123!@#"
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username must be a string|invalid input types/i);
});

// Test that registration fails when the username is already taken.
test.serial("POST /v1/auth/register - fails with duplicate username", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("duplicate");
	
	// Register a new user with a specific username
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	// Attempt to register another user with the same username
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: username,
			email: "different@example.com",
			password: "Test123!@#"
		}
	});

	// Assert that the server returns a 409 Conflict status
	t.is(statusCode, 409);
	t.is(body.success, false);
	t.regex(body.message, /already exists/i);
});

// Test that registration fails when the email is already taken.
test.serial("POST /v1/auth/register - fails with duplicate email", async (t) => {
	const client = createClient(t.context.baseUrl);
	const email = generateEmail("duplicate");
	
	// Register a new user with a specific email
	await client.post("v1/auth/register", {
		json: {
			username: generateUsername("user1"),
			email: email,
			password: "Test123!@#"
		}
	});

	// Attempt to register another user with the same email
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: generateUsername("user2"),
			email: email,
			password: "Test123!@#"
		}
	});

	// Assert that the server returns a 409 Conflict status
	t.is(statusCode, 409);
	t.is(body.success, false);
	t.regex(body.message, /already exists/i);
});