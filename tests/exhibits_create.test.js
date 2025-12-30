import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin, generateUsername, generateEmail } from "./helpers.js";
import { MOCK_ADMIN_PASSWORD } from '../config/constants.js';

/**
 * Exhibit Creation Tests
 * Tests for POST /v1/exhibits endpoints
 * 
 * Test Coverage:
 * - Admin authentication requirements
 * - Exhibit creation workflow
 * - Input validation (required fields, data types)
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * Helper function to authenticate as an admin user.
 * Reduces code duplication in tests requiring admin privileges.
 * 
 * @param {Object} client - The HTTP client instance
 * @returns {Promise<string>} The authentication token
 */
const loginAsAdmin = async (client) => {
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	return loginResponse.body.data.token;
};

/**
 * ===================================
 * EXHIBIT CREATION TESTS (ADMIN)
 * ===================================
 */

test('POST /exhibits - should require authentication', async t => {
	const client = createClient(t.context.baseUrl);

	const response = await client.post('v1/exhibits', {
		json: {
			title: 'Test Exhibit',
			description: 'Test description',
			location: 'Room 1'
		}
	});

	t.is(response.statusCode, 401);
	t.is(response.body.success, false);
	t.regex(response.body.message, /token|authentication/i);
});

test('POST /exhibits - should require admin role', async t => {
	const client = createClient(t.context.baseUrl);
	
	const _username_exhibitcreate = generateUsername('exhibitcreate');
	const _email_exhibitcreate = generateEmail(_username_exhibitcreate);
	const { client: userClient } = await registerAndLogin(
		t.context.baseUrl,
		_username_exhibitcreate,
		_email_exhibitcreate,
		'Password123!'
	);

	const response = await userClient.post('v1/exhibits', {
		json: {
			title: 'Test Exhibit',
			description: 'Test description',
			location: 'Room 1'
		}
	});

	t.is(response.statusCode, 403);
	t.is(response.body.success, false);
	t.regex(response.body.message, /admin/i);
});

test.serial('POST /exhibits - should create exhibit with admin credentials', async t => {
	const client = createClient(t.context.baseUrl);
	
	const token = await loginAsAdmin(client);
	
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
	
	t.is(response.statusCode, 201);
	t.is(response.body.success, true);
	t.truthy(response.body.data.exhibitId);
	
	// Verify the exhibit was created
	const exhibitId = response.body.data.exhibitId;
	const getResponse = await client.get(`v1/exhibits/${exhibitId}`);
	
	t.is(getResponse.statusCode, 200);
	t.is(getResponse.body.data.title, 'New Test Exhibit');
	t.is(getResponse.body.data.description, 'A test exhibit created by admin');
});

/**
 * Validation Tests
 * Ensure that the API correctly rejects invalid input
 */

test('POST /exhibits - should reject missing title', async t => {
	const client = createClient(t.context.baseUrl);
	const token = await loginAsAdmin(client);
	
	const response = await client.post('v1/exhibits', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: {
			description: 'Description',
			location: 'Room 1'
		}
	});
	
	t.is(response.statusCode, 400);
	t.is(response.body.success, false);
});

test('POST /exhibits - should reject missing description', async t => {
	const client = createClient(t.context.baseUrl);
	const token = await loginAsAdmin(client);
	
	const response = await client.post('v1/exhibits', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: {
			title: 'Title',
			location: 'Room 1'
		}
	});
	
	t.is(response.statusCode, 400);
	t.is(response.body.success, false);
});

test('POST /exhibits - should reject missing location', async t => {
	const client = createClient(t.context.baseUrl);
	const token = await loginAsAdmin(client);
	
	const response = await client.post('v1/exhibits', {
		headers: {
			Authorization: `Bearer ${token}`
		},
		json: {
			title: 'Title',
			description: 'Description'
		}
	});
	
	t.is(response.statusCode, 400);
	t.is(response.body.success, false);
});

test('POST /exhibits - should reject numeric category', async t => {
	const client = createClient(t.context.baseUrl);
	const token = await loginAsAdmin(client);
	
	const response = await client.post('v1/exhibits', {
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
	
	t.is(response.statusCode, 400);
	t.is(response.body.success, false);
	t.regex(response.body.message, /category.*string.*array/i);
});

test('POST /exhibits - should reject object category', async t => {
	const client = createClient(t.context.baseUrl);
	const token = await loginAsAdmin(client);
	
	const response = await client.post('v1/exhibits', {
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
	
	t.is(response.statusCode, 400);
	t.is(response.body.success, false);
	t.regex(response.body.message, /category.*string.*array/i);
});