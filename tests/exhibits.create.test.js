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
 * EXHIBIT CREATION TESTS (ADMIN)
 * ===================================
 */

// Test that an unauthenticated user cannot create an exhibit.
test('POST /exhibits - should require authentication', async t => {
	// Create a new client without logging in
	const client = createClient(t.context.baseUrl);

	// Attempt to create an exhibit
	const response = await client.post('v1/exhibits', {
		json: {
			title: 'Test Exhibit',
			description: 'Test description',
			location: 'Room 1'
		}
	});

	// Assert that the server returns a 401 Unauthorized status
	t.is(response.statusCode, 401);
	t.is(response.body.success, false);
	t.regex(response.body.message, /token|authentication/i);
});

// Test that a non-admin user cannot create an exhibit.
test('POST /exhibits - should require admin role', async t => {
	// Create a new client without admin privileges
	const { client: userClient } = await registerAndLogin(
		t.context.baseUrl,
		'exhibitcreate',
		'exhibitcreate@example.com',
		'Password123!'
	);

	// Attempt to create an exhibit with a non-admin user
	const response = await userClient.post('v1/exhibits', {
		json: {
			title: 'Test Exhibit',
			description: 'Test description',
			location: 'Room 1'
		}
	});

	// Assert that the server returns a 403 Forbidden status
	t.is(response.statusCode, 403);
	t.is(response.body.success, false);
	t.regex(response.body.message, /admin/i);
});

// Test that an admin user can successfully create an exhibit.
test.serial('POST /exhibits - should create exhibit with admin credentials', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as an admin user to get an authentication token
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	// Create a new exhibit with valid data
	const response = await client.post('v1/exhibits', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: {
			title: 'New Test Exhibit',
			description: 'A test exhibit created by admin',
			location: 'Gallery A',
			category: ['modern art', 'sculpture'],
			features: ['interactive', 'audio guide'],
			keywords: ['modern', 'test'],
			audioGuideUrl: 'https://example.com/audio/test.mp3'
		}
	});
	
	// Assert that the server returns a 201 Created status
	t.is(response.statusCode, 201);
	t.is(response.body.success, true);
	t.truthy(response.body.data.exhibitId);
	
	// Verify that the exhibit was actually created by fetching it
	const exhibitId = response.body.data.exhibitId;
	const getResponse = await client.get(`v1/exhibits/${exhibitId}`);
	
	// Assert that the fetched exhibit has the correct data
	t.is(getResponse.statusCode, 200);
	t.is(getResponse.body.data.title, 'New Test Exhibit');
	t.is(getResponse.body.data.description, 'A test exhibit created by admin');
});

// Test that the server validates the required fields when creating an exhibit.
test('POST /exhibits - should validate required fields', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as an admin user
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	// Attempt to create an exhibit with a missing title
	const response1 = await client.post('v1/exhibits', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: {
			description: 'Description',
			location: 'Room 1'
		}
	});
	t.is(response1.statusCode, 400);
	t.is(response1.body.success, false);
	
	// Attempt to create an exhibit with a missing description
	const response2 = await client.post('v1/exhibits', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: {
			title: 'Title',
			location: 'Room 1'
		}
	});
	t.is(response2.statusCode, 400);
	t.is(response2.body.success, false);
	
	// Attempt to create an exhibit with a missing location
	const response3 = await client.post('v1/exhibits', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: {
			title: 'Title',
			description: 'Description'
		}
	});
	t.is(response3.statusCode, 400);
	t.is(response3.body.success, false);
});

// Test that the server validates the category type.
test('POST /exhibits - should validate category type (must be string or array)', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as an admin user
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	// Attempt to create an exhibit with an invalid category type (number)
	const response1 = await client.post('v1/exhibits', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: {
			title: 'Test Exhibit',
			description: 'Test Description',
			location: 'Room 1',
			category: 12345
		}
	});
	t.is(response1.statusCode, 400);
	t.is(response1.body.success, false);
	t.regex(response1.body.message, /category.*string.*array/i);
	
	// Attempt to create an exhibit with an invalid category type (object)
	const response2 = await client.post('v1/exhibits', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: {
			title: 'Test Exhibit',
			description: 'Test Description',
			location: 'Room 1',
			category: { type: 'paintings' }
		}
	});
	t.is(response2.statusCode, 400);
	t.is(response2.body.success, false);
	t.regex(response2.body.message, /category.*string.*array/i);
});