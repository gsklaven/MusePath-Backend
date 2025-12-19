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

// Test to ensure multiple operations can be synchronized in a single request.
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

// Test to ensure the endpoint can handle an empty array of operations.
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

// Test to ensure the endpoint rejects a non-array payload.
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

// Test to ensure the endpoint can handle an unknown operation type.
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

// Test to ensure the endpoint can handle a mix of successful and failed operations.
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
