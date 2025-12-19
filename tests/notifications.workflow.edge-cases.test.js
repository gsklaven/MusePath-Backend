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

// Test that the notifications endpoint can handle boundary coordinate values.
test.serial('POST /notifications - should handle boundary coordinate values', async t => {
	// Register and login a new user
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('boundaryuser'),
		generateEmail('boundaryuser'),
		'Password123!'
	);
	
	// Create a new route for the user
	const routeResponse = await client.post('v1/routes', {
		json: {
			destination_id: 1,
			startLat: 40.7614,
			startLng: -73.9776
		}
	});
	
	const routeId = routeResponse.body.data.route_id;
	
	// Test with the maximum valid latitude
	let response = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 90,
			currentLng: 0
		}
	});
	
	t.is(response.statusCode, 200);
	
	// Test with the minimum valid latitude
	response = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: -90,
			currentLng: 0
		}
	});
	
	t.is(response.statusCode, 200);
	
	// Test with the maximum valid longitude
	response = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 0,
			currentLng: 180
		}
	});
	
	t.is(response.statusCode, 200);
	
	// Test with the minimum valid longitude
	response = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 0,
			currentLng: -180
		}
	});
	
	t.is(response.statusCode, 200);
});

// Test the notification workflow as a user follows and deviates from a route.
test.serial('Notification workflow - user follows route and receives updates', async t => {
	// Register and login a new user
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('workflowuser'),
		generateEmail('workflowuser'),
		'Password123!'
	);
	
	// Create a new route for the user
	const routeResponse = await client.post('v1/routes', {
		json: {
			destination_id: 1,
			startLat: 40.7614,
			startLng: -73.9776
		}
	});
	
	t.is(routeResponse.statusCode, 200);
	const routeId = routeResponse.body.data.route_id;
	
	// Send a notification when the user is at the start of the route
	const notification1 = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 40.7614,
			currentLng: -73.9776
		}
	});
	
	t.is(notification1.statusCode, 200);
	t.is(notification1.body.data.type, 'info');
	
	// Send a notification as the user moves slightly along the route
	const notification2 = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 40.7615,
			currentLng: -73.9775
		}
	});
	
	t.is(notification2.statusCode, 200);
	
	// Send a notification when the user deviates from the route
	const notification3 = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 41.0000,
			currentLng: -74.0000
		}
	});
	
	t.is(notification3.statusCode, 200);
	t.is(notification3.body.data.type, 'route_deviation');
});

// Test that the notifications endpoint can handle a route with no path.
test.serial('POST /notifications - should handle route with no path (empty route)', async t => {
	// Register and login a new user
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('emptypath'),
		generateEmail('emptypath'),
		'Password123!'
	);
	
	// Create a new route for the user
	const routeResponse = await client.post('v1/routes', {
		json: {
			destination_id: 1,
			startLat: 40.7610,
			startLng: -73.9780
		}
	});
	
	t.is(routeResponse.statusCode, 200);
	const routeId = routeResponse.body.data.route_id;
	
	// Send a notification for the route, which may have an empty path
	const response = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 40.7610,
			currentLng: -73.9780
		}
	});
	
	// The test should succeed regardless of the path structure, as the service should handle this edge case gracefully
	t.true(response.statusCode === 200 || response.statusCode === 404);
});