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
 * REGISTRATION EXTRA TESTS
 * ===================================
 */

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
