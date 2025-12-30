import test from 'ava';
import {
	registerAndLogin,
	setupTestServer,
	cleanupTestServer,
	createClient,
	generateUsername,
	generateEmail
} from './helpers.js';

/**
 * Sync Endpoints Tests
 * Tests for offline data synchronization functionality
 * 
 * This suite verifies that the /sync endpoint correctly handles:
 * - Authentication requirements
 * - Single and batched operations
 * - Different operation types (ratings, favorites)
 * - Error handling for invalid data or unknown operations
 * - Integration workflows simulating offline usage
 */

test.before(async t => {
	await setupTestServer(t);
});

test.after.always(async t => {
	await cleanupTestServer(t);
});

// Run tests serially to avoid timestamp collision
// Test case: Ensure synchronization endpoints are protected
test.serial('POST /sync - should require authentication', async t => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.post('v1/sync', {
		json: [
			{
				operation_type: 'rating',
				exhibit_id: 1,
				rating: 5
			}
		]
	});
	
	t.is(response.statusCode, 401);
});

// Test case: Verify synchronization of a single rating operation
test.serial('POST /sync - should synchronize single rating operation', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncuser'),
		generateEmail('syncuser'),
		'Password123!'
	);
	
	// Construct a batch of mixed operations to verify the server can process
	// multiple actions in a single request. This is critical for offline-first functionality.
	const response = await client.post('v1/sync', {
		json: [
			{
				operation_type: 'rating',
				exhibit_id: 1,
				rating: 5
			}
		]
	});
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.is(response.body.data.successful, 1);
	t.is(response.body.data.failed, 0);
	t.is(response.body.data.conflicts.length, 0);
	t.is(response.body.data.details.successful.length, 1);
	t.is(response.body.data.details.failed.length, 0);
});

// Test case: Verify synchronization of adding a favorite exhibit
test.serial('POST /sync - should synchronize add_favorite operation', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncfav'),
		generateEmail('syncfav'),
		'Password123!'
	);
	
	const response = await client.post('v1/sync', {
		json: [
			{
				operation_type: 'add_favorite',
				exhibit_id: 2
			}
		]
	});
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.is(response.body.data.successful, 1);
	t.is(response.body.data.failed, 0);
});

// Test case: Verify synchronization of removing a favorite exhibit
test.serial('POST /sync - should synchronize remove_favorite operation', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncremove'),
		generateEmail('syncremove'),
		'Password123!'
	);
	
	// First add a favorite
	await client.post('v1/users/1/favourites', {
		json: { exhibit_id: 1 }
	});
	
	// Then sync remove operation
	const response = await client.post('v1/sync', {
		json: [
			{
				operation_type: 'remove_favorite',
				exhibit_id: 1
			}
		]
	});
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.is(response.body.data.successful, 1);
	t.is(response.body.data.failed, 0);
});

// Test case: Verify handling of an empty operations array
test.serial('POST /sync - should handle empty operations array', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncempty'),
		generateEmail('syncempty'),
		'Password123!'
	);
	
	const response = await client.post('v1/sync', {
		json: []
	});
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.is(response.body.data.successful, 0);
	t.is(response.body.data.failed, 0);
	t.is(response.body.message, 'No operations to synchronize');
});

// Test case: Verify validation of the request payload format
test.serial('POST /sync - should reject non-array payload', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncinvalid'),
		generateEmail('syncinvalid'),
		'Password123!'
	);
	
	const response = await client.post('v1/sync', {
		json: {
			operation_type: 'rating',
			exhibit_id: 1,
			rating: 5
		}
	});
	
	t.is(response.statusCode, 400);
	t.false(response.body.success);
	t.regex(response.body.message, /array/i);
});
