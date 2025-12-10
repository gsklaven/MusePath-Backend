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
 * Notifications Endpoints Tests
 * Tests for notification functionality
 */

test.before(async t => {
	await setupTestServer(t);
});

test.after.always(async t => {
	await cleanupTestServer(t);
});

// Run tests serially to avoid timestamp collision
test.serial('POST /notifications - should require authentication', async t => {
	const client = createClient(t.context.baseUrl);
	
	const response = await client.post('v1/notifications', {
		json: {
			route_id: 1,
			currentLat: 40.7614,
			currentLng: -73.9776
		}
	});
	
	t.is(response.statusCode, 401);
});

test.serial('POST /notifications - should send notification when user is on route', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('notifuser'),
		generateEmail('notifuser'),
		'Password123!'
	);
	
	// Create a route first
	const routeResponse = await client.post('v1/routes', {
		json: {
			destination_id: 1,
			startLat: 40.7614,
			startLng: -73.9776
		}
	});
	
	t.is(routeResponse.statusCode, 200);
	const routeId = routeResponse.body.data.route_id;
	
	// Send notification with current position on route
	const response = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 40.7614,
			currentLng: -73.9776
		}
	});
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.truthy(response.body.data);
	t.truthy(response.body.data.notificationId);
	t.truthy(response.body.data.type);
	t.truthy(response.body.data.message);
});

test.serial('POST /notifications - should detect route deviation', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('deviateuser'),
		generateEmail('deviateuser'),
		'Password123!'
	);
	
	// Create a route
	const routeResponse = await client.post('v1/routes', {
		json: {
			destination_id: 1,
			startLat: 40.7614,
			startLng: -73.9776
		}
	});
	
	const routeId = routeResponse.body.data.route_id;
	
	// Send notification with position far from route (deviated)
	const response = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 41.0000, // Far from the route
			currentLng: -74.0000
		}
	});
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.is(response.body.data.type, 'route_deviation');
	t.true(response.body.data.message.includes('deviated'));
});

test.serial('POST /notifications - should return 404 for non-existent route', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('noroute'),
		generateEmail('noroute'),
		'Password123!'
	);
	
	const response = await client.post('v1/notifications', {
		json: {
			route_id: 99999,
			currentLat: 40.7614,
			currentLng: -73.9776
		}
	});
	
	t.is(response.statusCode, 404);
	t.false(response.body.success);
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

test.serial('POST /notifications - should work with multiple notifications', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('multinotif'),
		generateEmail('multinotif'),
		'Password123!'
	);
	
	// Create a route
	const routeResponse = await client.post('v1/routes', {
		json: {
			destination_id: 1,
			startLat: 40.7614,
			startLng: -73.9776
		}
	});
	
	const routeId = routeResponse.body.data.route_id;
	
	// Send multiple notifications
	const response1 = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 40.7614,
			currentLng: -73.9776
		}
	});
	
	t.is(response1.statusCode, 200);
	
	const response2 = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 40.7615,
			currentLng: -73.9777
		}
	});
	
	t.is(response2.statusCode, 200);
	
	// Notification IDs should be different
	t.not(response1.body.data.notificationId, response2.body.data.notificationId);
});

test.serial('POST /notifications - should handle boundary coordinate values', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('boundaryuser'),
		generateEmail('boundaryuser'),
		'Password123!'
	);
	
	// Create a route
	const routeResponse = await client.post('v1/routes', {
		json: {
			destination_id: 1,
			startLat: 40.7614,
			startLng: -73.9776
		}
	});
	
	const routeId = routeResponse.body.data.route_id;
	
	// Maximum valid latitude
	let response = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 90,
			currentLng: 0
		}
	});
	
	t.is(response.statusCode, 200);
	
	// Minimum valid latitude
	response = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: -90,
			currentLng: 0
		}
	});
	
	t.is(response.statusCode, 200);
	
	// Maximum valid longitude
	response = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 0,
			currentLng: 180
		}
	});
	
	t.is(response.statusCode, 200);
	
	// Minimum valid longitude
	response = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 0,
			currentLng: -180
		}
	});
	
	t.is(response.statusCode, 200);
});

test.serial('Notification workflow - user follows route and receives updates', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('workflowuser'),
		generateEmail('workflowuser'),
		'Password123!'
	);
	
	// Create a route
	const routeResponse = await client.post('v1/routes', {
		json: {
			destination_id: 1,
			startLat: 40.7614,
			startLng: -73.9776
		}
	});
	
	t.is(routeResponse.statusCode, 200);
	const routeId = routeResponse.body.data.route_id;
	
	// User starts at route start
	const notification1 = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 40.7614,
			currentLng: -73.9776
		}
	});
	
	t.is(notification1.statusCode, 200);
	t.is(notification1.body.data.type, 'info');
	
	// User moves slightly on route
	const notification2 = await client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat: 40.7615,
			currentLng: -73.9775
		}
	});
	
	t.is(notification2.statusCode, 200);
	
	// User deviates from route
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

test.serial('Notification workflow - multiple users with different routes', async t => {
	// Register and login first user
	const user1 = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('user1'),
		generateEmail('user1'),
		'Password123!'
	);
	
	// Register and login second user
	const user2 = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('user2'),
		generateEmail('user2'),
		'Password123!'
	);
	
	// Create routes for both users
	const route1 = await user1.client.post('v1/routes', {
		json: {
			destination_id: 1,
			startLat: 40.7614,
			startLng: -73.9776
		}
	});
	
	const route2 = await user2.client.post('v1/routes', {
		json: {
			destination_id: 2,
			startLat: 40.7615,
			startLng: -73.9775
		}
	});
	
	t.is(route1.statusCode, 200);
	t.is(route2.statusCode, 200);
	
	// Both users send notifications
	const notif1 = await user1.client.post('v1/notifications', {
		json: {
			route_id: route1.body.data.route_id,
			currentLat: 40.7614,
			currentLng: -73.9776
		}
	});
	
	const notif2 = await user2.client.post('v1/notifications', {
		json: {
			route_id: route2.body.data.route_id,
			currentLat: 40.7615,
			currentLng: -73.9775
		}
	});
	
	t.is(notif1.statusCode, 200);
	t.is(notif2.statusCode, 200);
	
	// Notifications should have different IDs
	t.not(notif1.body.data.notificationId, notif2.body.data.notificationId);
});
