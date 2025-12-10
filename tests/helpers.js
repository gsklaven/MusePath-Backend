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

/**
 * Setup test server
 * Call this in test.before() hook
 */
export const setupTestServer = async (t) => {
	// Initialize database connection (will use mock data if no MONGODB_URI)
	await connectDatabase();
	
	t.context.server = http.createServer(app);
	const server = t.context.server.listen();
	const { port } = server.address();
	t.context.baseUrl = `http://localhost:${port}`;
	t.context.port = port;
};

/**
 * Cleanup test server
 * Call this in test.after.always() hook
 */
export const cleanupTestServer = (t) => {
	t.context.server.close();
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
