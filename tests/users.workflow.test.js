import test from "ava";
import {
	setupTestServer,
	cleanupTestServer,
	registerAndLogin,
	generateUsername,
	generateEmail,
} from "./helpers.js";

test.before(setupTestServer);
test.after.always(cleanupTestServer);

// ============================================================================
// User Workflows
// ============================================================================

test.serial("User workflow - set preferences, add favourites, get personalized route", async (t) => {
	// Add delay to prevent timestamp collision
	await new Promise(resolve => setTimeout(resolve, 5));
	const username = generateUsername();
	const email = generateEmail();
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		email,
		"Password123!"
	);
	
	// 1. Set preferences
	const prefResponse = await client.put(`v1/users/${userId}/preferences`, {
		json: { interests: ["modern art", "sculpture"] }
	});
	t.is(prefResponse.statusCode, 204);
	
	// 2. Add multiple favourites
	const fav1 = await client.post(`v1/users/${userId}/favourites`, {
		json: { exhibit_id: 1 }
	});
	t.is(fav1.statusCode, 204);
	
	const fav2 = await client.post(`v1/users/${userId}/favourites`, {
		json: { exhibit_id: 2 }
	});
	t.is(fav2.statusCode, 204);
	
	// 3. Get personalized route
	const routeResponse = await client.get(`v1/users/${userId}/routes`);
	t.is(routeResponse.statusCode, 200);
	t.true(routeResponse.body.success);
	t.truthy(routeResponse.body.data.route_id);
	
	// 4. Remove a favourite
	const removeResponse = await client.delete(`v1/users/${userId}/favourites/1`);
	t.is(removeResponse.statusCode, 204);
	
	// 5. Update preferences
	const updatePrefResponse = await client.put(`v1/users/${userId}/preferences`, {
		json: { interests: ["ancient greece", "pottery"] }
	});
	t.is(updatePrefResponse.statusCode, 204);
	
	// 6. Get new personalized route with updated preferences
	const newRouteResponse = await client.get(`v1/users/${userId}/routes`);
	t.is(newRouteResponse.statusCode, 200);
	t.true(newRouteResponse.body.success);
});

test.serial("User workflow - manage favourites list", async (t) => {
	// Add delay to prevent timestamp collision
	await new Promise(resolve => setTimeout(resolve, 5));
	const username = generateUsername();
	const email = generateEmail();
	const { userId, client } = await registerAndLogin(
		t.context.baseUrl,
		username,
		email,
		"Password123!"
	);
	
	// Add multiple favourites
	await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 1 } });
	await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 2 } });
	await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 3 } });
	await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 4 } });
	
	// Remove some favourites
	const remove1 = await client.delete(`v1/users/${userId}/favourites/2`);
	t.is(remove1.statusCode, 204);
	
	const remove2 = await client.delete(`v1/users/${userId}/favourites/3`);
	t.is(remove2.statusCode, 204);
	
	// Add them back
	const add1 = await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 2 } });
	t.is(add1.statusCode, 204);
	
	const add2 = await client.post(`v1/users/${userId}/favourites`, { json: { exhibit_id: 3 } });
	t.is(add2.statusCode, 204);
});
