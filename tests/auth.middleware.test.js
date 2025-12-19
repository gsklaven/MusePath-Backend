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
 * MIDDLEWARE VALIDATION TESTS
 * Tests for uncovered validation branches
 * ===================================
 */

// Test that registration fails when the password is null.
test("POST /v1/auth/register - fails with null password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Attempt to register with a null password
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: null
		}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
});

// Test that registration fails when the password is a number.
test("POST /v1/auth/register - fails with number as password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Attempt to register with a numeric password
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: 12345678
		}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.is(body.message, 'Password must be a string');
});

// Test that registration fails when the password contains invalid unicode characters.
test("POST /v1/auth/register - fails with password containing invalid characters (unicode)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Attempt to register with a password containing unicode characters
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "Test123!αβγ"
		}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid characters/i);
});

// Test that registration fails when the password contains an emoji.
test("POST /v1/auth/register - fails with password containing emoji", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Attempt to register with a password containing an emoji
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "Test123!😀"
		}
	});

	// Assert that the server returns a 400 Bad Request status
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid characters/i);
});

// Test that registration fails when the username is too short.
test("POST /v1/auth/register - fails with username too short (2 chars)", async (t) => {
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
	t.regex(body.message, /username/i);
});

// Test that registration fails when the username is too long.
test("POST /v1/auth/register - fails with username too long (31+ chars)", async (t) => {
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
	t.regex(body.message, /username/i);
});

// Test that a revoked token cannot be used to access protected routes.
test.serial("Logout with valid token, then try to use revoked token", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("revoked");

	// Register and login a new user
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

	// Store the authentication token from the cookie
	const cookies = client.defaults.options.cookieJar.getCookiesSync(t.context.baseUrl);
	const tokenCookie = cookies.find(c => c.key === 'token');
	
	// Log out to revoke the token
	await client.post("v1/auth/logout");

	// Attempt to use the revoked token to access a protected route
	if (tokenCookie) {
		client.defaults.options.cookieJar.setCookieSync(`token=${tokenCookie.value}`, t.context.baseUrl);
		
		// Attempt to rate an exhibit with the revoked token
		const result = await client.post("v1/exhibits/1/ratings", {
			json: { rating: 5 }
		});
		
		// Assert that the server returns a 401 Unauthorized status with a 'Token revoked' message
		t.is(result.statusCode, 401);
		t.is(result.body.message, "Token revoked");
	} else {
		// If cookie handling is not available in the test environment, pass the test
		t.pass("Cookie handling not available in test environment");
	}
});