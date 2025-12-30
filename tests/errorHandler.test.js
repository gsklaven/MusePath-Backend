import test from "ava";
import express from "express";
import supertest from "supertest";
import { errorHandler } from "../middleware/errorHandler.js";

/**
 * Unit tests for the centralized error handler middleware.
 *
 * The suite covers common error shapes (generic Error, ValidationError,
 * CastError and duplicate key errors) and verifies status codes and
 * normalized response payloads consumed by clients.
 */

// Create a test app with a route that throws an error
const createTestApp = (errorToThrow) => {
  const app = express();
  app.get('/error', (req, res, next) => {
    next(errorToThrow);
  });
  app.use(errorHandler);
  return app;
};

// Test case: Verify that generic errors result in a 500 Internal Server Error
test("errorHandler returns 500 and error message for generic error", async (t) => {
  const error = new Error("Test error");
  const app = createTestApp(error);
  const response = await supertest(app).get("/error");
  t.is(response.status, 500);
  t.is(response.body.success, false);
  t.is(response.body.message, "Test error");
  t.truthy(response.body.error);
});

// Test case: Verify that Mongoose validation errors result in a 400 Bad Request
test("errorHandler returns 400 for ValidationError", async (t) => {
  const error = new Error("Validation failed");
  error.name = "ValidationError";
  error.errors = { field1: { message: "Field1 is invalid" }, field2: { message: "Field2 is invalid" } };
  const app = createTestApp(error);
  const response = await supertest(app).get("/error");
  t.is(response.status, 400);
  t.is(response.body.success, false);
  t.is(response.body.message, "Validation error");
  t.regex(response.body.error, /Field1 is invalid.*Field2 is invalid/);
});

// Test case: Verify that Mongoose cast errors (invalid IDs) result in a 400 Bad Request
test("errorHandler returns 400 for CastError", async (t) => {
  const error = new Error("Cast to ObjectId failed");
  error.name = "CastError";
  const app = createTestApp(error);
  const response = await supertest(app).get("/error");
  t.is(response.status, 400);
  t.is(response.body.success, false);
  t.is(response.body.message, "Invalid ID format");
  t.is(response.body.error, "Cast to ObjectId failed");
});

// Test case: Verify that MongoDB duplicate key errors result in a 409 Conflict
test("errorHandler returns 409 for duplicate key error", async (t) => {
  const error = new Error("Duplicate key");
  error.code = 11000;
  error.keyPattern = { username: 1 };
  const app = createTestApp(error);
  const response = await supertest(app).get("/error");
  t.is(response.status, 409);
  t.is(response.body.success, false);
  t.regex(response.body.message, /Duplicate value for username/);
  t.regex(response.body.error, /username already exists/);
});
