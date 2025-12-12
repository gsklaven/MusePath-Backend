import test from "ava";
import {
	sendSuccess,
	sendError,
	sendNotFound,
	sendNoContent,
	sendCreated,
	sendValidationError,
} from "../utils/responses.js";

/**
 * Response Utility Tests
 * Tests for response helper functions
 */

// Mock response object
const createMockRes = () => {
	let statusCode = null;
	let jsonData = null;
	let sent = false;
	
	return {
		status(code) {
			statusCode = code;
			return this;
		},
		json(data) {
			jsonData = data;
			return this;
		},
		send(data) {
			sent = true;
			return this;
		},
		getStatusCode() {
			return statusCode;
		},
		getJsonData() {
			return jsonData;
		},
		wasSent() {
			return sent;
		}
	};
};

// ============================================================================
// sendSuccess Tests
// ============================================================================

test("sendSuccess - should send 200 with data and message", (t) => {
	const res = createMockRes();
	const data = { id: 1, name: "Test" };
	const message = "Success message";
	
	sendSuccess(res, data, message);
	
	t.is(res.getStatusCode(), 200);
	const json = res.getJsonData();
	t.true(json.success);
	t.deepEqual(json.data, data);
	t.is(json.message, message);
});

test("sendSuccess - should handle null data", (t) => {
	const res = createMockRes();
	
	sendSuccess(res, null, "Success with null data");
	
	t.is(res.getStatusCode(), 200);
	const json = res.getJsonData();
	t.true(json.success);
	t.is(json.data, null);
});

test("sendSuccess - should use custom status code", (t) => {
	const res = createMockRes();
	
	sendSuccess(res, { test: true }, "Custom status", 201);
	
	t.is(res.getStatusCode(), 201);
});

// ============================================================================
// sendError Tests
// ============================================================================

test("sendError - should send error with default 500 status", (t) => {
	const res = createMockRes();
	
	sendError(res, "Error message");
	
	t.is(res.getStatusCode(), 500);
	const json = res.getJsonData();
	t.false(json.success);
	t.is(json.data, null);
	t.is(json.message, "Error message");
});

test("sendError - should use custom error status code", (t) => {
	const res = createMockRes();
	
	sendError(res, "Bad request", 400);
	
	t.is(res.getStatusCode(), 400);
	const json = res.getJsonData();
	t.false(json.success);
	t.is(json.message, "Bad request");
});

test("sendError - should include error details if provided", (t) => {
	const res = createMockRes();
	const errorDetails = { field: "username", reason: "already exists" };
	
	sendError(res, "Validation error", 400, errorDetails);
	
	const json = res.getJsonData();
	t.false(json.success);
	t.deepEqual(json.error, errorDetails);
});

// ============================================================================
// sendNotFound Tests
// ============================================================================

test("sendNotFound - should send 404 with message", (t) => {
	const res = createMockRes();
	
	sendNotFound(res, "Resource not found");
	
	t.is(res.getStatusCode(), 404);
	const json = res.getJsonData();
	t.false(json.success);
	t.is(json.data, null);
	t.is(json.message, "Resource not found");
});

test("sendNotFound - should use default message if none provided", (t) => {
	const res = createMockRes();
	
	sendNotFound(res);
	
	t.is(res.getStatusCode(), 404);
	const json = res.getJsonData();
	t.false(json.success);
	t.true(typeof json.message === "string");
	t.true(json.message.length > 0);
});

// ============================================================================
// sendNoContent Tests
// ============================================================================

test("sendNoContent - should send 204", (t) => {
	let statusValue = 0;
	let sendCalled = false;
	
	const mockRes = {
		status(code) {
			statusValue = code;
			return this;
		},
		send() {
			sendCalled = true;
			return this;
		}
	};
	
	sendNoContent(mockRes);
	
	t.is(statusValue, 204);
	t.true(sendCalled);
});

// ============================================================================
// sendCreated Tests
// ============================================================================

test("sendCreated - should send 201 with data", (t) => {
	const res = createMockRes();
	const data = { id: 5, name: "New Item" };
	
	sendCreated(res, data, "Created successfully");
	
	t.is(res.getStatusCode(), 201);
	const json = res.getJsonData();
	t.true(json.success);
	t.deepEqual(json.data, data);
	t.is(json.message, "Created successfully");
});

test("sendCreated - should use default message", (t) => {
	const res = createMockRes();
	
	sendCreated(res, { id: 1 });
	
	t.is(res.getStatusCode(), 201);
	const json = res.getJsonData();
	t.true(json.success);
	t.true(typeof json.message === "string");
});

// ============================================================================
// sendValidationError Tests
// ============================================================================

test("sendValidationError - should send 400", (t) => {
	const res = createMockRes();
	
	sendValidationError(res, "Validation failed");
	
	t.is(res.getStatusCode(), 400);
	const json = res.getJsonData();
	t.false(json.success);
	t.is(json.data, null);
	t.is(json.message, "Validation failed");
});

test("sendValidationError - should use default message", (t) => {
	const res = createMockRes();
	
	sendValidationError(res);
	
	t.is(res.getStatusCode(), 400);
	const json = res.getJsonData();
	t.false(json.success);
	t.true(typeof json.message === "string");
});
