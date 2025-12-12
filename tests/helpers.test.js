import test from "ava";
import {
	calculateDistance,
	calculateEstimatedTime,
	calculateArrivalTime,
	generatePath,
	generateInstructions,
	calculateAverageRating,
	formatDistance,
	formatDuration,
	generateUniqueId,
	isRouteDeviated,
} from "../utils/helpers.js";

/**
 * Helper Functions Tests
 * Tests for utility helper functions
 */

// ============================================================================
// calculateDistance Tests
// ============================================================================

test("calculateDistance - should calculate distance between two points", (t) => {
	// New York to Los Angeles (approx 3936 km = 3,936,000 meters)
	const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
	
	t.true(distance > 3900000);
	t.true(distance < 4000000);
});

test("calculateDistance - should return 0 for same point", (t) => {
	const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
	
	t.is(distance, 0);
});

test("calculateDistance - should handle negative coordinates", (t) => {
	const distance = calculateDistance(-33.8688, 151.2093, 51.5074, -0.1278);
	
	t.true(distance > 17000); // Sydney to London
});

// ============================================================================
// calculateEstimatedTime Tests
// ============================================================================

test("calculateEstimatedTime - should calculate time with default speed", (t) => {
	const time = calculateEstimatedTime(5); // 5 km
	
	t.true(typeof time === "number");
	t.true(time > 0);
});

test("calculateEstimatedTime - should calculate time with custom speed", (t) => {
	const time1 = calculateEstimatedTime(10, 5); // 10km at 5 km/h
	const time2 = calculateEstimatedTime(10, 10); // 10km at 10 km/h
	
	t.true(time1 > time2); // Slower speed = more time
});

test("calculateEstimatedTime - should handle zero distance", (t) => {
	const time = calculateEstimatedTime(0);
	
	t.is(time, 0);
});

// ============================================================================
// calculateArrivalTime Tests
// ============================================================================

test("calculateArrivalTime - should return time string", (t) => {
	const arrival = calculateArrivalTime(3600); // 1 hour
	
	t.is(typeof arrival, "string");
	t.true(arrival.includes(":"));
});

test("calculateArrivalTime - should return valid time format", (t) => {
	const arrival = calculateArrivalTime(60); // 1 minute
	
	// Should return time string in format like "02:30 PM"
	t.is(typeof arrival, "string");
	t.true(/\d{1,2}:\d{2}\s[AP]M/i.test(arrival));
});

// ============================================================================
// generatePath Tests
// ============================================================================

test("generatePath - should generate path array", (t) => {
	const path = generatePath(
		{ lat: 40.7128, lng: -74.0060 },
		{ lat: 40.7580, lng: -73.9855 }
	);
	
	t.true(Array.isArray(path));
	t.true(path.length >= 2); // At least start and end
});

test("generatePath - should include start and end points", (t) => {
	const start = { lat: 40.7128, lng: -74.0060 };
	const end = { lat: 40.7580, lng: -73.9855 };
	const path = generatePath(start, end);
	
	t.deepEqual(path[0], start);
	t.deepEqual(path[path.length - 1], end);
});

// ============================================================================
// generateInstructions Tests
// ============================================================================

test("generateInstructions - should generate instructions", (t) => {
	const instructions = generateInstructions(1.5);
	
	t.true(Array.isArray(instructions));
	t.true(instructions.length > 0);
	instructions.forEach(instr => {
		t.true(typeof instr === "string");
	});
});

test("generateInstructions - should handle zero distance", (t) => {
	const instructions = generateInstructions(0);
	
	t.true(Array.isArray(instructions));
});

// ============================================================================
// calculateAverageRating Tests
// ============================================================================

test("calculateAverageRating - should calculate average", (t) => {
	const ratings = new Map();
	ratings.set(1, 5);
	ratings.set(2, 4);
	ratings.set(3, 3);
	ratings.set(4, 4);
	ratings.set(5, 5);
	const avg = calculateAverageRating(ratings);
	
	t.is(avg, 4.2);
});

test("calculateAverageRating - should handle empty Map", (t) => {
	const avg = calculateAverageRating(new Map());
	
	t.is(avg, 0);
});

test("calculateAverageRating - should handle single rating", (t) => {
	const ratings = new Map();
	ratings.set(1, 5);
	const avg = calculateAverageRating(ratings);
	
	t.is(avg, 5);
});

// ============================================================================
// formatDistance Tests
// ============================================================================

test("formatDistance - should format meters", (t) => {
	const formatted = formatDistance(500);
	
	t.true(typeof formatted === "string");
	t.true(formatted.includes("m") || formatted.includes("meter"));
});

test("formatDistance - should format kilometers", (t) => {
	const formatted = formatDistance(2500);
	
	t.true(typeof formatted === "string");
	t.true(formatted.includes("km") || formatted.includes("kilometer"));
});

test("formatDistance - should handle zero", (t) => {
	const formatted = formatDistance(0);
	
	t.true(typeof formatted === "string");
});

// ============================================================================
// formatDuration Tests
// ============================================================================

test("formatDuration - should format seconds", (t) => {
	const formatted = formatDuration(45);
	
	t.true(typeof formatted === "string");
});

test("formatDuration - should format minutes", (t) => {
	const formatted = formatDuration(180); // 3 minutes
	
	t.true(typeof formatted === "string");
	t.true(formatted.includes("min") || formatted.includes("3"));
});

test("formatDuration - should format hours", (t) => {
	const formatted = formatDuration(7200); // 2 hours
	
	t.true(typeof formatted === "string");
	t.true(formatted.includes("hour") || formatted.includes("h") || formatted.includes("2"));
});

// ============================================================================
// generateUniqueId Tests
// ============================================================================

test("generateUniqueId - should generate unique ID", (t) => {
	const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
	const newId = generateUniqueId(items);
	
	t.true(typeof newId === "number");
	t.true(newId > 3);
});

test("generateUniqueId - should handle empty array", (t) => {
	const newId = generateUniqueId([]);
	
	t.is(newId, 1);
});

test("generateUniqueId - should use custom ID field", (t) => {
	const items = [{ userId: 10 }, { userId: 20 }];
	const newId = generateUniqueId(items, "userId");
	
	t.true(newId > 20);
});

// ============================================================================
// isRouteDeviated Tests
// ============================================================================

test("isRouteDeviated - should detect when on route", (t) => {
	const currentPos = { lat: 40.7128, lng: -74.0060 };
	const routePath = [
		{ lat: 40.7128, lng: -74.0060 },
		{ lat: 40.7130, lng: -74.0062 }
	];
	
	const deviated = isRouteDeviated(currentPos, routePath, 100);
	
	t.false(deviated);
});

test("isRouteDeviated - should detect when off route", (t) => {
	const currentPos = { lat: 41.0, lng: -75.0 };
	const routePath = [
		{ lat: 40.7128, lng: -74.0060 },
		{ lat: 40.7130, lng: -74.0062 }
	];
	
	const deviated = isRouteDeviated(currentPos, routePath, 50);
	
	t.true(deviated);
});

test("isRouteDeviated - should return false for empty route", (t) => {
	const currentPos = { lat: 40.7128, lng: -74.0060 };
	const deviated = isRouteDeviated(currentPos, []);
	
	t.false(deviated);
});

test("isRouteDeviated - should use default threshold", (t) => {
	const currentPos = { lat: 40.7128, lng: -74.0060 };
	const routePath = [{ lat: 40.7128, lng: -74.0060 }];
	
	const deviated = isRouteDeviated(currentPos, routePath);
	
	t.false(deviated);
});
