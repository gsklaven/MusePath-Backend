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

test('POST /routes creates a route return 200', async (t) => {
	const payload = {
		user_id: 1,
		destination_id: 1,
		startLat: 40.7614,
		startLng: -73.9776
	};
	const { body, statusCode } = await t.context.got.post('routes', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.message, 'Route calculated successfully');
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'route_id'));
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'user_id'));
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'destination_id'));
});


test('POST /routes with missing fields returns 400', async (t) => {
	const payload = {
		user_id: 1,
		startLat: 40.7614
	};
	const { body, statusCode } = await t.context.got.post('routes', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
	t.false(body.success);
	t.regex(body.message, /missing required fields/i);
});

test('POST /routes with non-existent destination returns 404', async (t) => {
	const payload = {
		user_id: 1,
		destination_id: 999,
		startLat: 40.7614,
		startLng: -73.9776
	};
	const { body, statusCode } = await t.context.got.post('routes', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 404);
	t.false(body.success);
	t.regex(body.message, /destination not found/i);
});

test('POST /routes with invalid coordinates (outside the boundaries) returns 400', async (t) => {
	const payload = {
		user_id: 1,
		destination_id: 1,
		startLat: 999,
		startLng: -999
	};
	const { body, statusCode } = await t.context.got.post('routes', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
	t.false(body.success);
	t.regex(body.message, /invalid start coordinates/i);
});

test('GET /routes/:id returns route details return 200', async (t) => {

    // Creating a route to retrieve
	const createPayload = {
		user_id: 1,
		destination_id: 1,
		startLat: 40.7614,
		startLng: -73.9776
	};
	const createRes = await t.context.got.post('routes', {
		json: createPayload,
		throwHttpErrors: false
	});
	const routeId = createRes.body.data.route_id;

	const { body, statusCode } = await t.context.got(`routes/${routeId}`, { throwHttpErrors: false });
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.message, 'Route details retrieved successfully');
	t.is(body.data.route_id, routeId);
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'estimatedTime'));
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'arrivalTime'));
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'distance'));
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'path'));
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'instructions'));
});

test('GET /routes/:id returns 404 for non-existent route', async (t) => {
	const { body, statusCode } = await t.context.got('routes/9999', { throwHttpErrors: false });
	t.is(statusCode, 404);
	t.false(body.success);
	t.is(body.message, 'Route not found');
});

test('GET /routes/:id with invalid ID format returns 404', async (t) => {
	const { body, statusCode } = await t.context.got('routes/abc', { throwHttpErrors: false });
	t.is(statusCode, 404);
	t.false(body.success);
	t.is(body.message, 'Route not found');
});


test('PUT /routes/:id updates route stops returns 200', async (t) => {

	// Creating a route to update
	const createPayload = {
		user_id: 1,
		destination_id: 1,
		startLat: 40.7614,
		startLng: -73.9776
	};
	const createRes = await t.context.got.post('routes', {
		json: createPayload,
		throwHttpErrors: false
	});
	const routeId = createRes.body.data.route_id;

	const updatePayload = {
		addStops: [
			{ lat: 40.7620, lng: -73.9780 },
			{ lat: 40.7630, lng: -73.9790 }
		]
	};
	const { body, statusCode } = await t.context.got.put(`routes/${routeId}`, {
		json: updatePayload,
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.data.route_id, routeId);
	t.true(body.data.stopsUpdated);
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'newEstimatedTime'));
});

test('PUT /routes/:id returns 404 for non-existent route', async (t) => {
	const updatePayload = {
		addStops: [
			{ lat: 40.7620, lng: -73.9780 }
		]
	};
	const { body, statusCode } = await t.context.got.put('routes/999', {
		json: updatePayload,
		throwHttpErrors: false
	});
	t.is(statusCode, 404);
	t.false(body.success);
	t.is(body.message, 'Route not found');
});

test('PUT /routes/:id with invalid ID format returns 404', async (t) => {
	const updatePayload = { addStops: [{ lat: 40.7620, lng: -73.9780 }] };
	const { body, statusCode } = await t.context.got.put('routes/abc', {
		json: updatePayload,
		throwHttpErrors: false
	});
	t.is(statusCode, 404);
	t.false(body.success);
	t.is(body.message, 'Route not found');
});


test('POST /routes/:id recalculates route (success)', async (t) => {

	// Creating a route to recalculate
	const createPayload = {
		user_id: 1,
		destination_id: 1,
		startLat: 40.7614,
		startLng: -73.9776
	};
	const createRes = await t.context.got.post('routes', {
		json: createPayload,
		throwHttpErrors: false
	});
	const routeId = createRes.body.data.route_id;

	const { body, statusCode } = await t.context.got.post(`routes/${routeId}`, {
		json: {},
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.data.route_id, routeId);
	t.is(body.message, 'Route recalculated successfully');
});

test('POST /routes/:id returns 404 for non-existent route', async (t) => {
	const { body, statusCode } = await t.context.got.post('routes/999', {
		json: {},
		throwHttpErrors: false
	});
	t.is(statusCode, 404);
	t.false(body.success);
	t.is(body.message, 'Route not found');
});

test('POST /routes/:id with invalid ID format returns 404', async (t) => {
	const { body, statusCode } = await t.context.got.post('routes/abc', {
		json: {},
		throwHttpErrors: false
	});
	t.is(statusCode, 404);
	t.false(body.success);
	t.is(body.message, 'Route not found');
});


test('DELETE /routes/:id deletes route (success)', async (t) => {
    
	// Creating a route to delete
	const createPayload = {
		user_id: 1,
		destination_id: 1,
		startLat: 40.7614,
		startLng: -73.9776
	};
	const createRes = await t.context.got.post('routes', {
		json: createPayload,
		throwHttpErrors: false
	});
	const routeId = createRes.body.data.route_id;

	const { statusCode } = await t.context.got.delete(`routes/${routeId}`, { throwHttpErrors: false });
	t.is(statusCode, 204);
});

test('DELETE /routes/:id returns 404 for non-existent route', async (t) => {
	const { body, statusCode } = await t.context.got.delete('routes/999', { throwHttpErrors: false });
	t.is(statusCode, 404);
	t.false(body.success);
	t.is(body.message, 'Route not found');
});

test('DELETE /routes/:id with invalid ID format returns 404', async (t) => {
	const { body, statusCode } = await t.context.got.delete('routes/abc', { throwHttpErrors: false });
	t.is(statusCode, 404);
	t.false(body.success);
	t.is(body.message, 'Route not found');
});
