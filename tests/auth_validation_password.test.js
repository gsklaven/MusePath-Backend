import test from "ava";
import { setupTestServer, cleanupTestServer, createClient } from './helpers.js';

/**
 * Authentication Password Validation Tests
 * Tests for password strength and constraints
 * 
 * Test Coverage:
 * - Password strength (uppercase, lowercase, digit, special char, length)
 * - Edge cases (null, number, emoji, invalid chars)
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

// Password strength check: ensure uppercase characters are required
test.serial("POST /v1/auth/register - fails with weak password (no uppercase)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "test123!@"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /uppercase/i);
});

// Password strength check: ensure lowercase characters are required
test.serial("POST /v1/auth/register - fails with weak password (no lowercase)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "TEST123!@"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /lowercase/i);
});

// Password strength check: ensure digits are required
test.serial("POST /v1/auth/register - fails with weak password (no digit)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "TestTest!@"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /digit/i);
});

// Password strength check: ensure special characters are required
test.serial("POST /v1/auth/register - fails with weak password (no special character)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "Test123456"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /special character/i);
});

// Password strength check: ensure minimum length is enforced
test.serial("POST /v1/auth/register - fails with short password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "Test1!"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /at least 8 characters/i);
});

// Edge case: password is a number
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

// Edge case: password contains invalid characters
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

// Edge case: password is null
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

// Edge case: password contains emoji
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