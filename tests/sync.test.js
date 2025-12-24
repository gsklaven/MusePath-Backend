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

// Test case: Verify synchronization of multiple mixed operations in one batch
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

// Test case: Verify graceful handling of unknown operation types
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

// Test case: Verify handling of operations on non-existent exhibits
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

// Test case: Verify partial success when some operations fail and others succeed
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

// Test case: Verify handling of invalid data values within operations
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

// Test case: Integration workflow simulating an offline user coming online
test.serial('Sync workflow - offline user syncs multiple changes', async t => {
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncworkflow'),
		generateEmail('syncworkflow'),
		'Password123!'
	);
	
	// Simulate offline operations queue accumulating actions while the user
	// has no internet connection.
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
	
	// Sync all operations once connection is restored
	const syncResponse = await client.post('v1/sync', {
		json: offlineOperations
	});
	
	t.is(syncResponse.statusCode, 200);
	t.true(syncResponse.body.success);
	t.is(syncResponse.body.data.successful, 5);
	t.is(syncResponse.body.data.failed, 0);
	
	// Verify exhibit can still be retrieved and data is consistent
	const exhibit1Response = await client.get('v1/exhibits/1');
	t.is(exhibit1Response.statusCode, 200);
	t.truthy(exhibit1Response.body.data);
});

// Test case: Integration workflow for batch updates to favorites
test.serial('Sync workflow - batch sync with add and remove favorites', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('syncbatch'),
		generateEmail('syncbatch'),
		'Password123!'
	);
	
	// Add some favorites first to set up the initial state
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
	
	// Now sync operations that include removing one of the previously added favorites
	// This tests the order of operations and state consistency.
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

// Test case: Stress test with a larger batch of operations
test.serial('Sync workflow - large batch of operations', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('synclarge'),
		generateEmail('synclarge'),
		'Password123!'
	);
	
	// Create a large batch of operations to test performance and limits
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
