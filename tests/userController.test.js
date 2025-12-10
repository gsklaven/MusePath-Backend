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
        responseType: 'text',
      });
      t.context.got = gotInstance;
      resolve();
    });
  });
});

test.after.always(() => {
  server && server.close();
});

test('PUT /users/:user_id/preferences with valid user and updated preferences returns 204', async t => {
  const userId = 1;
  const preferences = { interests: ['modern art', 'sculpture'] };
  const { body, statusCode } = await t.context.got.put(`users/${userId}/preferences`, {
    json: preferences,
    throwHttpErrors: false
  });
  t.is(statusCode, 204);
  t.is(body, '');
});

test('PUT /users/:user_id/preferences with non-existent user returns 404', async t => {
  const userId = 999;
  const preferences = { interests: ['modern art'] };
  const { body, statusCode } = await t.context.got.put(`users/${userId}/preferences`, {
    json: preferences,
    throwHttpErrors: false
  });
  t.is(statusCode, 404);
  const parsed = JSON.parse(body);
  t.false(parsed.success);
  t.is(parsed.message, 'User not found');
  t.truthy(parsed.error);
});

test('PUT /users/:user_id/preferences with invalid interests type returns 400', async t => {
  const userId = 1;
  const preferences = { interests: 'not-an-array' }; 
  const { body, statusCode } = await t.context.got.put(`users/${userId}/preferences`, {
    json: preferences,
    throwHttpErrors: false
  });
  t.is(statusCode, 400);
  const parsed = JSON.parse(body);
  t.false(parsed.success);
  t.truthy(parsed.message);
  t.truthy(parsed.error);
});

test('POST /users/:user_id/favourites with valid user and exhibit adds to favourites and returns 204', async t => {
  const userId = 1;
  const exhibitId = 1;
  const { body, statusCode } = await t.context.got.post(`users/${userId}/favourites`, {
    json: { exhibit_id: exhibitId },
    throwHttpErrors: false
  });
  t.is(statusCode, 204);
  t.is(body, '');
});

test('POST /users/:user_id/favourites with non-existent user returns 404', async t => {
  const userId = 999;
  const exhibitId = 1;
  const { body, statusCode } = await t.context.got.post(`users/${userId}/favourites`, {
    json: { exhibit_id: exhibitId },
    throwHttpErrors: false
  });
  t.is(statusCode, 404);
  const parsed = JSON.parse(body);
  t.false(parsed.success);
  t.is(parsed.message, 'User not found');
  t.truthy(parsed.error);
});

test('POST /users/:user_id/favourites with missing exhibit_id returns 400', async t => {
  const userId = 1;
  const { body, statusCode } = await t.context.got.post(`users/${userId}/favourites`, {
    json: {},
    throwHttpErrors: false
  });
  t.is(statusCode, 400); 
  const parsed = JSON.parse(body);
  t.false(parsed.success);
  t.truthy(parsed.message);
  t.truthy(parsed.error);
});

test('DELETE /users/:user_id/favourites/:exhibit_id with valid user and exhibit removes favourite and returns 204', async t => {
  const userId = 1;
  const exhibitId = 1;
  
  // Ensuring that the favourite exhibit exists before deleting
  await t.context.got.post(`users/${userId}/favourites`, {
    json: { exhibit_id: exhibitId },
    throwHttpErrors: false
  });
  const { body, statusCode } = await t.context.got.delete(`users/${userId}/favourites/${exhibitId}`, {
    throwHttpErrors: false
  });
  t.is(statusCode, 204);
  t.is(body, '');
});

test('DELETE /users/:user_id/favourites/:exhibit_id with non-existent user and exhibit returns 404', async t => {
  const userId = 999;
  const exhibitId = 999;
  const { body, statusCode } = await t.context.got.delete(`users/${userId}/favourites/${exhibitId}`, {
    throwHttpErrors: false
  });
  t.is(statusCode, 404);
  const parsed = JSON.parse(body);
  t.false(parsed.success);
  t.is(parsed.message, 'User or exhibit not found in favourites');
  t.truthy(parsed.error);
});

test('GET /users/:user_id/routes with valid user returns personalized route and 200', async t => {
  const userId = 1;
  const { body, statusCode } = await t.context.got.get(`users/${userId}/routes`, {
    throwHttpErrors: false
  });
  t.is(statusCode, 200);
  const parsed = JSON.parse(body);
  t.true(parsed.success);
  t.truthy(parsed.data);
  t.is(parsed.message, 'Personalized route generated successfully');
});

test('GET /users/:user_id/routes with non-existent user returns 400', async t => {
  const userId = 999;
  const { body, statusCode } = await t.context.got.get(`users/${userId}/routes`, {
    throwHttpErrors: false
  });
  t.is(statusCode, 400);
  const parsed = JSON.parse(body);
  t.false(parsed.success);
  t.truthy(parsed.message);
  t.truthy(parsed.error);
});

test('GET /users/:user_id/routes with missing or invalid preferences returns 400', async t => {
  const userId = 3;
  const { body, statusCode } = await t.context.got.get(`users/${userId}/routes`, {
    throwHttpErrors: false
  });
  t.is(statusCode, 400);
  const parsed = JSON.parse(body);
  t.false(parsed.success);
  t.truthy(parsed.message);
  t.truthy(parsed.error);
});
