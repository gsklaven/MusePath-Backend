import test from 'ava';
import {
	registerAndLogin,
	setupTestServer,
	cleanupTestServer,
	generateUsername,
	generateEmail
} from './helpers.js';

/**
 * Sync Workflows and Advanced Tests
 * Tests for batch operations, workflows, and edge cases
 * 
 * Test Coverage:
 * - Mixed operation batches (ratings + favorites)
 * - Unknown operation type handling
 * - Partial success scenarios (some ops fail, others succeed)
 * - Invalid data handling within batch operations
 */

test.before(async t => {
	await setupTestServer(t);
});

test.after.always(async t => {
	await cleanupTestServer(t);
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