import { createClient } from './helpers.js';

/**
 * Assert that an auth endpoint fails with specific status and message
 */
export const assertAuthFail = async (t, endpoint, payload, expectedStatus, messageRegex) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client.post(endpoint, {
		json: payload
	});

	t.is(statusCode, expectedStatus);
	t.is(body.success, false);
	if (messageRegex) {
		t.regex(body.message, messageRegex);
	}
};

/**
 * Assert successful registration
 */
export const assertRegisterSuccess = async (t, user) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client.post("v1/auth/register", {
		json: user
	});

	t.is(statusCode, 201);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.username, user.username);
	t.is(body.data.email, user.email);
	return body;
};

/**
 * Assert successful login
 */
export const assertLoginSuccess = async (t, credentials) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode, headers } = await client.post("v1/auth/login", {
		json: credentials
	});

	t.is(statusCode, 200);
	t.is(body.success, true);
	t.truthy(body.data);
	t.is(body.data.username, credentials.username);
	
	t.truthy(headers["set-cookie"]);
	const cookieHeader = Array.isArray(headers["set-cookie"]) 
		? headers["set-cookie"][0] 
		: headers["set-cookie"];
	t.regex(cookieHeader, /token=/);
	return { body, client };
};

/**
 * Assert listing destinations
 */
export const assertListDestinations = async (t, params = {}) => {
	const client = createClient(t.context.baseUrl);
	const response = await client.get('v1/destinations', { searchParams: params });

	t.is(response.statusCode, 200);
	t.true(response.body.success);
	t.true(Array.isArray(response.body.data));
	return response;
};

/**
 * Assert getting a single destination
 */
export const assertGetDestination = async (t, id, params = {}, expectedStatus = 200) => {
	const client = createClient(t.context.baseUrl);
	const response = await client.get(`v1/destinations/${id}`, { searchParams: params });

	t.is(response.statusCode, expectedStatus);
	if (expectedStatus === 200) {
		t.true(response.body.success);
		t.is(response.body.data.destination_id, parseInt(id));
	}
	return response;
};

/**
 * Assert searching exhibits
 */
export const assertSearchExhibits = async (t, query, checkFn) => {
	const client = createClient(t.context.baseUrl);
	const url = query ? `v1/exhibits/search?${query}` : "v1/exhibits/search";
	const { body, statusCode } = await client(url);
	
	t.is(statusCode, 200);
	t.is(body.success, true);
	t.true(Array.isArray(body.data));
	
	if (checkFn) {
		checkFn(t, body.data);
	}
};

/**
 * Assert viewing an exhibit
 */
export const assertViewExhibit = async (t, id, expectedStatus = 200) => {
	const client = createClient(t.context.baseUrl);
	const { body, statusCode } = await client(`v1/exhibits/${id}`);
	
	t.is(statusCode, expectedStatus);
	if (expectedStatus === 200) {
		t.is(body.success, true);
		t.is(body.data.exhibitId, parseInt(id));
	}
	return body;
};