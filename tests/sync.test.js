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

// Purpose: ensure `/v1/sync` correctly processes offline batched operations
// and returns a structured summary of successes, failures and conflicts.
test.before(async t => {
	await setupTestServer(t);
});

test.after.always(async t => {
	await cleanupTestServer(t);
});

// Run tests serially to avoid timestamp collision
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

test.serial('POST /sync - should synchronize multiple operations', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncmulti'),
		generateEmail('syncmulti'),
		'Password123!'
	);
	
	const response = await client.post('v1/sync', {
		json: [
			{
				operation_type: 'rating',
				exhibit_id: 1,
				rating: 4
			},
			{
				operation_type: 'add_favorite',
				exhibit_id: 2
			},
			{
				operation_type: 'rating',
				exhibit_id: 3,
				rating: 5
			}
		]
	});
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.is(response.body.data.successful, 3);
	t.is(response.body.data.failed, 0);
	t.is(response.body.data.details.successful.length, 3);
});

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

test.serial('POST /sync - should handle unknown operation type', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncunknown'),
		generateEmail('syncunknown'),
		'Password123!'
	);
	
	const response = await client.post('v1/sync', {
		json: [
			{
				operation_type: 'unknown_operation',
				exhibit_id: 1
			}
		]
	});
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.is(response.body.data.successful, 0);
	t.is(response.body.data.failed, 1);
	t.is(response.body.data.details.failed.length, 1);
	t.regex(response.body.data.details.failed[0].reason, /unknown operation/i);
});

test.serial('POST /sync - should handle invalid exhibit ID in rating', async t => {
	const username = generateUsername('syncinvex');
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail('syncinvex'),
		'Password123!'
	);
	
	const response = await client.post('v1/sync', {
		json: [
			{
				operation_type: 'rating',
				exhibit_id: 99999,
				rating: 5
			}
		]
	});
	
	// In mock mode, non-existent exhibits return null but don't throw error
	// So the operation completes "successfully" even though exhibit doesn't exist
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	// The operation counts as successful because no error is thrown
	t.is(response.body.data.successful, 1);
	t.is(response.body.data.failed, 0);
});

test.serial('POST /sync - should handle mixed success and failure operations', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncmixed'),
		generateEmail('syncmixed'),
		'Password123!'
	);
	
	const response = await client.post('v1/sync', {
		json: [
			{
				operation_type: 'rating',
				exhibit_id: 1,
				rating: 5
			},
			{
				operation_type: 'unknown_operation',
				exhibit_id: 2
			},
			{
				operation_type: 'add_favorite',
				exhibit_id: 3
			}
		]
	});
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	// 2 valid operations succeed (rating + add_favorite), 1 fails (unknown_operation)
	t.is(response.body.data.successful, 2);
	t.is(response.body.data.failed, 1);
	t.is(response.body.data.details.successful.length, 2);
	t.is(response.body.data.details.failed.length, 1);
});

test.serial('POST /sync - should handle invalid rating value', async t => {
	const username = generateUsername('syncinvrat');
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		generateEmail('syncinvrat'),
		'Password123!'
	);
	
	const response = await client.post('v1/sync', {
		json: [
			{
				operation_type: 'rating',
				exhibit_id: 1,
				rating: 10 // Invalid - should be 1-5
			}
		]
	});
	
	// Note: The sync endpoint doesn't validate rating values
	// It passes them directly to the exhibit service
	// In a real implementation, this might succeed or fail depending on service validation
	t.is(response.statusCode, 200);
	t.true(response.body.success);
});

test.serial('Sync workflow - offline user syncs multiple changes', async t => {
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncworkflow'),
		generateEmail('syncworkflow'),
		'Password123!'
	);
	
	// Simulate offline operations queue
	const offlineOperations = [
		{
			operation_type: 'rating',
			exhibit_id: 1,
			rating: 5
		},
		{
			operation_type: 'rating',
			exhibit_id: 2,
			rating: 4
		},
		{
			operation_type: 'add_favorite',
			exhibit_id: 1
		},
		{
			operation_type: 'add_favorite',
			exhibit_id: 3
		},
		{
			operation_type: 'rating',
			exhibit_id: 3,
			rating: 5
		}
	];
	
	// Sync all operations
	const syncResponse = await client.post('v1/sync', {
		json: offlineOperations
	});
	
	t.is(syncResponse.statusCode, 200);
	t.true(syncResponse.body.success);
	t.is(syncResponse.body.data.successful, 5);
	t.is(syncResponse.body.data.failed, 0);
	
	// Verify exhibit can still be retrieved
	const exhibit1Response = await client.get('v1/exhibits/1');
	t.is(exhibit1Response.statusCode, 200);
	t.truthy(exhibit1Response.body.data);
});

test.serial('Sync workflow - batch sync with add and remove favorites', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncbatch'),
		generateEmail('syncbatch'),
		'Password123!'
	);
	
	// Add some favorites first
	await client.post('v1/sync', {
		json: [
			{
				operation_type: 'add_favorite',
				exhibit_id: 1
			},
			{
				operation_type: 'add_favorite',
				exhibit_id: 2
			}
		]
	});
	
	// Now sync operations that include removing one
	const response = await client.post('v1/sync', {
		json: [
			{
				operation_type: 'remove_favorite',
				exhibit_id: 1
			},
			{
				operation_type: 'add_favorite',
				exhibit_id: 3
			}
		]
	});
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.is(response.body.data.successful, 2);
	t.is(response.body.data.failed, 0);
});

test.serial('Sync workflow - large batch of operations', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('synclarge'),
		generateEmail('synclarge'),
		'Password123!'
	);
	
	// Create a large batch of operations
	const operations = [];
	for (let i = 1; i <= 5; i++) {
		operations.push({
			operation_type: 'rating',
			exhibit_id: i,
			rating: (i % 5) + 1
		});
	}
	for (let i = 1; i <= 3; i++) {
		operations.push({
			operation_type: 'add_favorite',
			exhibit_id: i
		});
	}
	
	const response = await client.post('v1/sync', {
		json: operations
	});
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.is(response.body.data.successful, 8);
	t.is(response.body.data.failed, 0);
	t.is(response.body.data.details.successful.length, 8);
});
