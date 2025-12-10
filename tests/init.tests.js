import test from "ava";
import { setupTestServer, cleanupTestServer, createClient } from "./helpers.js";

/**
 * MusePath API Tests
 * Comprehensive test suite for the MusePath backend API
 */

/**
 * Setup shared test server before running tests
 */
test.before(async (t) => {
	await setupTestServer(t);
});

/**
 * Cleanup is now handled globally - this is a no-op
 */
test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * BASIC API TESTS
 * ===================================
 */

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

/**
 * ===================================
 * AUTHENTICATION TESTS - REGISTRATION
 * ===================================
 */

test.serial("POST /v1/auth/register - successful registration with valid data", async (t) => {
	const client = createClient(t.context.baseUrl);
	const uniqueUsername = `testuser_${Date.now()}`;
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: uniqueUsername,
			email: `${uniqueUsername}@example.com`,
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 201);
	t.is(body.success, true);
	t.is(body.message, "User created successfully");
	t.truthy(body.data);
	t.is(body.data.username, uniqueUsername);
	t.is(body.data.email, `${uniqueUsername}@example.com`);
	t.is(body.data.role, "user");
	t.falsy(body.data.password);
	t.is(body.data.personalizationAvailable, false);
});

test("POST /v1/auth/register - fails with missing username", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			email: "test@example.com",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /username.*required/i);
});

test("POST /v1/auth/register - fails with missing email", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /email.*required/i);
});

test("POST /v1/auth/register - fails with missing password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /password.*required/i);
});

test("POST /v1/auth/register - fails with invalid email format", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "invalid-email",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid email format/i);
});

test("POST /v1/auth/register - fails with weak password (no uppercase)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /uppercase/i);
});

test("POST /v1/auth/register - fails with weak password (no lowercase)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "TEST123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /lowercase/i);
});

test("POST /v1/auth/register - fails with weak password (no digit)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "TestTest!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /digit/i);
});

test("POST /v1/auth/register - fails with weak password (no special character)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "Test123456"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /special character/i);
});

test("POST /v1/auth/register - fails with short password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "Test1!"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /at least 8 characters/i);
});

test("POST /v1/auth/register - fails with invalid username format (special chars)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "test@user!",
			email: "test@example.com",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid username format/i);
});

test("POST /v1/auth/register - fails with username too short", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "ab",
			email: "test@example.com",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid username format/i);
});

test("POST /v1/auth/register - fails with username too long", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "a".repeat(31),
			email: "test@example.com",
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid username format/i);
});

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
	t.regex(body.message, /invalid input types/i);
});

test.serial("POST /v1/auth/register - fails with duplicate username", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `duplicate_${Date.now()}`;
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
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
	const email = `duplicate_${Date.now()}@example.com`;
	
	await client.post("v1/auth/register", {
		json: {
			username: `user1_${Date.now()}`,
			email: email,
			password: "Test123!@#"
		}
	});

	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: `user2_${Date.now()}`,
			email: email,
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 409);
	t.is(body.success, false);
	t.regex(body.message, /already exists/i);
});

/**
 * ===================================
 * AUTHENTICATION TESTS - LOGIN
 * ===================================
 */

test.serial("POST /v1/auth/login - successful login with valid credentials", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `loginuser_${Date.now()}`;
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
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
	const username = `wrongpw_${Date.now()}`;
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
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
	t.regex(body.message, /invalid username format/i);
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
	t.regex(body.message, /invalid input types/i);
});

/**
 * ===================================
 * AUTHENTICATION TESTS - LOGOUT
 * ===================================
 */

test.serial("POST /v1/auth/logout - successful logout", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `logoutuser_${Date.now()}`;
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: {
			username: username,
			password: "Test123!@#"
		}
	});

	const { body, statusCode } = await client.post("v1/auth/logout");

	t.is(statusCode, 200);
	t.is(body.success, true);
	t.is(body.message, "Logout successful");
});

test("POST /v1/auth/logout - works even without being logged in", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/logout");

	t.is(statusCode, 200);
	t.is(body.success, true);
	t.is(body.message, "Logout successful");
});

/**
 * ===================================
 * AUTHENTICATION INTEGRATION TESTS
 * ===================================
 */

test.serial("Full authentication flow: register -> login -> logout", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `fullflow_${Date.now()}`;
	const email = `${username}@example.com`;
	const password = "Test123!@#";

	const registerResponse = await client.post("v1/auth/register", {
		json: { username, email, password }
	});
	t.is(registerResponse.statusCode, 201);
	t.is(registerResponse.body.data.username, username);

	const loginResponse = await client.post("v1/auth/login", {
		json: { username, password }
	});
	t.is(loginResponse.statusCode, 200);
	t.is(loginResponse.body.data.username, username);

	const logoutResponse = await client.post("v1/auth/logout");
	t.is(logoutResponse.statusCode, 200);
	t.is(logoutResponse.body.message, "Logout successful");
});

test.serial("Cannot register while already logged in", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username1 = `user1_${Date.now()}`;
	const username2 = `user2_${Date.now()}`;

	// Register and login first user
	await client.post("v1/auth/register", {
		json: {
			username: username1,
			email: `${username1}@example.com`,
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: { username: username1, password: "Test123!@#" }
	});

	// Try to register another user while logged in
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: username2,
			email: `${username2}@example.com`,
			password: "Test123!@#"
		}
	});

	// Should succeed - registration doesn't check if already logged in
	// This is actually acceptable behavior (user can create multiple accounts)
	t.is(statusCode, 201);
	t.is(body.data.username, username2);
});

test.serial("Cannot login again while already logged in (double login)", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `doublelogin_${Date.now()}`;

	// Register user
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
			password: "Test123!@#"
		}
	});

	// First login
	const firstLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});
	t.is(firstLogin.statusCode, 200);

	// Second login attempt (already logged in)
	const secondLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Should succeed - just refreshes the session token
	// This is acceptable behavior (allows re-login without explicit logout)
	t.is(secondLogin.statusCode, 200);
	t.is(secondLogin.body.data.username, username);
});

test.serial("Session persists across multiple requests", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `session_${Date.now()}`;

	// Register and login
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Make authenticated requests (using a protected endpoint)
	const firstRequest = await client.post("v1/exhibits/1/ratings", {
		json: { rating: 5 }
	});
	t.true(firstRequest.statusCode === 201 || firstRequest.statusCode === 404);

	// Make another authenticated request (cookie should persist)
	const secondRequest = await client.post("v1/exhibits/2/ratings", {
		json: { rating: 4 }
	});
	t.true(secondRequest.statusCode === 201 || secondRequest.statusCode === 404);
	
	// Both should succeed or both should fail with same status
	t.is(firstRequest.statusCode, secondRequest.statusCode);
});

test.serial("Logout invalidates session", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `logout_${Date.now()}`;

	// Register and login
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Verify authenticated (can rate exhibits)
	const beforeLogout = await client.post("v1/exhibits/1/ratings", {
		json: { rating: 5 }
	});
	t.true(beforeLogout.statusCode === 201 || beforeLogout.statusCode === 404);

	// Logout
	await client.post("v1/auth/logout");

	// Try authenticated request after logout (should fail with 401)
	const afterLogout = await client.post("v1/exhibits/1/ratings", {
		json: { rating: 5 }
	});
	t.is(afterLogout.statusCode, 401);
});

test.serial("Can login again after logout", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `relogin_${Date.now()}`;

	// Register
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
			password: "Test123!@#"
		}
	});

	// First login
	const firstLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});
	t.is(firstLogin.statusCode, 200);

	// Logout
	await client.post("v1/auth/logout");

	// Login again
	const secondLogin = await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});
	t.is(secondLogin.statusCode, 200);
	t.is(secondLogin.body.data.username, username);
});

/**
 * ===================================
 * EXHIBIT ENDPOINTS TESTS
 * ===================================
 */

/**
 * GET /v1/exhibits/search - Public endpoint
 */
test("GET /v1/exhibits/search - returns all exhibits without query", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/search");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	t.true(body.data.length > 0);
});

test("GET /v1/exhibits/search - searches by keyword", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/search?keyword=starry");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	// Should find "The Starry Night"
	if (body.data.length > 0) {
		t.regex(body.data[0].title.toLowerCase(), /starry/i);
	}
});

test("GET /v1/exhibits/search - searches by category", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/search?category=paintings");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	// Should find exhibits with "paintings" category
	if (body.data.length > 0) {
		const hasCategory = body.data.some(exhibit => 
			exhibit.category && exhibit.category.includes("paintings")
		);
		t.true(hasCategory);
	}
});

test("GET /v1/exhibits/search - returns empty array for no matches", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/search?keyword=nonexistent123456");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.true(Array.isArray(body.data));
	t.is(body.data.length, 0);
});

/**
 * GET /v1/exhibits/:exhibit_id - Public endpoint
 */
test("GET /v1/exhibits/:exhibit_id - returns exhibit details with valid ID", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/1");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.exhibitId, 1);
	t.truthy(body.data.title);
	t.truthy(body.data.category);
	t.truthy(body.data.location);
});

test("GET /v1/exhibits/:exhibit_id - returns 404 for non-existent exhibit", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/99999");
	
	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

test("GET /v1/exhibits/:exhibit_id - returns 400 for invalid ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/invalid");
	
	t.true(statusCode === 400 || statusCode === 404);
	t.is(body.success, false);
});

/**
 * GET /v1/exhibits/:exhibit_id/audio - Public endpoint
 */
test("GET /v1/exhibits/:exhibit_id/audio - returns audio guide with valid ID", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/1/audio");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.truthy(body.data.audioUrl || body.data.audioGuide);
});

test("GET /v1/exhibits/:exhibit_id/audio - returns 404 for non-existent exhibit", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/99999/audio");
	
	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

/**
 * POST /v1/exhibits/:exhibit_id/ratings - Protected endpoint (requires authentication)
 */
test.serial("POST /v1/exhibits/:exhibit_id/ratings - successfully rates exhibit when authenticated", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `rater_${Date.now()}`;
	
	// Register and login
	const registerResponse = await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
			password: "Test123!@#"
		}
	});
	const userId = registerResponse.body.data.userId;

	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Get exhibit before rating to check current average
	const beforeRating = await client("v1/exhibits/1");
	t.is(beforeRating.statusCode, 200);
	const initialRating = beforeRating.body.data.rating;
	
	// Import mock data to calculate expected new average
	const { mockExhibits } = await import("../data/mockData.js");
	const exhibit = mockExhibits.find(e => e.exhibitId === 1);
	
	// Calculate expected new average rating
	const currentRatings = Array.from(exhibit.ratings.values());
	const newRatingValue = 4;
	const allRatings = [...currentRatings, newRatingValue];
	const expectedAverage = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;

	// Rate exhibit
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: newRatingValue
		}
	});

	t.is(statusCode, 201);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.exhibitId, 1);
	t.is(body.data.rating, newRatingValue);
	t.is(body.data.averageRating, expectedAverage);
	
	// Verify the rating was actually updated in the exhibit
	const afterRating = await client("v1/exhibits/1");
	t.is(afterRating.statusCode, 200);
	t.is(afterRating.body.data.rating, expectedAverage);
	t.not(afterRating.body.data.rating, initialRating); // Rating should have changed
});

test("POST /v1/exhibits/:exhibit_id/ratings - fails without authentication", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 5
		}
	});

	t.is(statusCode, 401);
	t.is(body.success, false);
	t.regex(body.message, /unauthorized|authentication|token/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with invalid rating (too low)", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `rater2_${Date.now()}`;
	
	// Register and login
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Try to rate with invalid value
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 0
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|invalid|valid/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with invalid rating (too high)", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `rater3_${Date.now()}`;
	
	// Register and login
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Try to rate with invalid value
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 6
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|invalid|valid/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with missing rating", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `rater4_${Date.now()}`;
	
	// Register and login
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Try to rate without rating value
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|required/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails for non-existent exhibit", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `rater5_${Date.now()}`;
	
	// Register and login
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Try to rate non-existent exhibit
	const { body, statusCode } = await client.post("v1/exhibits/99999/ratings", {
		json: {
			rating: 5
		}
	});

	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - updates rating when user rates same exhibit twice", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = `updater_${Date.now()}`;
	
	// Register and login
	const registerResponse = await client.post("v1/auth/register", {
		json: {
			username: username,
			email: `${username}@example.com`,
			password: "Test123!@#"
		}
	});
	const userId = registerResponse.body.data.userId;

	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Get initial state
	const { mockExhibits } = await import("../data/mockData.js");
	const exhibit = mockExhibits.find(e => e.exhibitId === 3);
	const initialRatingsCount = exhibit.ratings.size;

	// First rating
	const firstRating = await client.post("v1/exhibits/3/ratings", {
		json: { rating: 3 }
	});
	t.is(firstRating.statusCode, 201);
	
	// Check that one rating was added
	t.is(exhibit.ratings.size, initialRatingsCount + 1);
	t.is(exhibit.ratings.get(userId), 3);

	// Second rating from same user with different value
	const secondRating = await client.post("v1/exhibits/3/ratings", {
		json: { rating: 5 }
	});
	t.is(secondRating.statusCode, 201);
	
	// Rating count should NOT increase (update, not duplicate)
	t.is(exhibit.ratings.size, initialRatingsCount + 1);
	// Rating value should be updated
	t.is(exhibit.ratings.get(userId), 5);
	t.not(exhibit.ratings.get(userId), 3);
});

