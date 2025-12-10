import test from "ava";
import { setupTestServer, cleanupTestServer, createClient } from "./helpers.js";

/**
 * Basic API Tests
 * Tests for basic endpoints: root, health check, 404 handling
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

test("Basic test - should pass", (t) => {
	t.pass();
});

test("GET / - returns correct response and status code", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.is(body.message, "Welcome to MusePath API");
	t.truthy(body.data);
	t.truthy(body.data.endpoints);
});

test("GET /v1/health - returns healthy status", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/health");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
});

test("GET /v1/nonexistent - returns 404", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/nonexistent");
	
	t.is(statusCode, 404);
	t.is(body.success, false);
});
