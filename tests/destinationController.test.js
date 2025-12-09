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

test('GET /destinations returns all destinations', async (t) => {
    const { body, statusCode } = await t.context.got('destinations', { throwHttpErrors: false });
    t.is(statusCode, 200);
    t.true(body.success);
    t.true(Array.isArray(body.data));
    t.true(body.data.length > 0);
    t.is(body.message, 'Destinations retrieved successfully');
});

test('GET /destinations/1 returns correct destination', async (t) => {
    const { body, statusCode } = await t.context.got('destinations/1', { throwHttpErrors: false });
    t.is(statusCode, 200);
    t.true(body.success);
    t.truthy(body.data);
    t.is(body.data.destination_id, 1);
    t.is(body.message, 'Destination data retrieved successfully');
});

test('GET /destinations/1 response structure', async (t) => {
    const { body, statusCode } = await t.context.got('destinations/1', { throwHttpErrors: false });
    console.log('Destination response:', body.data);
    t.is(statusCode, 200);
    t.true(body.success);
    t.truthy(body.data);
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'destination_id'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'name'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'type'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'coordinates'));
    // The following fields are only present if options.includeStatus or options.includeAlternatives are set in the service
    if (body.data.status !== undefined) {
        t.assert(Object.prototype.hasOwnProperty.call(body.data, 'status'));
        t.assert(Object.prototype.hasOwnProperty.call(body.data, 'crowdLevel'));
        t.assert(Object.prototype.hasOwnProperty.call(body.data, 'lastUpdated'));
    }
    if (body.data.alternatives !== undefined) {
        t.assert(Object.prototype.hasOwnProperty.call(body.data, 'alternatives'));
        t.assert(Object.prototype.hasOwnProperty.call(body.data, 'suggestedTimes'));
    }
});

test('GET /destinations/999 returns 404 for non-existent destination', async (t) => {
    const { body, statusCode } = await t.context.got('destinations/999', { throwHttpErrors: false });
    t.is(statusCode, 404);
    t.false(body.success);
    t.is(body.message, 'Destination not found');
});

test('GET /destinations/abc returns 404 for invalid syntax of ID', async (t) => {
    const { statusCode } = await t.context.got('destinations/abc', { throwHttpErrors: false });
    t.true(statusCode === 404);
});

test('POST /destinations uploads a new destination', async (t) => {
    const newDestination = {
        name: 'Test Destination',
        type: 'museum',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        status: 'available',
        crowdLevel: 'low',
        lastUpdated: new Date().toISOString(),
        alternatives: [],
        suggestedTimes: [],
    };
    // Assuming mapId is required in the payload or as a query param
    const { body, statusCode } = await t.context.got.post('destinations', {
        json: {
            map_id: 1,
            destinations: [newDestination]
        },
        throwHttpErrors: false
    });
    t.is(statusCode, 201);
    t.true(body.success);
    t.truthy(body.data);
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'destinationsId'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'destinationData'));
    t.is(body.message, 'Destinations uploaded successfully');
});

test('POST /destinations missing map_id returns 400', async (t) => {
    const { body, statusCode } = await t.context.got.post('destinations', {
        json: {
            destinations: [{ name: 'Test', type: 'museum', coordinates: { lat: 0, lng: 0 } }]
        },
        throwHttpErrors: false
    });
    t.is(statusCode, 400);
    t.false(body.success);
    t.is(body.message, 'Missing required fields: map_id');
});

test('POST /destinations with destinations not array returns 400', async (t) => {
    const { body, statusCode } = await t.context.got.post('destinations', {
        json: {
            map_id: 1,
            destinations: {}
        },
        throwHttpErrors: false
    });
    t.is(statusCode, 400);
    t.false(body.success);
    t.is(body.message, 'Destinations must be an array');
});
