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

test('GET /exhibits/search with valid keyword returns results', async (t) => {
    const { body, statusCode } = await t.context.got('exhibits/search', {
        searchParams: { exhibit_term: 'art' },
        throwHttpErrors: false
    });
    t.is(statusCode, 200);
    t.true(body.success);
    t.true(Array.isArray(body.data));
    t.true(body.data.length >= 0);
    t.is(body.message, 'Exhibits retrieved successfully');
});

test('GET /exhibits/search with no parameters returns all or empty', async (t) => {
    const { body, statusCode } = await t.context.got('exhibits/search', {
        throwHttpErrors: false
    });
    t.is(statusCode, 400);
    t.false(body.success);
    t.is(body.message, 'Search term is required');
});

test('GET /exhibits/search with invalid parameters handles gracefully', async (t) => {
    const { body, statusCode } = await t.context.got('exhibits/search', {
        searchParams: { unknown: 'value' },
        throwHttpErrors: false
    });
    t.is(statusCode, 400);
    t.false(body.success);
    t.is(body.message, 'Search term is required');
});

test('GET /exhibits/1 returns exhibit details', async (t) => {
    const { body, statusCode } = await t.context.got('exhibits/1', { throwHttpErrors: false });
    t.is(statusCode, 200);
    t.true(body.success);
    t.truthy(body.data);
    t.is(body.data.exhibit_id, 1);
    t.is(body.message, 'Exhibit information retrieved successfully');
});

test('GET /exhibits/1 response structure', async (t) => {
    const { body, statusCode } = await t.context.got('exhibits/1', { throwHttpErrors: false });
    t.is(statusCode, 200);
    t.true(body.success);
    t.truthy(body.data);
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'exhibit_id'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'title'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'name'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'rating'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'location'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'features'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'status'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'description'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'audioGuideUrl'));
});

test('GET /exhibits/999 returns 404 for non-existent exhibit', async (t) => {
    const { body, statusCode } = await t.context.got('exhibits/999', { throwHttpErrors: false });
    t.is(statusCode, 404);
    t.false(body.success);
    t.is(body.message, 'Exhibit not found');
});

test('GET /exhibits/abc returns 404 for invalid exhibit ID format', async (t) => {
    const { statusCode } = await t.context.got('exhibits/abc', { throwHttpErrors: false });
    t.is(statusCode, 404);
});

test('GET /exhibits/1/audio returns audio guide info', async (t) => {
    const { body, statusCode } = await t.context.got('exhibits/1/audio', { throwHttpErrors: false });
    t.is(statusCode, 200);
    t.true(body.success);
    t.truthy(body.data);
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'audioUrl'));
    t.is(body.message, 'Audio guide retrieved successfully');
});

test('GET /exhibits/999/audio returns 404 for non-existent exhibit', async (t) => {
    const { body, statusCode } = await t.context.got('exhibits/999/audio', { throwHttpErrors: false });
    t.is(statusCode, 404);
    t.false(body.success);
    t.is(body.message, 'Exhibit not found');
});

test('GET /exhibits/abc/audio returns 404 for invalid exhibit ID format', async (t) => {
    const { statusCode } = await t.context.got('exhibits/abc/audio', { throwHttpErrors: false });
    t.is(statusCode, 404);
});

test('POST /exhibits/1/ratings with valid rating', async (t) => {
    const { statusCode } = await t.context.got.post('exhibits/1/ratings', {
        json: { rating: 5 },
        throwHttpErrors: false
    });
    t.is(statusCode, 204);
});

test('POST /exhibits/1/ratings with missing rating returns 400', async (t) => {
    const { body, statusCode } = await t.context.got.post('exhibits/1/ratings', {
        json: {},
        throwHttpErrors: false
    });
    t.is(statusCode, 400);
    t.false(body.success);
    t.is(body.message, 'Invalid rating. Rating must be a number between 0 and 5');
});

test('POST /exhibits/1/ratings with invalid rating returns 400', async (t) => {
    const { body, statusCode } = await t.context.got.post('exhibits/1/ratings', {
        json: { rating: 10 },
        throwHttpErrors: false
    });
    t.is(statusCode, 400);
    t.false(body.success);
    t.is(body.message, 'Invalid rating. Rating must be a number between 0 and 5');
});

test('POST /exhibits/999/ratings for non-existent exhibit returns 404', async (t) => {
    const { body, statusCode } = await t.context.got.post('exhibits/999/ratings', {
        json: { rating: 5 },
        throwHttpErrors: false
    });
    t.is(statusCode, 404);
    t.false(body.success);
    t.is(body.message, 'Exhibit not found');
});

test('GET /downloads/exhibits/1 returns download info', async (t) => {
    const { body, statusCode } = await t.context.got('downloads/exhibits/1', { throwHttpErrors: false });
    t.is(statusCode, 200);
    t.true(body.success);
    t.truthy(body.data);
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'downloadUrl'));
    t.assert(Object.prototype.hasOwnProperty.call(body.data, 'exhibit_id'));
    t.is(body.message, 'Exhibit download link generated');
});

test('GET /downloads/exhibits/999 returns 404 for non-existent exhibit', async (t) => {
    const { body, statusCode } = await t.context.got('downloads/exhibits/999', { throwHttpErrors: false });
    t.is(statusCode, 404);
    t.false(body.success);
    t.is(body.message, 'Exhibit not found');
});

test('GET /downloads/exhibits/abc returns 404 for invalid exhibit ID format', async (t) => {
    const { statusCode } = await t.context.got('downloads/exhibits/abc', { throwHttpErrors: false });
    t.is(statusCode, 404);
});