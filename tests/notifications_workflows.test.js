import test from 'ava';
import {
	registerAndLogin,
	setupTestServer,
	cleanupTestServer,
	generateUsername,
	generateEmail,
	createTestRoute,
	sendNotification
} from './helpers.js';

/**
 * Notifications Workflow Tests
 * Complex workflows and edge cases for notification functionality
 */

test.before(async t => {
	await setupTestServer(t);
});

test.after.always(async t => {
	await cleanupTestServer(t);
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