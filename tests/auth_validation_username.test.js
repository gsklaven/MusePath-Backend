import test from "ava";
import { setupTestServer, cleanupTestServer, createClient } from './helpers.js';

/**
 * Authentication Username Validation Tests
 * Tests for username format and constraints
 * 
 * Test Coverage:
 * - Username format (special chars)
 * - Username length (min/max)
 * - NoSQL injection prevention
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

// Username validation: ensure special characters are not allowed
test.serial("POST /v1/auth/register - fails with invalid username format (special chars)", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "test@user!",
			email: "test@example.com",
			password: "Test123!@#"
		}
	});
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username can only contain|username must be a string|username must be 3-30 characters/i);
});

// Username validation: ensure minimum length is enforced
test("POST /v1/auth/register - fails with username too short", async (t) => {
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
	t.regex(body.message, /username must be 3-30 characters|username must be a string|username can only contain/i);
});

// Username validation: ensure maximum length is enforced
test("POST /v1/auth/register - fails with username too long", async (t) => {
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
	t.regex(body.message, /username must be 3-30 characters|username must be a string|username can only contain/i);
});

// Security check: prevent NoSQL injection by validating input types
test("POST /v1/auth/register - fails with non-string input types (NoSQL injection prevention)", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: { "$ne": null },
			email: "test@example.com",
			password: "Test123!@#"
		}
	});
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username must be a string|invalid input types/i);
});

// Edge case: username too short
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

// Edge case: username too long
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