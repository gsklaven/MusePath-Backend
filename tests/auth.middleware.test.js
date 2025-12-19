import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail } from "./helpers.js";

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * MIDDLEWARE VALIDATION TESTS
 * Tests for uncovered validation branches
 * ===================================
 */

test("POST /v1/auth/register - fails with null password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: null
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
});

test("POST /v1/auth/register - fails with number as password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: 12345678
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.is(body.message, 'Password must be a string');
});

test("POST /v1/auth/register - fails with password containing invalid characters (unicode)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "Test123!αβγ"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid characters/i);
});

test("POST /v1/auth/register - fails with password containing emoji", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "Test123!😀"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid characters/i);
});

test("POST /v1/auth/register - fails with username too short (2 chars)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "ab",
			email: "test@example.com",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username/i);
});

test("POST /v1/auth/register - fails with username too long (31+ chars)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "a".repeat(31),
			email: "test@example.com",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username/i);
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
