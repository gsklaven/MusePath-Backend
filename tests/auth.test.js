import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail } from './helpers.js';

/**
 * Authentication Registration Tests
 * Tests for /v1/auth/register endpoint basics
 * 
 * Test Coverage:
 * - Successful registration
 * - Required field validation
 * - Duplicate user handling
 * - Email format validation
 */

test.before(async (t) => {
	// Initialize the test server and database connection before running tests
	await setupTestServer(t);
});

test.after.always((t) => {
	// Ensure the server is properly closed after tests complete
	cleanupTestServer(t);
});

/**
 * ===================================
 * REGISTRATION TESTS
 * ===================================
 */

// Verify that a new user can be registered with valid data and receives the expected response
test.serial("POST /v1/auth/register - successful registration with valid data", async (t) => {
	const client = createClient(t.context.baseUrl);
	const uniqueUsername = generateUsername();
	const uniqueEmail = generateEmail(uniqueUsername);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: uniqueUsername,
			email: uniqueEmail,
			password: "Test123!@#"
		}
	});

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

// Ensure that the registration endpoint validates the presence of a username
test.serial("POST /v1/auth/register - fails with missing username", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			email: "test@example.com",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username.*required/i);
});

// Ensure that the registration endpoint validates the presence of an email address
test.serial("POST /v1/auth/register - fails with missing email", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /email.*required/i);
});

// Ensure that the registration endpoint validates the presence of a password
test.serial("POST /v1/auth/register - fails with missing password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /password.*required/i);
});

// Verify that invalid email formats are rejected
test.serial("POST /v1/auth/register - fails with invalid email format", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "invalid-email",
			password: "Test123!@#"
		}
	});
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid email|email must be a string/i);
});

// Ensure that duplicate usernames are rejected
test.serial("POST /v1/auth/register - fails with duplicate username", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("duplicate");
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: username,
			email: "different@example.com",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 409);
	t.is(body.success, false);
	t.regex(body.message, /already exists/i);
});

// Ensure that duplicate emails are rejected
test.serial("POST /v1/auth/register - fails with duplicate email", async (t) => {
	const client = createClient(t.context.baseUrl);
	const email = generateEmail("duplicate");
	
	await client.post("v1/auth/register", {
		json: {
			username: generateUsername("user1"),
			email: email,
			password: "Test123!@#"
		}
	});

	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: generateUsername("user2"),
			email: email,
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 409);
	t.is(body.success, false);
	t.regex(body.message, /already exists/i);
});
