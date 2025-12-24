import test from "ava";
import { setupTestServer, cleanupTestServer, testRegisterSuccess, testAuthFail } from "./helpers.js";

// Setup the test server before running the tests
test.before(async (t) => {
	await setupTestServer(t);
});

// Cleanup the test server after all tests have run
test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * REGISTRATION FIELDS VALIDATION TESTS
 * ===================================
 */

// Test that a user can successfully register with valid data.
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