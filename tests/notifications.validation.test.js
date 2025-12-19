import test from 'ava';
import {
	registerAndLogin,
	setupTestServer,
	cleanupTestServer,
	createClient,
	generateUsername,
	generateEmail
} from './helpers.js';

// Setup the test server before running the tests
test.before(async t => {
	await setupTestServer(t);
});

// Cleanup the test server after all tests have run
test.after.always(async t => {
	await cleanupTestServer(t);
});

// Test that the notifications endpoint validates the presence of required fields.
test.serial('POST /notifications - should validate required fields', async t => {
	// Register and login a new user
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('validateuser'),
		generateEmail('validateuser'),
		'Password123!'
	);
	
	// Attempt to send a notification with a missing route_id
	let response = await client.post('v1/notifications', {
		json: {
			currentLat: 40.7614,
			currentLng: -73.9776
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(response.statusCode, 400);
	
	// Attempt to send a notification with a missing currentLat
	response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLng: -73.9776
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(response.statusCode, 400);
	
	// Attempt to send a notification with a missing currentLng
	response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLat: 40.7614
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(response.statusCode, 400);
});

// Test that the notifications endpoint validates the coordinate ranges.
test.serial('POST /notifications - should validate coordinate ranges', async t => {
	// Register and login a new user
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('coorduser'),
		generateEmail('coorduser'),
		'Password123!'
	);
	
	// Attempt to send a notification with an invalid latitude (too high)
	let response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLat: 91,
			currentLng: -73.9776
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(response.statusCode, 400);
	t.true(response.body.message.includes('Invalid current coordinates'));
	
	// Attempt to send a notification with an invalid latitude (too low)
	response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLat: -91,
			currentLng: -73.9776
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(response.statusCode, 400);
	
	// Attempt to send a notification with an invalid longitude (too high)
	response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLat: 40.7614,
			currentLng: 181
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(response.statusCode, 400);
	
	// Attempt to send a notification with an invalid longitude (too low)
	response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLat: 40.7614,
			currentLng: -181
		}
	});
	// Assert that the server returns a 400 Bad Request status
	t.is(response.statusCode, 400);
});