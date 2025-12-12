import test from "ava";
import {
	validateRequiredFields,
	validateCoordinates,
	validateRating,
	validateMode,
	validateUserId,
	validateExhibitId,
	validateDestinationId,
	validateRouteId,
	validateMapId,
	sanitizeSearchTerm,
} from "../utils/validators.js";

/**
 * Validators Utility Tests
 * Tests for validation utility functions
 */

// ============================================================================
// validateRequiredFields Tests
// ============================================================================

test("validateRequiredFields - should pass with all fields present", (t) => {
	const data = { name: "Test", email: "test@example.com", age: 25 };
	const required = ["name", "email", "age"];
	
	const result = validateRequiredFields(data, required);
	
	t.true(result.isValid);
	t.is(result.missingFields.length, 0);
});

test("validateRequiredFields - should fail with missing fields", (t) => {
	const data = { name: "Test" };
	const required = ["name", "email", "age"];
	
	const result = validateRequiredFields(data, required);
	
	t.false(result.isValid);
	t.is(result.missingFields.length, 2);
	t.deepEqual(result.missingFields, ["email", "age"]);
});

test("validateRequiredFields - should treat empty strings as missing", (t) => {
	const data = { name: "", email: "test@example.com" };
	const required = ["name", "email"];
	
	const result = validateRequiredFields(data, required);
	
	t.false(result.isValid);
	t.deepEqual(result.missingFields, ["name"]);
});

test("validateRequiredFields - should treat null as missing", (t) => {
	const data = { name: null, email: "test@example.com" };
	const required = ["name", "email"];
	
	const result = validateRequiredFields(data, required);
	
	t.false(result.isValid);
	t.deepEqual(result.missingFields, ["name"]);
});

// ============================================================================
// validateCoordinates Tests
// ============================================================================

test("validateCoordinates - should pass with valid coordinates", (t) => {
	t.true(validateCoordinates(40.7128, -74.0060)); // New York
	t.true(validateCoordinates(0, 0)); // Null Island
	t.true(validateCoordinates(90, 180)); // Max values
	t.true(validateCoordinates(-90, -180)); // Min values
});

test("validateCoordinates - should fail with invalid latitude", (t) => {
	t.false(validateCoordinates(91, 0)); // Too high
	t.false(validateCoordinates(-91, 0)); // Too low
	t.false(validateCoordinates("40.7128", -74.0060)); // String
});

test("validateCoordinates - should fail with invalid longitude", (t) => {
	t.false(validateCoordinates(40.7128, 181)); // Too high
	t.false(validateCoordinates(40.7128, -181)); // Too low
	t.false(validateCoordinates(40.7128, "invalid")); // String
});

// ============================================================================
// validateRating Tests
// ============================================================================

test("validateRating - should pass with valid ratings", (t) => {
	t.true(validateRating(1));
	t.true(validateRating(2));
	t.true(validateRating(3));
	t.true(validateRating(4));
	t.true(validateRating(5));
});

test("validateRating - should fail with invalid ratings", (t) => {
	t.false(validateRating(0)); // Too low
	t.false(validateRating(6)); // Too high
	t.false(validateRating(3.5)); // Decimal
	t.false(validateRating("3")); // String
	t.false(validateRating(null)); // Null
	t.false(validateRating(undefined)); // Undefined
});

// ============================================================================
// validateMode Tests
// ============================================================================

test("validateMode - should pass with valid modes", (t) => {
	t.true(validateMode("online"));
	t.true(validateMode("offline"));
});

test("validateMode - should fail with invalid modes", (t) => {
	t.false(validateMode("hybrid"));
	t.false(validateMode("ONLINE")); // Case sensitive
	t.false(validateMode(""));
	t.false(validateMode(null));
	t.false(validateMode(undefined));
});

// ============================================================================
// ID Validation Tests
// ============================================================================

test("validateUserId - should pass with valid user IDs", (t) => {
	t.true(validateUserId(1));
	t.true(validateUserId(999));
	t.true(validateUserId("123")); // String numbers allowed
});

test("validateUserId - should fail with invalid user IDs", (t) => {
	t.false(validateUserId(0));
	t.false(validateUserId(-1));
	t.false(validateUserId(3.5)); // Decimal
	t.false(validateUserId("abc")); // Non-numeric string
	t.false(validateUserId(null));
	t.false(validateUserId(undefined));
});

test("validateExhibitId - should pass with valid exhibit IDs", (t) => {
	t.true(validateExhibitId(1));
	t.true(validateExhibitId(999));
	t.true(validateExhibitId("456"));
});

test("validateExhibitId - should fail with invalid exhibit IDs", (t) => {
	t.false(validateExhibitId(0));
	t.false(validateExhibitId(-5));
	t.false(validateExhibitId(2.5));
});

test("validateDestinationId - should pass with valid destination IDs", (t) => {
	t.true(validateDestinationId(1));
	t.true(validateDestinationId("789"));
});

test("validateDestinationId - should fail with invalid destination IDs", (t) => {
	t.false(validateDestinationId(0));
	t.false(validateDestinationId(-10));
});

test("validateRouteId - should pass with valid route IDs", (t) => {
	t.true(validateRouteId(1));
	t.true(validateRouteId("321"));
});

test("validateRouteId - should fail with invalid route IDs", (t) => {
	t.false(validateRouteId(0));
	t.false(validateRouteId("invalid"));
});

test("validateMapId - should pass with valid map IDs", (t) => {
	t.true(validateMapId(1));
	t.true(validateMapId("654"));
});

test("validateMapId - should fail with invalid map IDs", (t) => {
	t.false(validateMapId(0));
	t.false(validateMapId(-1));
});

// ============================================================================
// sanitizeSearchTerm Tests
// ============================================================================

test("sanitizeSearchTerm - should trim and lowercase", (t) => {
	t.is(sanitizeSearchTerm("  HELLO World  "), "hello world");
	t.is(sanitizeSearchTerm("TeSt"), "test");
});

test("sanitizeSearchTerm - should handle empty strings", (t) => {
	t.is(sanitizeSearchTerm(""), "");
	t.is(sanitizeSearchTerm("   "), "");
});

test("sanitizeSearchTerm - should handle non-strings", (t) => {
	t.is(sanitizeSearchTerm(123), "");
	t.is(sanitizeSearchTerm(null), "");
	t.is(sanitizeSearchTerm(undefined), "");
});
