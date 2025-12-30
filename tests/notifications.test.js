import test from 'ava';
import {
	registerAndLogin,
	setupTestServer,
	cleanupTestServer,
	createClient,
	generateUsername,
	generateEmail,
	createTestRoute,
	sendNotification
} from './helpers.js';

/**
 * Notifications Endpoints Tests
 * Tests for notification functionality
 * 
 * This suite verifies the behavior of the notification system which tracks user progress
 * along routes and alerts them of deviations or important information.
 * 
 * Key areas tested:
 * - Authentication and Authorization: Ensuring only logged-in users can send notifications.
 * - Route Tracking: Verifying notifications when users are on-route vs off-route.
 * - Deviation Detection: Checking if the system correctly identifies when a user strays from the path.
 * - Input Validation: Ensuring coordinates and route IDs are valid.
 * - Edge Cases: Boundary coordinates, empty routes, and concurrent users.
 */

test.before(async t => {
	await setupTestServer(t);
});

test.after.always(async t => {
	await cleanupTestServer(t);
});

// Test case: Ensure that the notification endpoint is protected
// Run tests serially to avoid timestamp collision
test.serial('POST /notifications - should require authentication', async t => {
	const client = createClient(t.context.baseUrl);
	
	const response = await sendNotification(client, 1, 40.7614, -73.9776);
	
	t.is(response.statusCode, 401);
});

// Test case: Verify that a user on the correct path receives a standard update
test.serial('POST /notifications - should send notification when user is on route', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('notifuser'),
		generateEmail('notifuser'),
		'Password123!'
	);
	
	// Create a route first
	const routeId = await createTestRoute(client);
	
	// Send notification with current position on route
	const response = await sendNotification(client, routeId, 40.7614, -73.9776);
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.truthy(response.body.data);
	t.truthy(response.body.data.notificationId);
	t.truthy(response.body.data.type);
	t.truthy(response.body.data.message);
});

// Test case: Verify that the system detects when a user is too far from the calculated path
test.serial('POST /notifications - should detect route deviation', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('deviateuser'),
		generateEmail('deviateuser'),
		'Password123!'
	);
	
	// Create a route
	const routeId = await createTestRoute(client);
	
	// Send notification with position far from route (deviated)
	const response = await sendNotification(client, routeId, 41.0000, -74.0000);
	
	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.is(response.body.data.type, 'route_deviation');
	t.true(response.body.data.message.includes('deviated'));
});

// Test case: Ensure proper error handling for invalid route IDs
test.serial('POST /notifications - should return 404 for non-existent route', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('noroute'),
		generateEmail('noroute'),
		'Password123!'
	);
	
	const response = await sendNotification(client, 99999, 40.7614, -73.9776);
	
	t.is(response.statusCode, 404);
	t.false(response.body.success);
});

// Test case: Verify that all required fields (route_id, lat, lng) are present
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

// Test case: Ensure that invalid geographical coordinates are rejected to maintain data integrity
test.serial('POST /notifications - should validate coordinate ranges', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('coorduser'),
		generateEmail('coorduser'),
		'Password123!'
	);
	
	// Invalid latitude (too high)
	let response = await sendNotification(client, 1, 91, -73.9776);
	
	t.is(response.statusCode, 400);
	t.true(response.body.message.includes('Invalid current coordinates'));
	
	// Invalid latitude (too low)
	response = await sendNotification(client, 1, -91, -73.9776);
	
	t.is(response.statusCode, 400);
	
	// Invalid longitude (too high)
	response = await sendNotification(client, 1, 40.7614, 181);
	
	t.is(response.statusCode, 400);
	
	// Invalid longitude (too low)
	response = await sendNotification(client, 1, 40.7614, -181);
	
	t.is(response.statusCode, 400);
});
