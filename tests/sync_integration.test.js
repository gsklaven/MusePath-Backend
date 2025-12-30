import test from 'ava';
import {
	registerAndLogin,
	setupTestServer,
	cleanupTestServer,
	generateUsername,
	generateEmail
} from './helpers.js';

/**
 * Sync Integration Tests
 * Complex workflows and stress tests for synchronization
 */

test.before(async t => {
	await setupTestServer(t);
});

test.after.always(async t => {
	await cleanupTestServer(t);
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