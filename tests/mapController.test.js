
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

test('GET /maps/1 returns map details', async (t) => {
	const { body, statusCode } = await t.context.got('maps/1', { throwHttpErrors: false });
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.data.map_id, 1);
	t.is(body.message, 'Map details retrieved successfully');
});

test('GET /maps/1 response structure', async (t) => {
	const { body, statusCode } = await t.context.got('maps/1', { throwHttpErrors: false });
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'map_id'));
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'title'));
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'map_url'));
});

test('GET /maps/1 with zoom and rotation returns those fields', async (t) => {
	const { body, statusCode } = await t.context.got('maps/1', {
		searchParams: { zoom: 2, rotation: 90 },
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.data.zoom, 2);
	t.is(body.data.rotation, 90);
});

test('GET /maps/1 with mode=offline returns offline_available', async (t) => {
	const { body, statusCode } = await t.context.got('maps/1', {
		searchParams: { mode: 'offline' },
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'offline_available'));
});

test('GET /maps/999 returns 404 for non-existent map', async (t) => {
	const { body, statusCode } = await t.context.got('maps/999', { throwHttpErrors: false });
	t.is(statusCode, 404);
	t.false(body.success);
	t.is(body.message, 'Map not found');
});

test('GET /maps/abc returns 404 for invalid map ID format', async (t) => {
	const { statusCode } = await t.context.got('maps/abc', { throwHttpErrors: false });
	t.is(statusCode, 404);
});


test('POST /maps uploads a map ', async (t) => {
	const payload = {
		mapData: 'base64-encoded-map-data',
		format: 'png'
	};
	const { body, statusCode } = await t.context.got.post('maps', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.assert(Object.prototype.hasOwnProperty.call(body.data, 'map_id'));
	t.is(body.message, 'Map uploaded successfully');
});

test('POST /maps missing mapData returns 400', async (t) => {
	const payload = {
		format: 'png'
	};
	const { body, statusCode } = await t.context.got.post('maps', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
	t.false(body.success);
	t.regex(body.message, /missing required fields/i);
});

test('POST /maps missing format returns 400', async (t) => {
	const payload = {
		mapData: 'base64-encoded-map-data'
	};
	const { body, statusCode } = await t.context.got.post('maps', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
	t.false(body.success);
	t.regex(body.message, /missing required fields/i);
});

test('POST /maps with empty body returns 400', async (t) => {
	const { body, statusCode } = await t.context.got.post('maps', {
		json: {},
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
	t.false(body.success);
	t.regex(body.message, /missing required fields/i);
});

test('POST /maps with very large payload returns 200', async (t) => {
	const largeData = 'a'.repeat(1024 * 1024 * 2); // 2MB string
	const payload = { mapData: largeData, format: 'png' };
	const { statusCode } = await t.context.got.post('maps', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
});

test('POST /maps with very large payload returns 413', async (t) => {
	const largeData = 'a'.repeat(1024 * 1024 * 20); // 20MB string
	const payload = { mapData: largeData, format: 'png' };
	const { statusCode } = await t.context.got.post('maps', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 413);
});

test('POST /maps with malformed payload returns 400', async (t) => {
	const payload = { mapData: 12345, format: null };
	const { body, statusCode } = await t.context.got.post('maps', {
		json: payload,
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
	t.false(body.success);
});

test('POST /maps duplicate upload returns 200 and new map_id for each upload', async (t) => {
	const payload = { mapData: 'duplicate-map-data', format: 'png' };
	const first = await t.context.got.post('maps', { json: payload, throwHttpErrors: false });
	const second = await t.context.got.post('maps', { json: payload, throwHttpErrors: false });
	t.is(first.statusCode, 200);
	t.is(second.statusCode, 200);
	t.not(first.body.data.map_id, undefined);
	t.not(second.body.data.map_id, undefined);
	t.not(first.body.data.map_id, second.body.data.map_id);
});

test('POST /maps with wrong content-type returns 400', async (t) => {
	const payload = JSON.stringify({ mapData: 'abc', format: 'png' });
	const { statusCode } = await t.context.got.post('maps', {
		body: payload,
		headers: { 'Content-Type': 'text/plain' },
		throwHttpErrors: false
	});
 	t.is(statusCode, 400);
});

test('GET /downloads/maps/1 returns download link for valid map', async (t) => {
	const { body, statusCode } = await t.context.got('downloads/maps/1', { throwHttpErrors: false });
	t.is(statusCode, 200);
	t.true(body.success);
	t.truthy(body.data);
	t.is(body.data.map_id, 1);
	t.is(body.data.downloadUrl, '/downloads/maps/1.png');
	t.is(body.message, 'Map download link generated');
});

test('GET /downloads/maps/999 returns 404 for non-existent map', async (t) => {
	const { body, statusCode } = await t.context.got('downloads/maps/999', { throwHttpErrors: false });
	t.is(statusCode, 404);
	t.false(body.success);
	t.is(body.message, 'Map not found');
});

test('GET /downloads/maps/abc returns 404 for invalid map ID', async (t) => {
	const { body, statusCode } = await t.context.got('downloads/maps/abc', { throwHttpErrors: false });
	t.is(statusCode, 404);
	t.false(body.success);
	t.is(body.message, 'Map not found');
});
