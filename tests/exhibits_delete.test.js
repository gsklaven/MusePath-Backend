import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin, generateUsername, generateEmail } from "./helpers.js";
import { MOCK_ADMIN_PASSWORD } from '../config/constants.js';

/**
 * Exhibit Deletion Tests
 * Tests for DELETE /v1/exhibits/:exhibit_id endpoints and Admin Workflows
 * 
 * Test Coverage:
 * - Admin authentication requirements
 * - Exhibit deletion functionality
 * - Error handling for invalid IDs
 * - Full lifecycle workflow (Create -> View -> Search -> Delete)
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * EXHIBIT DELETION TESTS (ADMIN)
 * ===================================
 */

test('DELETE /exhibits/:exhibit_id - should require authentication', async t => {
	const client = createClient(t.context.baseUrl);

	const response = await client.delete('v1/exhibits/1');

	t.is(response.statusCode, 401);
	t.is(response.body.success, false);
	t.regex(response.body.message, /token|authentication/i);
});

test('DELETE /exhibits/:exhibit_id - should require admin role', async t => {
	const client = createClient(t.context.baseUrl);
	
	const _username_exhibitdelete = generateUsername('exhibitdelete');
	const _email_exhibitdelete = generateEmail(_username_exhibitdelete);
	const { client: userClient } = await registerAndLogin(
		t.context.baseUrl,
		_username_exhibitdelete,
		_email_exhibitdelete,
		'Password123!'
	);

	const response = await userClient.delete('v1/exhibits/1');

	t.is(response.statusCode, 403);
	t.is(response.body.success, false);
	t.regex(response.body.message, /admin/i);
});

test.serial('DELETE /exhibits/:exhibit_id - should delete exhibit with admin credentials', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	// First, create an exhibit to delete
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
	
	// Now delete it
	const deleteResponse = await client.delete(`v1/exhibits/${exhibitId}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	
	t.is(deleteResponse.statusCode, 204);
	
	// Verify it's deleted
	const getResponse = await client.get(`v1/exhibits/${exhibitId}`);
	t.is(getResponse.statusCode, 404);
});

test('DELETE /exhibits/:exhibit_id - should return 404 for non-existent exhibit', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	const response = await client.delete('v1/exhibits/99999', {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	
	t.is(response.statusCode, 404);
	t.is(response.body.success, false);
});

test('DELETE /exhibits/:exhibit_id - should validate exhibit ID format', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	const response = await client.delete('v1/exhibits/invalid', {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	
	t.is(response.statusCode, 400);
	t.is(response.body.success, false);
	t.regex(response.body.message, /invalid.*id/i);
});

/**
 * ===================================
 * INTEGRATION WORKFLOW TESTS
 * ===================================
 */

test.serial('Admin workflow - create, view, and delete exhibit', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	// Step 1: Create exhibit
	const createResponse = await client.post('v1/exhibits', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: {
			title: 'Workflow Test Exhibit',
			description: 'Testing the full workflow',
			location: 'Main Hall',
			category: 'contemporary',
			features: ['accessible'],
			keywords: ['workflow', 'test']
		}
	});
	
	t.is(createResponse.statusCode, 201);
	const exhibitId = createResponse.body.data.exhibitId;
	
	// Step 2: View the exhibit
	const viewResponse = await client.get(`v1/exhibits/${exhibitId}`);
	t.is(viewResponse.statusCode, 200);
	t.is(viewResponse.body.data.title, 'Workflow Test Exhibit');
	t.is(viewResponse.body.data.location, 'Main Hall');
	
	// Step 3: Search for the exhibit
	const searchResponse = await client.get('v1/exhibits/search?keyword=workflow');
	t.is(searchResponse.statusCode, 200);
	const found = searchResponse.body.data.find(e => e.exhibitId === exhibitId);
	t.truthy(found);
	
	// Step 4: Delete the exhibit
	const deleteResponse = await client.delete(`v1/exhibits/${exhibitId}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	t.is(deleteResponse.statusCode, 204);
	
	// Step 5: Verify deletion
	const verifyResponse = await client.get(`v1/exhibits/${exhibitId}`);
	t.is(verifyResponse.statusCode, 404);
});