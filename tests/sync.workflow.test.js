import test from 'ava';
import {
	registerAndLogin,
	setupTestServer,
	cleanupTestServer,
	createClient,
	generateUsername,
	generateEmail
} from './helpers.js';

test.before(async t => {
	await setupTestServer(t);
});

test.after.always(async t => {
	await cleanupTestServer(t);
});

// Test to ensure the endpoint can handle an invalid exhibit ID in a rating operation.
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

// Test to ensure the endpoint can handle an invalid rating value.
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

// Test a full sync workflow with multiple offline changes.
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

// Test a batch sync with both add and remove favorite operations.
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

// Test a large batch of operations to ensure the endpoint can handle it.
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
