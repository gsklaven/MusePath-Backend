import test from "ava";
import { setupTestServer, cleanupTestServer, createClient } from "./helpers.js";

/**
 * Error Handler Middleware Tests
 * Tests for centralized error handling
 */

test.before(setupTestServer);
test.after.always(cleanupTestServer);

// ============================================================================
// Error Handler Tests
// ============================================================================

test("Error handler - should return 404 for non-existent route", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/nonexistent-route");
	
	t.is(response.statusCode, 404);
	t.false(response.body.success);
	t.is(response.body.message, "Route not found");
});

test("Error handler - should handle invalid JSON in request body", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Send malformed JSON
	const response = await client.post("v1/auth/login", {
		body: "{invalid json}",
		headers: { "Content-Type": "application/json" }
	});
	
	// Should handle the parse error gracefully
	t.true(response.statusCode >= 400);
});

test("Error handler - should handle validation errors from exhibits", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Try to create exhibit with missing required fields
	const response = await client.post("v1/exhibits", {
		json: {
			// Missing required fields like name, description, etc.
		}
	});
	
	t.true(response.statusCode >= 400);
	t.false(response.body.success);
});

test("Error handler - should handle invalid exhibit ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Use an invalid ID (not a number in mock mode)
	const response = await client.get("v1/exhibits/invalid-id-format");
	
	t.true(response.statusCode >= 400);
	t.false(response.body.success);
});

test("Error handler - should handle invalid route ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.get("v1/routes/not-a-number");
	
	t.true(response.statusCode >= 400);
	t.false(response.body.success);
});

test("Error handler - should handle server errors gracefully", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Try to access routes that might trigger internal errors
	const response = await client.get("v1/exhibits/999999");
	
	// Should return proper error response
	t.true(response.statusCode >= 400 || response.statusCode === 200);
	t.true(typeof response.body === "object");
	t.true("success" in response.body);
});
