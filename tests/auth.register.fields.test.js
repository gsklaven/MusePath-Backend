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
 * REGISTRATION FIELDS VALIDATION TESTS
 * ===================================
 */

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
