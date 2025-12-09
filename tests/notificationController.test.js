import test from 'ava';
import got from 'got';
import http from 'node:http';
import app from '../app.js';

let server;
let gotInstance;

test.before(async (t) => {
	await new Promise((resolve) => {
		server = http.createServer(app);
		const runningServer = server.listen(0, () => {
			const { port } = runningServer.address();
			gotInstance = got.extend({
				prefixUrl: `http://localhost:${port}/v1/`,
				responseType: 'json',
			});
			t.context.got = gotInstance;
			resolve();
		});
	});
});

test.after.always(() => {
	server && server.close();
});

test('POST /notifications sends notification returns 200', async (t) => {
	const payload = {
		user_id: 1,
		route_id: 1,
		currentLat: 40.7614,
		currentLng: -73.9776
	};
	const { body, statusCode } = await t.context.got.post('notifications', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.message, 'Notification sent successfully');
});

test('POST /notifications missing fields returns 400', async (t) => {
	const payload = {
		user_id: 1,
		currentLat: 40.7614
	};
	const { body, statusCode } = await t.context.got.post('notifications', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
	t.false(body.success);
	t.regex(body.message, /missing required fields/i);
});

test('POST /notifications with invalid coordinates (outside of the boundaries) returns 400', async (t) => {
	const payload = {
		user_id: 1,
		route_id: 1,
		currentLat: 999,
		currentLng: -999
	};
	const { body, statusCode } = await t.context.got.post('notifications', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
	t.false(body.success);
	t.regex(body.message, /invalid current coordinates/i);
});

test('POST /notifications with non-existent route returns 404', async (t) => {
	const payload = {
		user_id: 1,
		route_id: 9999,
		currentLat: 40.7614,
		currentLng: -73.9776
	};
	const { body, statusCode } = await t.context.got.post('notifications', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 404);
	t.false(body.success);
	t.regex(body.message, /route not found/i);
});

test('POST /notifications returns info type and on-track message when on route', async (t) => {
	const payload = {
		user_id: 1,
		route_id: 1,
		currentLat: 40.7614,
		currentLng: -73.9776
	};
	const { body, statusCode } = await t.context.got.post('notifications', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.data.type, 'info');
	t.is(body.data.message, 'You are on track');
});

test('POST /notifications returns route_deviation type and deviation message when off route', async (t) => {
	const payload = {
		user_id: 1,
		route_id: 1,
		currentLat: 0,
		currentLng: 0
	};
	const { body, statusCode } = await t.context.got.post('notifications', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.data.type, 'route_deviation');
	t.regex(body.data.message, /deviated from the route/i);
});

test('POST /notifications returns unique notificationId for each notification', async (t) => {
	const payload = {
		user_id: 1,
		route_id: 1,
		currentLat: 40.7614,
		currentLng: -73.9776
	};
	const first = await t.context.got.post('notifications', { json: payload, throwHttpErrors: false });
	const second = await t.context.got.post('notifications', { json: payload, throwHttpErrors: false });
	t.not(first.body.data.notificationId, undefined);
	t.not(second.body.data.notificationId, undefined);
	t.not(first.body.data.notificationId, second.body.data.notificationId);
});

test('POST /sync synchronizes offline data return 200', async (t) => {
	const payload = [
		{ operation_type: 'RATING', exhibit_id: 1, rating: 5 },
		{ operation_type: 'ADD_FAVORITE', exhibit_id: 2 },
		{ operation_type: 'REMOVE_FAVORITE', exhibit_id: 3 }
	];
	const { body, statusCode } = await t.context.got.post('sync', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.message, 'Synchronization completed');
});

test('POST /sync with invalid payload returns 400', async (t) => {
	const payload = { not: 'an array' };
	const { body, statusCode } = await t.context.got.post('sync', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
	t.false(body.success);
	t.regex(body.message, /invalid operations payload/i);
});

test('POST /sync with unknown operation type returns failed result', async (t) => {
	const payload = [
		{ operation_type: 'UNKNOWN', exhibit_id: 1 }
	];
	const { body, statusCode } = await t.context.got.post('sync', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.data.failed, 1);
	t.is(body.data.successful, 0);
	t.is(body.data.details.failed[0].reason, 'Unknown operation type');
});
