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
