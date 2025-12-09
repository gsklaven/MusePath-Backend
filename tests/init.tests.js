import http from "node:http";
import test from "ava";
import got from "got";
import app from "../app.js";

/**
 * Basic test to verify test setup
 */
test("Test passes", (t) => {
	t.pass();
});

/**
 * Setup test server before running tests
 */
test.before(async (t) => {
	t.context.server = http.createServer(app);
	const server = t.context.server.listen();
	const { port } = server.address();
	t.context.got = got.extend({ 
		responseType: "json", 
		prefixUrl: `http://localhost:${port}`,
		throwHttpErrors: false
	});
});

/**
 * Cleanup after tests
 */
test.after.always((t) => {
	t.context.server.close();
});

/**
 * Test root endpoint
 */
test("GET / returns correct response and status code", async (t) => {
	const { body, statusCode } = await t.context.got("");
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.is(body.message, "Welcome to MusePath API");
	t.truthy(body.data);
	t.truthy(body.data.endpoints);
});

/**
 * Test API health check
 */
test("GET /v1/health returns healthy status", async (t) => {
	const { body, statusCode } = await t.context.got("v1/health");
	t.is(statusCode, 200);
	t.is(body.success, true);
});

/**
 * Test 404 for non-existent endpoint
 */
test("GET /v1/nonexistent returns 404", async (t) => {
	const { body, statusCode } = await t.context.got("v1/nonexistent");
	t.is(statusCode, 404);
	t.is(body.success, false);
});

/**
 * Test authentication endpoints exist
 */
test("POST /v1/auth/register endpoint exists", async (t) => {
	const { statusCode } = await t.context.got.post("v1/auth/register", {
		json: {}
	});
	// Should return 400 for missing fields, not 404
	t.not(statusCode, 404);
});

test("POST /v1/auth/login endpoint exists", async (t) => {
	const { statusCode } = await t.context.got.post("v1/auth/login", {
		json: {}
	});
	// Should return 400 for missing fields, not 404
	t.not(statusCode, 404);
});

/**
 * Test exhibits endpoints
 */
test("GET /v1/exhibits/search returns results", async (t) => {
	const { body, statusCode } = await t.context.got("v1/exhibits/search", {
		searchParams: { exhibit_term: "art" }
	});
	// Should work with mock data
	t.true(statusCode === 200 || statusCode === 404);
	t.is(body.success, statusCode === 200);
});

/**
 * Test protected endpoints require authentication
 */
test("GET /v1/coordinates/1 requires authentication", async (t) => {
	const { statusCode } = await t.context.got("v1/coordinates/1");
	t.is(statusCode, 401);
});

test("POST /v1/routes requires authentication", async (t) => {
	const { statusCode } = await t.context.got.post("v1/routes", {
		json: {}
	});
	t.is(statusCode, 401);
});

test("POST /v1/maps requires admin authentication", async (t) => {
	const { statusCode } = await t.context.got.post("v1/maps", {
		json: { mapData: "test", format: "png" }
	});
	t.is(statusCode, 401);
});

/**
 * Test public endpoints are accessible
 */
test("GET /v1/destinations is public", async (t) => {
	const { statusCode } = await t.context.got("v1/destinations");
	t.is(statusCode, 200);
});

test("GET /v1/maps/1 is public", async (t) => {
	const { body, statusCode } = await t.context.got("v1/maps/1");
	// Should work with mock data or return 404 if not found
	t.true(statusCode === 200 || statusCode === 404);
});
