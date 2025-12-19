import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail } from "../helpers.js";

/**
 * Login Endpoint Tests
 *
 * Coverage:
 * - Login with valid and invalid credentials
 * - Input validation
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
 * LOGIN TESTS
 * ===================================
 */

test.serial("POST /v1/auth/login - successful login with valid credentials", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("loginuser");
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	const { body, statusCode, headers } = await client.post("v1/auth/login", {
		json: {
			username: username,
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 200);
	t.is(body.success, true);
	t.is(body.message, "Login successful");
	t.truthy(body.data);
	t.is(body.data.username, username);
	t.falsy(body.data.password);
	
	t.truthy(headers["set-cookie"]);
	const cookieHeader = Array.isArray(headers["set-cookie"]) 
		? headers["set-cookie"][0] 
		: headers["set-cookie"];
	t.regex(cookieHeader, /token=/);
});

test("POST /v1/auth/login - fails with missing username", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username.*required/i);
});

test("POST /v1/auth/login - fails with missing password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			username: "testuser"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /password.*required/i);
});

test("POST /v1/auth/login - fails with non-existent username", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			username: "nonexistentuser123456",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 401);
	t.is(body.success, false);
	t.regex(body.message, /invalid credentials/i);
});

test.serial("POST /v1/auth/login - fails with wrong password", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("wrongpw");
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			username: username,
			password: "WrongPassword123!@#"
		}
	});

	t.is(statusCode, 401);
	t.is(body.success, false);
	t.regex(body.message, /invalid credentials/i);
});

test("POST /v1/auth/login - fails with invalid username format", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			username: "invalid@user",
			password: "Test123!@#"
		}
	});
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username can only contain|invalid username format|username must be a string|username must be 3-30 characters/i);
});

test("POST /v1/auth/login - fails with non-string input types (NoSQL injection prevention)", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client.post("v1/auth/login", {
		json: {
			username: { "$ne": null },
			password: { "$ne": null }
		}
	});
	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username must be a string|invalid input types/i);
});
