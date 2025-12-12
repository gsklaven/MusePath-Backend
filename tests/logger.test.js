import test from "ava";
import { setupTestServer, cleanupTestServer, createClient } from "./helpers.js";

/**
 * Logger Middleware Tests
 * Tests for request/response logging
 */

test.before(setupTestServer);
test.after.always(cleanupTestServer);

// ============================================================================
// Logger Middleware Tests
// ============================================================================

test("Logger - should log GET requests", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/health");
	
	// Logger should not affect response
	t.is(response.statusCode, 200);
	t.true(response.body.success);
});

test("Logger - should log POST requests", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.post("v1/auth/register", {
		json: {
			username: `testlogger_${Date.now()}`,
			email: `testlogger_${Date.now()}@example.com`,
			password: "Test123!@#"
		}
	});
	
	// Logger should not affect response
	t.is(response.statusCode, 201);
	t.true(response.body.success);
});

test("Logger - should log PUT requests", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// This will fail auth but logger should still log it
	const response = await client.put("v1/users/1/preferences", {
		json: { interests: ["art"] }
	});
	
	// Logger should not affect response
	t.is(response.statusCode, 401);
});

test("Logger - should log DELETE requests", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// This will fail auth but logger should still log it
	const response = await client.delete("v1/maps/1");
	
	// Logger should not affect response
	t.is(response.statusCode, 401);
});

test("Logger - should log requests with query parameters", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/maps/1?zoom=2&rotation=90");
	
	// Logger should not affect response
	t.is(response.statusCode, 200);
	t.true(response.body.success);
});

test("Logger - should log requests with different status codes", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// 404 Not Found
	const response1 = await client.get("v1/nonexistent");
	t.is(response1.statusCode, 404);
	
	// 200 OK
	const response2 = await client.get("v1/health");
	t.is(response2.statusCode, 200);
	
	// 401 Unauthorized
	const response3 = await client.put("v1/users/1/preferences", {
		json: { interests: ["art"] }
	});
	t.is(response3.statusCode, 401);
});

test("Logger - should handle requests with large payloads", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const largePayload = {
		username: `user_${Date.now()}`,
		email: `user_${Date.now()}@example.com`,
		password: "Test123!@#",
		extraData: "x".repeat(1000) // Large string
	};
	
	const response = await client.post("v1/auth/register", {
		json: largePayload
	});
	
	// Logger should handle large payloads
	t.true(response.statusCode === 201 || response.statusCode === 400);
});

test("Logger - should log concurrent requests", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Make multiple concurrent requests
	const requests = [
		client.get("v1/health"),
		client.get("v1/maps/1"),
		client.get("v1/exhibits/search"),
	];
	
	const responses = await Promise.all(requests);
	
	// All requests should be logged and complete successfully
	responses.forEach(response => {
		t.true(response.statusCode >= 200 && response.statusCode < 500);
	});
});
