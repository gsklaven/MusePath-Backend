import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail } from "../helpers.js";

/**
 * Registration Endpoint Tests
 *
 * Coverage:
 * - Registration input validation and success cases
 *
 * Tests run serially where indicated to avoid timestamp collisions
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * REGISTRATION TESTS
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

test.serial("POST /v1/auth/register - fails with weak password (no uppercase)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /uppercase/i);
});

test.serial("POST /v1/auth/register - fails with weak password (no lowercase)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "TEST123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /lowercase/i);
});

test.serial("POST /v1/auth/register - fails with weak password (no digit)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "TestTest!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /digit/i);
});

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
