import http from "node:http";
import got from "got";
import { CookieJar } from "tough-cookie";
import dotenv from "dotenv";
import app from "../app.js";
import { connectDatabase, isMockDataMode } from '../config/database.js';
import { seedTestData } from './testSetup.js';

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
		await connectDatabase();
		await seedTestData();
		
		globalServer = http.createServer(app);
		const server = globalServer.listen();
		const { port } = server.address();
		globalBaseUrl = `http://localhost:${port}`;
		
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
 */
export async function testForbiddenUserAction(t, method, endpoint, body) {
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

// Export all assertion helpers from separate module
export * from './testAssertions.js';