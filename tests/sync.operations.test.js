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
 *
 * This suite verifies the offline synchronization endpoint `/v1/sync`:
 * - Authentication requirement
 * - Handling of rating and favorite operations
 * - Bulk operation handling, conflicts and validation
 *
 * Tests are run serially to avoid state and timestamp collisions.
 */

// Sets up the test server before running the tests.
test.before(async t => {
	await setupTestServer(t);
});

// Cleans up the test server after all tests have run.
test.after.always(async t => {
	await cleanupTestServer(t);
});

// Test to ensure that the /v1/sync endpoint requires authentication.
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

// Test to ensure a single rating operation can be synchronized.
test.serial('POST /sync - should synchronize single rating operation', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncuser'),
		generateEmail('syncuser'),
		'Password123!'
	);
	
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

// Test to ensure an 'add_favorite' operation can be synchronized.
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

// Test to ensure a 'remove_favorite' operation can be synchronized.
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
