import http from "node:http";
import got from "got";
import { CookieJar } from "tough-cookie";
import dotenv from "dotenv";
import app from "../app.js";
import { connectDatabase } from "../config/database.js";
import { seedTestData } from "./testSetup.js";

// Load environment variables
dotenv.config();

/**
 * Test Helpers
 * Shared utilities for all test files
 */

// Global test server - shared across all test files
let globalServer = null;
let globalBaseUrl = null;

/**
 * Get or create the shared test server
 * This ensures only ONE server runs for all tests
 */
export const getTestServer = async () => {
	if (!globalServer) {
		// Initialize database connection (will use mock data if no MONGODB_URI)
		await connectDatabase();
		
		// If connected to MongoDB, ensure exhibits collection matches mock data for tests
		await seedTestData();
		
		globalServer = http.createServer(app);
		const server = globalServer.listen();
		const { port } = server.address();
		globalBaseUrl = `http://localhost:${port}`;
		
		// Set a ref to false so Node.js can exit
		globalServer.unref();
	}
	return { server: globalServer, baseUrl: globalBaseUrl };
};

/**
 * Setup test server
 * Call this in test.before() hook
 */
export const setupTestServer = async (t) => {
	const { baseUrl } = await getTestServer();
	t.context.baseUrl = baseUrl;
};

/**
 * Cleanup test server
 * This is now a no-op since the server will auto-close when tests finish
 */
export const cleanupTestServer = (t) => {
	// Server cleanup handled automatically via unref() - do nothing here
};

/**
 * Create a fresh HTTP client with new cookie jar
 * Each client instance has isolated cookies
 */
export const createClient = (baseUrl) => {
	return got.extend({
		responseType: "json",
		prefixUrl: baseUrl,
		throwHttpErrors: false,
		cookieJar: new CookieJar()
	});
};

/**
 * Register and login a user (common test pattern)
 * @returns {Object} { userId, username, client }
 */
export const registerAndLogin = async (baseUrl, username, email, password) => {
	const client = createClient(baseUrl);
	
	// Try to register; if user exists, fall back to login
	const registerResponse = await client.post("v1/auth/register", {
		json: { username, email, password }
	});

	const loginResponse = await client.post("v1/auth/login", {
		json: { username, password }
	});

	// If registration succeeded, use its returned user; otherwise use login response
	if (registerResponse.statusCode === 201 && registerResponse.body && registerResponse.body.data) {
		return {
			userId: registerResponse.body.data.userId,
			username: registerResponse.body.data.username,
			client
		};
	}

	if (loginResponse && loginResponse.body && loginResponse.body.data) {
		return {
			userId: loginResponse.body.data.userId || loginResponse.body.data.id || null,
			username: loginResponse.body.data.username || username,
			client
		};
	}

	throw new Error(`Registration failed: ${JSON.stringify(registerResponse.body)}`);
};

/**
 * Generate unique test username
 */
export const generateUsername = (prefix = "testuser") => {
		const base = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
		return base.length > 30 ? base.slice(0, 30) : base;
	};
/**
 * Generate unique test email
 */
export const generateEmail = (prefix = "testuser") => {
	return `${prefix}_${Date.now()}@example.com`;
};

/**
 * Helper function to test forbidden actions on a user-specific endpoint.
 * It creates two users, and then tries to perform an action on user2's resources using user1's client.
 * @param {object} t - The test context from ava.
 * @param {string} method - The HTTP method to use (e.g., 'put', 'post', 'delete').
 * @param {string} endpoint - The endpoint to test, with ':user_id' as a placeholder for the user ID.
 * @param {object} [body] - The request body, if any.
 */
export async function testForbiddenUserAction(t, method, endpoint, body) {
	// Add delay to prevent timestamp collision
	await new Promise(resolve => setTimeout(resolve, 5));
	const username1 = generateUsername("user1");
	const email1 = generateEmail("user1");
	const { client: client1 } = await registerAndLogin(
		t.context.baseUrl,
		username1,
		email1,
		"Password123!"
	);

	const username2 = generateUsername("user2");
	const email2 = generateEmail("user2");
	const { userId: userId2 } = await registerAndLogin(
		t.context.baseUrl,
		username2,
		email2,
		"Password123!"
	);

	const url = endpoint.replace(":user_id", userId2);
	const response = await client1[method](url, body ? { json: body } : undefined);
	t.is(response.statusCode, 403);
	t.false(response.body.success);
}

// --- NEW SHARED TEST FUNCTIONS ---

/**
 * Assert that an auth endpoint fails with specific status and message
 */
export const assertAuthFail = async (t, endpoint, payload, expectedStatus, messageRegex) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client.post(endpoint, {
		json: payload
	});

	t.is(statusCode, expectedStatus);
	t.is(body.success, false);
	if (messageRegex) {
		t.regex(body.message, messageRegex);
	}
};

/**
 * Assert successful registration
 */
export const assertRegisterSuccess = async (t, user) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: user
	});

	t.is(statusCode, 201);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.username, user.username);
	t.is(body.data.email, user.email);
	return body;
};

/**
 * Assert successful login
 */
export const assertLoginSuccess = async (t, credentials) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode, headers } = await client.post("v1/auth/login", {
		json: credentials
	});

	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.username, credentials.username);
	
	t.truthy(headers["set-cookie"]);
	const cookieHeader = Array.isArray(headers["set-cookie"]) 
		? headers["set-cookie"][0] 
		: headers["set-cookie"];
	t.regex(cookieHeader, /token=/);
	return { body, client };
};

/**
 * Assert listing destinations
 */
export const assertListDestinations = async (t, params = {}) => {
	const client = createClient(t.context.baseUrl);
	const response = await client.get('v1/destinations', { searchParams: params });

	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.true(Array.isArray(response.body.data));
	return response;
};

/**
 * Assert getting a single destination
 */
export const assertGetDestination = async (t, id, params = {}, expectedStatus = 200) => {
	const client = createClient(t.context.baseUrl);
	const response = await client.get(`v1/destinations/${id}`, { searchParams: params });

	t.is(response.statusCode, expectedStatus);
	if (expectedStatus === 200) {
		t.true(response.body.success);
		t.is(response.body.data.destination_id, parseInt(id));
	}
	return response;
};

/**
 * Assert searching exhibits
 */
export const assertSearchExhibits = async (t, query, checkFn) => {
	const client = createClient(t.context.baseUrl);
	const url = query ? `v1/exhibits/search?${query}` : "v1/exhibits/search";
	const { body, statusCode } = await client(url);
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.true(Array.isArray(body.data));
	
	if (checkFn) {
		checkFn(t, body.data);
	}
};

/**
 * Assert viewing an exhibit
 */
export const assertViewExhibit = async (t, id, expectedStatus = 200) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client(`v1/exhibits/${id}`);
	
	t.is(statusCode, expectedStatus);
	if (expectedStatus === 200) {
		t.is(body.success, true);
		t.is(body.data.exhibitId, parseInt(id));
	}
	return body;
};

// --- MACROS ---

/**
 * Macro to test auth failure
 */
export const testAuthFail = async (t, endpoint, payload, expectedStatus, messageRegex) => {
	await assertAuthFail(t, endpoint, payload, expectedStatus, messageRegex);
};

/**
 * Macro to test successful registration
 */
export const testRegisterSuccess = async (t) => {
	const uniqueUsername = generateUsername();
	const uniqueEmail = generateEmail(uniqueUsername);
	
	const body = await assertRegisterSuccess(t, {
		username: uniqueUsername,
		email: uniqueEmail,
		password: "Test123!@#"
	});

	t.is(body.message, "User created successfully");
	t.is(body.data.role, "user");
	t.falsy(body.data.password);
	t.is(body.data.personalizationAvailable, false);
};

/**
 * Macro to test destination listing
 */
export const testListDestinations = async (t, params, checkFn) => {
	const response = await assertListDestinations(t, params);
	if (checkFn) checkFn(t, response.body.data);
};

/**
 * Macro to test getting a destination
 */
export const testGetDestination = async (t, id, params, expectedStatus, checkFn) => {
	const response = await assertGetDestination(t, id, params, expectedStatus);
	if (checkFn) {
		if (expectedStatus >= 200 && expectedStatus < 300) {
			checkFn(t, response.body.data);
		} else {
			checkFn(t, response.body);
		}
	}
};

/**
 * Macro to test exhibit search
 */
export const testSearchExhibits = async (t, query, checkFn) => {
	await assertSearchExhibits(t, query, checkFn);
};
