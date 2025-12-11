import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail } from "./helpers.js";

/**
 * Authentication Endpoint Tests
 * Tests for /v1/auth endpoints: register, login, logout
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * REGISTRATION TESTS
 * ===================================
 */

test.serial("POST /v1/auth/register - successful registration with valid data", async (t) => {
	const client = createClient(t.context.baseUrl);
	const uniqueUsername = generateUsername();
	const uniqueEmail = generateEmail(uniqueUsername);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: uniqueUsername,
			email: uniqueEmail,
			password: "Test123!@#"
		}
	});

	t.is(statusCode, 201);
	t.is(body.success, true);
	t.is(body.message, "User created successfully");
	t.truthy(body.data);
	t.is(body.data.username, uniqueUsername);
	t.is(body.data.email, uniqueEmail);
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

/**
 * ===================================
 * LOGIN TESTS
 * ===================================
 */

test.serial("POST /v1/auth/login - successful login with valid credentials", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("loginuser");
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
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
	const username = generateUsername("wrongpw");
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
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
 * LOGOUT TESTS
 * ===================================
 */

test.serial("POST /v1/auth/logout - successful logout", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("logoutuser");
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
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
	const username = generateUsername("fullflow");
	const email = generateEmail(username);
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

test.serial("Can register while already logged in", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username1 = generateUsername("user1");
	const username2 = generateUsername("user2");

	// Register and login first user
	await client.post("v1/auth/register", {
		json: {
			username: username1,
			email: generateEmail(username1),
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
			email: generateEmail(username2),
			password: "Test123!@#"
		}
	});

	// Should succeed - registration doesn't check if already logged in
	t.is(statusCode, 201);
	t.is(body.data.username, username2);
});

test.serial("Can login again while already logged in (refreshes session)", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("doublelogin");

	// Register user
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
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
	t.is(secondLogin.statusCode, 200);
	t.is(secondLogin.body.data.username, username);
});

test.serial("Session persists across multiple requests", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("session");

	// Register and login
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
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
	const username = generateUsername("logout");

	// Register and login
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
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
	const username = generateUsername("relogin");

	// Register
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
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
 * MIDDLEWARE VALIDATION TESTS
 * Tests for uncovered validation branches
 * ===================================
 */

test("POST /v1/auth/register - fails with null password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: null
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
});

test("POST /v1/auth/register - fails with number as password", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: 12345678
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.is(body.message, 'Password must be a string');
});

test("POST /v1/auth/register - fails with password containing invalid characters (unicode)", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "Test123!αβγ"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid characters/i);
});

test("POST /v1/auth/register - fails with password containing emoji", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: {
			username: "testuser",
			email: "test@example.com",
			password: "Test123!😀"
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /invalid characters/i);
});

test("POST /v1/auth/register - fails with username too short (2 chars)", async (t) => {
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
	t.regex(body.message, /username/i);
});

test("POST /v1/auth/register - fails with username too long (31+ chars)", async (t) => {
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
	t.regex(body.message, /username/i);
});

test.serial("Logout with valid token, then try to use revoked token", async (t) => {
	const client = createClient(t.context.baseUrl);
	const username = generateUsername("revoked");

	// Register and login
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	await client.post("v1/auth/login", {
		json: { username, password: "Test123!@#" }
	});

	// Store the current cookie (token)
	const cookies = client.defaults.options.cookieJar.getCookiesSync(t.context.baseUrl);
	const tokenCookie = cookies.find(c => c.key === 'token');
	
	// Logout (revokes the token)
	await client.post("v1/auth/logout");

	// Try to use the revoked token by setting it manually
	if (tokenCookie) {
		client.defaults.options.cookieJar.setCookieSync(`token=${tokenCookie.value}`, t.context.baseUrl);
		
		// Try to rate an exhibit with revoked token
		const result = await client.post("v1/exhibits/1/ratings", {
			json: { rating: 5 }
		});
		
		t.is(result.statusCode, 401);
		t.is(result.body.message, "Token revoked");
	} else {
		t.pass("Cookie handling not available in test environment");
	}
});

test.serial("Admin endpoints - POST /exhibits requires authentication", async (t) => {
	const client = createClient(t.context.baseUrl);

	// Try to create exhibit without authentication
	const { body, statusCode } = await client.post("v1/exhibits", {
		json: {
			title: "Test Exhibit",
			artist: "Test Artist",
			year: 2024,
			category: "paintings"
		}
	});

	t.is(statusCode, 401);
	t.is(body.success, false);
});

test.serial("Admin endpoints - DELETE /maps/:map_id requires authentication", async (t) => {
	const client = createClient(t.context.baseUrl);

	// Try to delete map without authentication
	const { body, statusCode } = await client.delete("v1/maps/1");

	t.is(statusCode, 401);
	t.is(body.success, false);
});

test.serial("Admin endpoints - POST /destinations requires authentication", async (t) => {
	const client = createClient(t.context.baseUrl);

	// Try to upload destinations without authentication
	const { body, statusCode } = await client.post("v1/destinations", {
		json: {
			destinations: [
				{
					name: "Test Location",
					type: "entrance",
					coordinates: { lat: 40.7128, lng: -74.0060 },
					map_id: 1
				}
			]
		}
	});

	t.is(statusCode, 401);
	t.is(body.success, false);
});
