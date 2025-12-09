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

test('GET /coordinates/1 returns user coordinates', async (t) => {
    const { body, statusCode } = await t.context.got('coordinates/1', { throwHttpErrors: false });
    t.is(statusCode, 200);
    t.true(body.success);
    t.truthy(body.data);
    t.is(body.data.userId, 1);
    t.is(body.message, 'Current location retrieved successfully');
});

test('GET /coordinates/1 response structure', async (t) => {
    const { body, statusCode } = await t.context.got('coordinates/1', { throwHttpErrors: false });
    t.is(statusCode, 200);
    t.true(body.success);
    t.truthy(body.data);
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'userId'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'lat'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'lng'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'updatedAt'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'timestamp'));
});

test('GET /coordinates/999 returns 404 for non-existent user coordinates', async (t) => {
    const { body, statusCode } = await t.context.got('coordinates/999', { throwHttpErrors: false });
    t.is(statusCode, 404);
    t.false(body.success);
    t.is(body.message, 'User coordinates not found');
});

test('GET /coordinates/ (missing user ID) returns 404', async (t) => {
    const { statusCode } = await t.context.got('coordinates/', { throwHttpErrors: false });
    t.is(statusCode, 404);
});

test('GET /coordinates/abc returns 404 for invalid format of ID', async (t) => {
    const { statusCode } = await t.context.got('coordinates/abc', { throwHttpErrors: false });
    t.true(statusCode === 404);
});

test('PUT /coordinates/1 with valid data, updates user coordinates', async (t) => {
    const { statusCode } = await t.context.got.put('coordinates/1', {
        json: { lat: 40.7620, lng: -73.9785 },
        throwHttpErrors: false
    });
    t.is(statusCode, 200);
});

test('PUT /coordinates/1 with invalid data (outside of the boundaries), returns 400', async (t) => {
    const { body, statusCode } = await t.context.got.put('coordinates/1', {
        json: { lat: -95, lng: 200 },
        throwHttpErrors: false
    });
    t.is(statusCode, 400);
    t.false(body.success);
    t.is(body.message, 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180');
});

test('PUT /coordinates/1 with invalid data, returns 400', async (t) => {
    const { body, statusCode } = await t.context.got.put('coordinates/1', {
        json: { lat: 'invalid', lng: null },
        throwHttpErrors: false
    });
    t.is(statusCode, 400);
    t.false(body.success);
    t.is(body.message, 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180');
});

test('PUT /coordinates/ (missing user ID) returns 404', async (t) => {
    const { statusCode } = await t.context.got.put('coordinates/', {
        json: { lat: 40.7620, lng: -73.9785 },
        throwHttpErrors: false
    });
    t.true(statusCode === 404);
});