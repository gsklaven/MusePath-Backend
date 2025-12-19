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

// Test that the notifications endpoint can handle multiple notifications for the same route.
test.serial('POST /notifications - should work with multiple notifications', async t => {
	// Register and login a new user
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('multinotif'),
		generateEmail('multinotif'),
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
	
	// Send the first notification for the route
	const response1 = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 40.7614,
			currentLng: -73.9776
		}
	});
	
	t.is(response1.statusCode, 200);
	
	// Send a second notification for the same route
	const response2 = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 40.7615,
			currentLng: -73.9777
		}
	});
	
	t.is(response2.statusCode, 200);
	
	// Assert that the two notifications have different IDs
	t.not(response1.body.data.notificationId, response2.body.data.notificationId);
});

// Test the notification workflow with multiple users on different routes.
test.serial('Notification workflow - multiple users with different routes', async t => {
	// Register and login the first user
	const user1 = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('user1'),
		generateEmail('user1'),
		'Password123!'
	);
	
	// Register and login the second user
	const user2 = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('user2'),
		generateEmail('user2'),
		'Password123!'
	);
	
	// Create a new route for the first user
	const route1 = await user1.client.post('v1/routes', {
		json: {
			destination_id: 1,
			startLat: 40.7614,
			startLng: -73.9776
		}
	});
	
	// Create a new route for the second user
	const route2 = await user2.client.post('v1/routes', {
		json: {
			destination_id: 2,
			startLat: 40.7615,
			startLng: -73.9775
		}
	});
	
	t.is(route1.statusCode, 200);
	t.is(route2.statusCode, 200);
	
	// Send a notification for the first user's route
	const notif1 = await user1.client.post('v1/notifications', {
		json: {
			route_id: route1.body.data.route_id,
			currentLat: 40.7614,
			currentLng: -73.9776
		}
	});
	
	// Send a notification for the second user's route
	const notif2 = await user2.client.post('v1/notifications', {
		json: {
			route_id: route2.body.data.route_id,
			currentLat: 40.7615,
			currentLng: -73.9775
		}
	});
	
	t.is(notif1.statusCode, 200);
	t.is(notif2.statusCode, 200);
	
	// Assert that the two notifications have different IDs
	t.not(notif1.body.data.notificationId, notif2.body.data.notificationId);
});