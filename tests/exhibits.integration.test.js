import test from "ava";
import { setupTestServer, cleanupTestServer, createClient } from "./helpers.js";
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
 * INTEGRATION WORKFLOW TESTS
 * ===================================
 */

// Test the full admin workflow for an exhibit: create, view, search, and delete.
test.serial('Admin workflow - create, view, and delete exhibit', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as an admin user to get an authentication token
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	// Step 1: Create a new exhibit with valid data
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
	
	// Assert that the server returns a 201 Created status
	t.is(createResponse.statusCode, 201);
	const exhibitId = createResponse.body.data.exhibitId;
	
	// Step 2: View the newly created exhibit to verify its data
	const viewResponse = await client.get(`v1/exhibits/${exhibitId}`);
	t.is(viewResponse.statusCode, 200);
	t.is(viewResponse.body.data.title, 'Workflow Test Exhibit');
	t.is(viewResponse.body.data.location, 'Main Hall');
	
	// Step 3: Search for the exhibit by a keyword
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
	// Assert that the server returns a 204 No Content status, indicating successful deletion
	t.is(deleteResponse.statusCode, 204);
	
	// Step 5: Verify that the exhibit is no longer accessible
	const verifyResponse = await client.get(`v1/exhibits/${exhibitId}`);
	t.is(verifyResponse.statusCode, 404);
});