import test from "ava";
import { setupTestServer, cleanupTestServer, createClient, registerAndLogin, generateUsername, generateEmail, assertSearchExhibits, assertViewExhibit } from "./helpers.js";
import { MOCK_ADMIN_PASSWORD } from '../config/constants.js';

/**
 * Exhibit Endpoint Tests
 * Tests for /v1/exhibits endpoints: search, view, audio, ratings
 */

test.before(async (t) => {
	await setupTestServer(t);
});

test.after.always((t) => {
	cleanupTestServer(t);
});

/**
 * ===================================
 * EXHIBIT SEARCH TESTS
 * ===================================
 */

test("GET /v1/exhibits/search - returns all exhibits without query", async (t) => {
	await assertSearchExhibits(t, null, (t, data) => {
		t.true(data.length > 0);
	});
});

test("GET /v1/exhibits/search - searches by keyword", async (t) => {
	await assertSearchExhibits(t, "keyword=starry", (t, data) => {
		if (data.length > 0) {
			t.regex(data[0].title.toLowerCase(), /starry/i);
		}
	});
});

test("GET /v1/exhibits/search - searches by category", async (t) => {
	await assertSearchExhibits(t, "category=paintings", (t, data) => {
		const hasCategory = data.some(exhibit => 
			exhibit.category && exhibit.category.includes("paintings")
		);
		t.true(hasCategory);
	});
});

test("GET /v1/exhibits/search - returns empty array for no matches", async (t) => {
	await assertSearchExhibits(t, "keyword=nonexistent123456", (t, data) => {
		t.is(data.length, 0);
	});
});

/**
 * ===================================
 * EXHIBIT VIEW TESTS
 * ===================================
 */

test("GET /v1/exhibits/:exhibit_id - returns exhibit details with valid ID", async (t) => {
	const body = await assertViewExhibit(t, 1);
	t.truthy(body.data.title);
	t.truthy(body.data.category);
	t.truthy(body.data.location);
});

test("GET /v1/exhibits/:exhibit_id - returns 404 for non-existent exhibit", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/99999");
	
	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

test("GET /v1/exhibits/:exhibit_id - returns 400 for invalid ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/invalid");
	
	t.true(statusCode === 400 || statusCode === 404);
	t.is(body.success, false);
});

/**
 * ===================================
 * EXHIBIT AUDIO GUIDE TESTS
 * ===================================
 */

test("GET /v1/exhibits/:exhibit_id/audio - returns audio guide with valid ID", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/1/audio");
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.truthy(body.data.audioUrl || body.data.audioGuide);
});

test("GET /v1/exhibits/:exhibit_id/audio - returns 404 for non-existent exhibit", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/99999/audio");
	
	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

test("GET /v1/exhibits/:exhibit_id/audio - returns 400 for invalid exhibit ID format", async (t) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client("v1/exhibits/invalid/audio");
	
	t.true(statusCode === 400 || statusCode === 404);
	t.is(body.success, false);
});

test("GET /v1/exhibits/:exhibit_id/audio - handles missing audio file gracefully", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	// Test offline mode - audio should not be available
	const { body, statusCode } = await client("v1/exhibits/1/audio?mode=offline");
	
	// Should return 402 error when audio not available in offline mode
	t.is(statusCode, 402);
	t.is(body.success, false);
	t.regex(body.message, /audio.*not.*available.*offline/i);
});

/**
 * ===================================
 * EXHIBIT RATING TESTS (Protected)
 * ===================================
 */

test.serial("POST /v1/exhibits/:exhibit_id/ratings - successfully rates exhibit when authenticated", async (t) => {
	const username = generateUsername("rater");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Get exhibit before rating to check current average
	const beforeRating = await client("v1/exhibits/1");
	t.is(beforeRating.statusCode, 200);
	const initialRating = beforeRating.body.data.rating;
	
	// Import mock data to calculate expected new average
	const { mockExhibits } = await import("../data/mockData.js");
	const exhibit = mockExhibits.find(e => e.exhibitId === 1);
	
	// Calculate expected new average rating
	const currentRatings = Array.from(exhibit.ratings.values());
	const newRatingValue = 4;
	const allRatings = [...currentRatings, newRatingValue];
	const rawAverage = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
	// The service rounds to 1 decimal place
	const expectedAverage = Math.round(rawAverage * 10) / 10;

	// Rate exhibit
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: newRatingValue
		}
	});

	t.is(statusCode, 201);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.exhibitId, 1);
	t.is(body.data.rating, newRatingValue);
	t.is(body.data.averageRating, expectedAverage);
	
	// Verify the rating was actually updated in the exhibit
	const afterRating = await client("v1/exhibits/1");
	t.is(afterRating.statusCode, 200);
	t.is(afterRating.body.data.rating, expectedAverage);
	t.not(afterRating.body.data.rating, initialRating); // Rating should have changed
});

test("POST /v1/exhibits/:exhibit_id/ratings - fails without authentication", async (t) => {
	const client = createClient(t.context.baseUrl);
	
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 5
		}
	});

	t.is(statusCode, 401);
	t.is(body.success, false);
	t.regex(body.message, /unauthorized|authentication|token/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - returns 400 for invalid exhibit ID format", async (t) => {
	const username = generateUsername("raterinvalid");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Try to rate with invalid exhibit ID
	const { body, statusCode } = await client.post("v1/exhibits/invalid/ratings", {
		json: {
			rating: 5
		}
	});

	t.true(statusCode === 400 || statusCode === 404);
	t.is(body.success, false);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with invalid rating (too low)", async (t) => {
	const username = generateUsername("rater2");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Try to rate with invalid value
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 0
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|invalid|valid/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with invalid rating (too high)", async (t) => {
	const username = generateUsername("rater3");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Try to rate with invalid value
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {
			rating: 6
		}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|invalid|valid/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails with missing rating", async (t) => {
	const username = generateUsername("rater4");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Try to rate without rating value
	const { body, statusCode } = await client.post("v1/exhibits/1/ratings", {
		json: {}
	});

	t.is(statusCode, 400);
	t.is(body.success, false);
	t.regex(body.message, /rating|required/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - fails for non-existent exhibit", async (t) => {
	const username = generateUsername("rater5");
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Try to rate non-existent exhibit
	const { body, statusCode } = await client.post("v1/exhibits/99999/ratings", {
		json: {
			rating: 5
		}
	});

	t.is(statusCode, 404);
	t.is(body.success, false);
	t.regex(body.message, /not found/i);
});

test.serial("POST /v1/exhibits/:exhibit_id/ratings - updates rating when user rates same exhibit twice", async (t) => {
	const username = generateUsername("updater");
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail(username),
		"Test123!@#"
	);

	// Get initial state
	const { mockExhibits } = await import("../data/mockData.js");
	const exhibit = mockExhibits.find(e => e.exhibitId === 3);
	const initialRatingsCount = exhibit.ratings.size;

	// First rating
	const firstRating = await client.post("v1/exhibits/3/ratings", {
		json: { rating: 3 }
	});
	t.is(firstRating.statusCode, 201);
	
	// Check that one rating was added
	t.is(exhibit.ratings.size, initialRatingsCount + 1);
	t.is(exhibit.ratings.get(userId), 3);

	// Second rating from same user with different value
	const secondRating = await client.post("v1/exhibits/3/ratings", {
		json: { rating: 5 }
	});
	t.is(secondRating.statusCode, 201);
	
	// Rating count should NOT increase (update, not duplicate)
	t.is(exhibit.ratings.size, initialRatingsCount + 1);
	// Rating value should be updated
	t.is(exhibit.ratings.get(userId), 5);
	t.not(exhibit.ratings.get(userId), 3);
});

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
	
	// Login as admin
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
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

test('POST /exhibits - should validate required fields', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	// Missing title
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
	
	// Missing description
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
	
	// Missing location
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

test('POST /exhibits - should validate category type (must be string or array)', async t => {
	const client = createClient(t.context.baseUrl);
	
	// Login as admin
	const loginResponse = await client.post('v1/auth/login', {
		json: {
			username: 'john_smith',
			password: MOCK_ADMIN_PASSWORD
		}
	});
	
	const { token } = loginResponse.body.data;
	
	// Invalid category type (number)
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
	
	// Invalid category type (object)
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
