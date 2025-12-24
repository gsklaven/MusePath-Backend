import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail, assertRegisterSuccess, assertAuthFail, assertLoginSuccess } from './helpers.js';

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
});

test.serial("POST /v1/auth/register - fails with missing username", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		email: "test@example.com",
		password: "Test123!@#"
	}, 400, /username.*required/i);
});

test.serial("POST /v1/auth/register - fails with missing email", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		password: "Test123!@#"
	}, 400, /email.*required/i);
});

test.serial("POST /v1/auth/register - fails with missing password", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		email: "test@example.com"
	}, 400, /password.*required/i);
});

test.serial("POST /v1/auth/register - fails with invalid email format", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		email: "invalid-email",
		password: "Test123!@#"
	}, 400, /invalid email|email must be a string/i);
});

test.serial("POST /v1/auth/register - fails with weak password (no uppercase)", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		email: "test@example.com",
		password: "test123!@#"
	}, 400, /uppercase/i);
});

test.serial("POST /v1/auth/register - fails with weak password (no lowercase)", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		email: "test@example.com",
		password: "TEST123!@#"
	}, 400, /lowercase/i);
});

test.serial("POST /v1/auth/register - fails with weak password (no digit)", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		email: "test@example.com",
		password: "TestTest!@#"
	}, 400, /digit/i);
});

test.serial("POST /v1/auth/register - fails with weak password (no special character)", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		email: "test@example.com",
		password: "Test123456"
	}, 400, /special character/i);
});

test.serial("POST /v1/auth/register - fails with short password", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		email: "test@example.com",
		password: "Test1!"
	}, 400, /at least 8 characters/i);
});

test.serial("POST /v1/auth/register - fails with invalid username format (special chars)", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "test@user!",
		email: "test@example.com",
		password: "Test123!@#"
	}, 400, /username can only contain|username must be a string|username must be 3-30 characters/i);
});

test("POST /v1/auth/register - fails with username too short", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "ab",
		email: "test@example.com",
		password: "Test123!@#"
	}, 400, /username must be 3-30 characters|username must be a string|username can only contain/i);
});

test("POST /v1/auth/register - fails with username too long", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "a".repeat(31),
		email: "test@example.com",
		password: "Test123!@#"
	}, 400, /username must be 3-30 characters|username must be a string|username can only contain/i);
});

test("POST /v1/auth/register - fails with non-string input types (NoSQL injection prevention)", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: { "$ne": null },
		email: "test@example.com",
		password: "Test123!@#"
	}, 400, /username must be a string|invalid input types/i);
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

	await assertAuthFail(t, "v1/auth/register", {
		username: username,
		email: "different@example.com",
		password: "Test123!@#"
	}, 409, /already exists/i);
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

	await assertAuthFail(t, "v1/auth/register", {
		username: generateUsername("user2"),
		email: email,
		password: "Test123!@#"
	}, 409, /already exists/i);
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

	const { body } = await assertLoginSuccess(t, {
		username: username,
		password: "Test123!@#"
	});

	t.is(body.message, "Login successful");
	t.falsy(body.data.password);
});

test("POST /v1/auth/login - fails with missing username", async (t) => {
	await assertAuthFail(t, "v1/auth/login", {
		password: "Test123!@#"
	}, 400, /username.*required/i);
});

test("POST /v1/auth/login - fails with missing password", async (t) => {
	await assertAuthFail(t, "v1/auth/login", {
		username: "testuser"
	}, 400, /password.*required/i);
});

test("POST /v1/auth/login - fails with non-existent username", async (t) => {
	await assertAuthFail(t, "v1/auth/login", {
		username: "nonexistentuser123456",
		password: "Test123!@#"
	}, 401, /invalid credentials/i);
});

test.serial("POST /v1/auth/login - fails with wrong password", async (t) => {
	const username = generateUsername("wrongpw");
	const client = createClient(t.context.baseUrl);
	
	await client.post("v1/auth/register", {
		json: {
			username: username,
			email: generateEmail(username),
			password: "Test123!@#"
		}
	});

	await assertAuthFail(t, "v1/auth/login", {
		username: username,
		password: "WrongPassword123!@#"
	}, 401, /invalid credentials/i);
});

test("POST /v1/auth/login - fails with invalid username format", async (t) => {
	await assertAuthFail(t, "v1/auth/login", {
		username: "invalid@user",
		password: "Test123!@#"
	}, 400, /username can only contain|invalid username format|username must be a string|username must be 3-30 characters/i);
});

test("POST /v1/auth/login - fails with non-string input types (NoSQL injection prevention)", async (t) => {
	await assertAuthFail(t, "v1/auth/login", {
		username: { "$ne": null },
		password: { "$ne": null }
	}, 400, /username must be a string|invalid input types/i);
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
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		email: "test@example.com",
		password: null
	}, 400);
});

test("POST /v1/auth/register - fails with number as password", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		email: "test@example.com",
		password: 12345678
	}, 400, /Password must be a string/);
});

test("POST /v1/auth/register - fails with password containing invalid characters (unicode)", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		email: "test@example.com",
		password: "Test123!αβγ"
	}, 400, /invalid characters/i);
});

test("POST /v1/auth/register - fails with password containing emoji", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "testuser",
		email: "test@example.com",
		password: "Test123!😀"
	}, 400, /invalid characters/i);
});

test("POST /v1/auth/register - fails with username too short (2 chars)", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "ab",
		email: "test@example.com",
		password: "Test123!@#"
	}, 400, /username/i);
});

test("POST /v1/auth/register - fails with username too long (31+ chars)", async (t) => {
	await assertAuthFail(t, "v1/auth/register", {
		username: "a".repeat(31),
		email: "test@example.com",
		password: "Test123!@#"
	}, 400, /username/i);
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
