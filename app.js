/**
 * Express Application Setup
 * 
 * This file is the primary entry point for the Express application's request processing pipeline.
 * It orchestrates the setup of all middleware, including security, request parsing, routing, and error handling.
 * The configuration is modularized into separate functions for clarity and maintainability.
 */
import express from 'express';
import routes from './routes/index.js';
import { 
  cors, helmet, compression, rateLimit, cookieParser, 
  mongoSanitize, errorHandler, notFoundHandler, getLogger 
} from './middleware/index.js';
import { 
  corsOptions, 
  rateLimitOptions, 
  jsonParserOptions, 
  urlEncodedOptions 
} from './config/middleware.js';
import { API_INFO } from './config/apiInfo.js';

const app = express();

/**
 * Applies security-related middleware to the Express application.
 * This includes setting security headers, enabling CORS, and configuring rate limiting.
 * @param {import('express').Application} app - The Express application instance.
 */
const applySecurity = (app) => {
  app.use(helmet());
  // Enables Cross-Origin Resource Sharing with configured options.
  app.use(cors(corsOptions));

  // If the TESTING_ENV variable is 'true', apply a more lenient rate limit.
  if (process.env.TESTING_ENV === 'true') {
    app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100000,              // A very high limit to ensure performance tests (e.g., k6) can run without being blocked.
      message: { error: 'Rate limit exceeded (Testing Mode)' }
    }));
  } else {
    // In production or development, use the standard rate limit options from the config.
    app.use(rateLimit(rateLimitOptions));
  }
};

/**
 * Applies middleware for request processing, such as body parsing, compression, logging, and data sanitization.
 * @param {import('express').Application} app - The Express application instance.
 */
const applyRequestProcessing = (app) => {
  app.use(compression());
  app.use(express.json(jsonParserOptions));
  app.use(express.urlencoded(urlEncodedOptions));
  app.use(cookieParser());
  app.use(getLogger());
  app.use(mongoSanitize());
};

/**
 * Registers the main API routes and a root endpoint for basic API information.
 * @param {import('express').Application} app - The Express application instance.
 */
const applyRoutes = (app) => {
  app.use('/v1', routes);
  app.get('/', (_, res) => res.json(API_INFO));
};

/**
 * Applies the final layers of middleware for handling errors, such as 404 Not Found and other application errors.
 * @param {import('express').Application} app - The Express application instance.
 */
const applyErrorHandling = (app) => {
  app.use(notFoundHandler);
  app.use(errorHandler);
};

// Initialize all middleware layers in the correct order.
// The order of application is crucial: Security -> Processing -> Routing -> Error Handling.
applySecurity(app);
applyRequestProcessing(app);
applyRoutes(app);
applyErrorHandling(app);

export default app;