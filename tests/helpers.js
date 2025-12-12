import http from "node:http";
import got from "got";
import { CookieJar } from "tough-cookie";
import dotenv from "dotenv";
import app from "../app.js";
import { connectDatabase } from "../config/database.js";

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
	
	const registerResponse = await client.post("v1/auth/register", {
		json: { username, email, password }
	});
	
	await client.post("v1/auth/login", {
		json: { username, password }
	});
	
	if (!registerResponse.body || !registerResponse.body.data) {
		throw new Error(`Registration failed: ${JSON.stringify(registerResponse.body)}`);
	}
	
	return {
		userId: registerResponse.body.data.userId,
		username: registerResponse.body.data.username,
		client
	};
};

/**
 * Generate unique test username
 */
export const generateUsername = (prefix = "testuser") => {
	return `${prefix}_${Date.now()}`;
};

/**
 * Generate unique test email
 */
export const generateEmail = (prefix = "testuser") => {
	return `${prefix}_${Date.now()}@example.com`;
};
