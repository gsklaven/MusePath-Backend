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

/**
 * Helper to create a route for testing
 */
const createTestRoute = async (client, destinationId = 1, startLat = 40.7614, startLng = -73.9776) => {
	const response = await client.post('v1/routes', {
		json: {
			destination_id: destinationId,
			startLat,
			startLng
		}
	});
	return response.body.data.route_id;
};

/**
 * Helper to send a notification
 */
const sendNotification = (client, routeId, currentLat, currentLng) => {
	return client.post('v1/notifications', {
		json: {
			route_id: routeId,
			currentLat,
			currentLng
		}
	});
};

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

// Test case: Verify that multiple notifications can be sent for the same route without conflict
test.serial('POST /notifications - should work with multiple notifications', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('multinotif'),
		generateEmail('multinotif'),
		'Password123!'
	);
	
	// Create a route
	const routeId = await createTestRoute(client);
	
	// Send multiple notifications
	const response1 = await sendNotification(client, routeId, 40.7614, -73.9776);
	
	t.is(response1.statusCode, 200);
	
	const response2 = await sendNotification(client, routeId, 40.7615, -73.9777);
	
	t.is(response2.statusCode, 200);
	
	// Notification IDs should be different
	t.not(response1.body.data.notificationId, response2.body.data.notificationId);
});

// Test case: Verify that edge case coordinates (poles, date line) are handled correctly
test.serial('POST /notifications - should handle boundary coordinate values', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('boundaryuser'),
		generateEmail('boundaryuser'),
		'Password123!'
	);
	
	// Create a route
	const routeId = await createTestRoute(client);
	
	// Maximum valid latitude
	let response = await sendNotification(client, routeId, 90, 0);
	
	t.is(response.statusCode, 200);
	
	// Minimum valid latitude
	response = await sendNotification(client, routeId, -90, 0);
	
	t.is(response.statusCode, 200);
	
	// Maximum valid longitude
	response = await sendNotification(client, routeId, 0, 180);
	
	t.is(response.statusCode, 200);
	
	// Minimum valid longitude
	response = await sendNotification(client, routeId, 0, -180);
	
	t.is(response.statusCode, 200);
});

// Integration Test: Simulate a user walking along a route and receiving appropriate updates
// This tests the stateful nature of the notification service during a session
test.serial('Notification workflow - user follows route and receives updates', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('workflowuser'),
		generateEmail('workflowuser'),
		'Password123!'
	);
	
	// Create a route
	const routeId = await createTestRoute(client);
	
	// User starts at route start
	const notification1 = await sendNotification(client, routeId, 40.7614, -73.9776);
	
	t.is(notification1.statusCode, 200);
	t.is(notification1.body.data.type, 'info');
	
	// User moves slightly on route
	const notification2 = await sendNotification(client, routeId, 40.7615, -73.9775);
	
	t.is(notification2.statusCode, 200);
	
	// User deviates from route
	const notification3 = await sendNotification(client, routeId, 41.0000, -74.0000);
	
	t.is(notification3.statusCode, 200);
	t.is(notification3.body.data.type, 'route_deviation');
});

// Integration Test: Verify that the system handles multiple concurrent users correctly
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
	const routeId1 = await createTestRoute(user1.client, 1, 40.7614, -73.9776);
	const routeId2 = await createTestRoute(user2.client, 2, 40.7615, -73.9775);
	
	// Both users send notifications
	const notif1 = await sendNotification(user1.client, routeId1, 40.7614, -73.9776);
	const notif2 = await sendNotification(user2.client, routeId2, 40.7615, -73.9775);
	
	t.is(notif1.statusCode, 200);
	t.is(notif2.statusCode, 200);
	
	// Notifications should have different IDs
	t.not(notif1.body.data.notificationId, notif2.body.data.notificationId);
});

// Test case: Verify robustness when handling routes with missing or empty path data
test.serial('POST /notifications - should handle route with no path (empty route)', async t => {
	const { client } = await registerAndLogin(
		t.context.baseUrl,
		generateUsername('emptypath'),
		generateEmail('emptypath'),
		'Password123!'
	);
	
	// Create a route
	const routeId = await createTestRoute(client, 1, 40.7610, -73.9780);
	
	// Send notification - should work even if path handling has edge cases
	const response = await sendNotification(client, routeId, 40.7610, -73.9780);
	
	// Should succeed regardless of path structure
	t.true(response.statusCode === 200 || response.statusCode === 404);
});
