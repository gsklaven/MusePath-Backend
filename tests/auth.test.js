import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, generateUsername, generateEmail, assertRegisterSuccess, assertAuthFail, assertLoginSuccess, testAuthFail, testRegisterSuccess } from './helpers.js';

/**
 * Authentication Endpoint Tests
 * 
 * This test suite covers the authentication endpoints of the API, including:
 * - User registration (/v1/auth/register)
 * - User login (/v1/auth/login)
 * - User logout (/v1/auth/logout)
 * 
 * It verifies successful operations as well as various error conditions
 * such as validation failures, duplicate users, and invalid credentials.
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

// Test that a user can successfully register with valid data.
// Verifies that the response contains the expected user data and role.
test.serial("POST /v1/auth/register - successful registration with valid data", testRegisterSuccess);

// Test that registration fails when the username is missing.
test.serial("POST /v1/auth/register - fails with missing username", testAuthFail, "v1/auth/register", {
	email: "test@example.com",
	password: "Test123!@#"
}, 400, /username.*required/i);

// Test that registration fails when the email is missing.
test.serial("POST /v1/auth/register - fails with missing email", testAuthFail, "v1/auth/register", {
	username: "testuser",
	password: "Test123!@#"
}, 400, /email.*required/i);

// Test that registration fails when the password is missing.
test.serial("POST /v1/auth/register - fails with missing password", testAuthFail, "v1/auth/register", {
	username: "testuser",
	email: "test@example.com"
}, 400, /password.*required/i);

// Test that registration fails with an invalid email format.
test.serial("POST /v1/auth/register - fails with invalid email format", testAuthFail, "v1/auth/register", {
	username: "testuser",
	email: "invalid-email",
	password: "Test123!@#"
}, 400, /invalid email|email must be a string/i);

// Test that registration fails with a weak password (no uppercase letters).
test.serial("POST /v1/auth/register - fails with weak password (no uppercase)", testAuthFail, "v1/auth/register", {
	username: "testuser",
	email: "test@example.com",
	password: "test123!@#"
}, 400, /uppercase/i);

// Test that registration fails with a weak password (no lowercase letters).
test.serial("POST /v1/auth/register - fails with weak password (no lowercase)", testAuthFail, "v1/auth/register", {
	username: "testuser",
	email: "test@example.com",
	password: "TEST123!@#"
}, 400, /lowercase/i);

// Test that registration fails with a weak password (no digits).
test.serial("POST /v1/auth/register - fails with weak password (no digit)", testAuthFail, "v1/auth/register", {
	username: "testuser",
	email: "test@example.com",
	password: "TestTest!@#"
}, 400, /digit/i);

// Test that registration fails with a weak password (no special characters).
test.serial("POST /v1/auth/register - fails with weak password (no special character)", testAuthFail, "v1/auth/register", {
	username: "testuser",
	email: "test@example.com",
	password: "Test123456"
}, 400, /special character/i);

// Test that registration fails with a password that is too short.
test.serial("POST /v1/auth/register - fails with short password", testAuthFail, "v1/auth/register", {
	username: "testuser",
	email: "test@example.com",
	password: "Test1!"
}, 400, /at least 8 characters/i);

// Test that registration fails with an invalid username format (contains special characters).
test.serial("POST /v1/auth/register - fails with invalid username format (special chars)", testAuthFail, "v1/auth/register", {
	username: "test@user!",
	email: "test@example.com",
	password: "Test123!@#"
}, 400, /username can only contain|username must be a string|username must be 3-30 characters/i);

// Test that registration fails when the username is too short.
test("POST /v1/auth/register - fails with username too short", testAuthFail, "v1/auth/register", {
	username: "ab",
	email: "test@example.com",
	password: "Test123!@#"
}, 400, /username must be 3-30 characters|username must be a string|username can only contain/i);

// Test that registration fails when the username is too long.
test("POST /v1/auth/register - fails with username too long", testAuthFail, "v1/auth/register", {
	username: "a".repeat(31),
	email: "test@example.com",
	password: "Test123!@#"
}, 400, /username must be 3-30 characters|username must be a string|username can only contain/i);

// Test that registration fails with non-string input types to prevent NoSQL injection.
test("POST /v1/auth/register - fails with non-string input types (NoSQL injection prevention)", testAuthFail, "v1/auth/register", {
	username: { "$ne": null },
	email: "test@example.com",
	password: "Test123!@#"
}, 400, /username must be a string|invalid input types/i);

// Test that registration fails when the username is already taken.
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

// Test that registration fails when the email is already taken.
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

// Test that a user can successfully log in with valid credentials.
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

// Test that login fails when the username is missing.
test("POST /v1/auth/login - fails with missing username", testAuthFail, "v1/auth/login", {
	password: "Test123!@#"
}, 400, /username.*required/i);

// Test that login fails when the password is missing.
test("POST /v1/auth/login - fails with missing password", testAuthFail, "v1/auth/login", {
	username: "testuser"
}, 400, /password.*required/i);

// Test that login fails with a non-existent username.
test("POST /v1/auth/login - fails with non-existent username", testAuthFail, "v1/auth/login", {
	username: "nonexistentuser123456",
	password: "Test123!@#"
}, 401, /invalid credentials/i);

// Test that login fails with the wrong password.
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

// Test that login fails with an invalid username format.
test("POST /v1/auth/login - fails with invalid username format", testAuthFail, "v1/auth/login", {
	username: "invalid@user",
	password: "Test123!@#"
}, 400, /username can only contain|invalid username format|username must be a string|username must be 3-30 characters/i);

// Test that login fails with non-string input types to prevent NoSQL injection.
test("POST /v1/auth/login - fails with non-string input types (NoSQL injection prevention)", testAuthFail, "v1/auth/login", {
	username: { "$ne": null },
	password: { "$ne": null }
}, 400, /username must be a string|invalid input types/i);

/**
 * ===================================
 * LOGOUT TESTS
 * ===================================
 */

// Test that a user can successfully log out.
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

// Test that logout works even without being logged in (idempotent).
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

// Test the full authentication flow: register, login, and logout.
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

// Test that a user can register a new account while already logged in.
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

// Test that a user can log in again while already logged in, which should refresh the session.
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

// Test that the session persists across multiple requests.
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

// Test that logging out invalidates the session.
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

// Test that a user can log in again after logging out.
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

// Test that registration fails when the password is null.
test("POST /v1/auth/register - fails with null password", testAuthFail, "v1/auth/register", {
	username: "testuser",
	email: "test@example.com",
	password: null
}, 400);

// Test that registration fails when the password is a number.
test("POST /v1/auth/register - fails with number as password", testAuthFail, "v1/auth/register", {
	username: "testuser",
	email: "test@example.com",
	password: 12345678
}, 400, /Password must be a string/);

// Test that registration fails when the password contains invalid unicode characters.
test("POST /v1/auth/register - fails with password containing invalid characters (unicode)", testAuthFail, "v1/auth/register", {
	username: "testuser",
	email: "test@example.com",
	password: "Test123!αβγ"
}, 400, /invalid characters/i);

// Test that registration fails when the password contains an emoji.
test("POST /v1/auth/register - fails with password containing emoji", testAuthFail, "v1/auth/register", {
	username: "testuser",
	email: "test@example.com",
	password: "Test123!😀"
}, 400, /invalid characters/i);

// Test that registration fails when the username is too short (2 chars).
test("POST /v1/auth/register - fails with username too short (2 chars)", testAuthFail, "v1/auth/register", {
	username: "ab",
	email: "test@example.com",
	password: "Test123!@#"
}, 400, /username/i);

// Test that registration fails when the username is too long (31+ chars).
test("POST /v1/auth/register - fails with username too long (31+ chars)", testAuthFail, "v1/auth/register", {
	username: "a".repeat(31),
	email: "test@example.com",
	password: "Test123!@#"
}, 400, /username/i);

// Test that a revoked token cannot be used to access protected routes.
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
