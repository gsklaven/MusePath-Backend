import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin } from "./helpers.js";
import { MOCK_ADMIN_PASSWORD } from '../config/constants.js';

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
 * EXHIBIT DELETION TESTS (ADMIN)
 * ===================================
 */

// Test that an unauthenticated user cannot delete an exhibit.
test('DELETE /exhibits/:exhibit_id - should require authentication', async t => {
	// Create a new client without logging in
	const client = createClient(t.context.baseUrl);

	// Attempt to delete an exhibit
	const response = await client.delete('v1/exhibits/1');

	// Assert that the server returns a 401 Unauthorized status
	t.is(response.statusCode, 401);
	t.is(response.body.success, false);
	t.regex(response.body.message, /token|authentication/i);
});

// Test that a non-admin user cannot delete an exhibit.
test('DELETE /exhibits/:exhibit_id - should require admin role', async t => {
	// Create a new client without admin privileges
	const { client: userClient } = await registerAndLogin(
		t.context.baseUrl,
		'exhibitdelete',
		'exhibitdelete@example.com',
		'Password123!'
	);

	// Attempt to delete an exhibit with a non-admin user
	const response = await userClient.delete('v1/exhibits/1');

	// Assert that the server returns a 403 Forbidden status
	t.is(response.statusCode, 403);
	t.is(response.body.success, false);
	t.regex(response.body.message, /admin/i);
});

// Test that an admin user can successfully delete an exhibit.
test.serial('DELETE /exhibits/:exhibit_id - should delete exhibit with admin credentials', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as an admin user to get an authentication token
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	// First, create a new exhibit to be deleted
	const createResponse = await client.post('v1/exhibits', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: {
			title: 'Exhibit to Delete',
			description: 'This will be deleted',
			location: 'Gallery B'
		}
	});
	
	t.is(createResponse.statusCode, 201);
	const exhibitId = createResponse.body.data.exhibitId;
	
	// Now, delete the newly created exhibit
	const deleteResponse = await client.delete(`v1/exhibits/${exhibitId}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	
	// Assert that the server returns a 204 No Content status, indicating successful deletion
	t.is(deleteResponse.statusCode, 204);
	
	// Verify that the exhibit is no longer accessible
	const getResponse = await client.get(`v1/exhibits/${exhibitId}`);
	t.is(getResponse.statusCode, 404);
});

// Test that the server returns a 404 Not Found error when trying to delete a non-existent exhibit.
test('DELETE /exhibits/:exhibit_id - should return 404 for non-existent exhibit', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as an admin user
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	// Attempt to delete an exhibit with an ID that does not exist
	const response = await client.delete('v1/exhibits/99999', {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	
	// Assert that the server returns a 404 Not Found status
	t.is(response.statusCode, 404);
	t.is(response.body.success, false);
});

// Test that the server validates the exhibit ID format.
test('DELETE /exhibits/:exhibit_id - should validate exhibit ID format', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as an admin user
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	// Attempt to delete an exhibit with an invalid ID format
	const response = await client.delete('v1/exhibits/invalid', {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	
	// Assert that the server returns a 400 Bad Request status
	t.is(response.statusCode, 400);
	t.is(response.body.success, false);
	t.regex(response.body.message, /invalid.*id/i);
});