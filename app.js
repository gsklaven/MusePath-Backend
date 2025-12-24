/**
 * Express Application Setup
 * Entry point for request processing pipeline.
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
 * Applies security middleware to the Express application.
 * @param {import('express').Application} app - The Express application instance.
 */
const applySecurity = (app) => {
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(rateLimit(rateLimitOptions));
};

/**
 * Applies request processing middleware (parsing, logging, sanitization).
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
 * Registers API routes and the root endpoint.
 * @param {import('express').Application} app - The Express application instance.
 */
const applyRoutes = (app) => {
  app.use('/v1', routes);
  app.get('/', (_, res) => res.json(API_INFO));
};

/**
 * Applies error handling middleware.
 * @param {import('express').Application} app - The Express application instance.
 */
const applyErrorHandling = (app) => {
  app.use(notFoundHandler);
  app.use(errorHandler);
};

// Initialize all layers
applySecurity(app);
applyRequestProcessing(app);
applyRoutes(app);
applyErrorHandling(app);

export default app;