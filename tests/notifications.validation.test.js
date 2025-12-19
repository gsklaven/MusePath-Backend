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

test.serial('POST /notifications - should validate required fields', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('validateuser'),
		generateEmail('validateuser'),
		'Password123!'
	);
	
	// Missing route_id
	let response = await client.post('v1/notifications', {
		json: {
			currentLat: 40.7614,
			currentLng: -73.9776
		}
	});
	
	t.is(response.statusCode, 400);
	
	// Missing currentLat
	response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLng: -73.9776
		}
	});
	
	t.is(response.statusCode, 400);
	
	// Missing currentLng
	response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLat: 40.7614
		}
	});
	
	t.is(response.statusCode, 400);
});

test.serial('POST /notifications - should validate coordinate ranges', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('coorduser'),
		generateEmail('coorduser'),
		'Password123!'
	);
	
	// Invalid latitude (too high)
	let response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLat: 91,
			currentLng: -73.9776
		}
	});
	
	t.is(response.statusCode, 400);
	t.true(response.body.message.includes('Invalid current coordinates'));
	
	// Invalid latitude (too low)
	response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLat: -91,
			currentLng: -73.9776
		}
	});
	
	t.is(response.statusCode, 400);
	
	// Invalid longitude (too high)
	response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLat: 40.7614,
			currentLng: 181
		}
	});
	
	t.is(response.statusCode, 400);
	
	// Invalid longitude (too low)
	response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLat: 40.7614,
			currentLng: -181
		}
	});
	
	t.is(response.statusCode, 400);
});
