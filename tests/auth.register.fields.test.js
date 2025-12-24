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