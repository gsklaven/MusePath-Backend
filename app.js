/**
 * Express Application Setup
 * 
 * This module initializes the Express application and configures the middleware stack,
 * API routes, and error handling mechanisms. It serves as the entry point for the
 * application's request processing pipeline.
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
 * Root Endpoint Handler.
 * @param {import('express').Request} _ - Express request object (unused).
 * @param {import('express').Response} res - Express response object.
 */
const rootHandler = (_, res) => res.json(API_INFO);

/**
 * Security Middleware Configuration
 * - Helmet: Sets various HTTP headers to secure the app.
 * - CORS: Configures Cross-Origin Resource Sharing based on options.
 * - Rate Limit: Protects against brute-force and DoS attacks.
 */
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimit(rateLimitOptions));

/**
 * Request Processing Middleware
 * - Compression: Gzip compression for response bodies.
 * - JSON/UrlEncoded: Parses incoming request bodies.
 * - Cookie Parser: Parses cookies from request headers.
 * - Logger: Logs HTTP requests for monitoring.
 * - Mongo Sanitize: Prevents NoSQL injection attacks.
 */
app.use(compression());
app.use(express.json(jsonParserOptions));
app.use(express.urlencoded(urlEncodedOptions));
app.use(cookieParser());
app.use(getLogger());
app.use(mongoSanitize());

/**
 * API Routes Configuration
 * Mounts the API routes under the /v1 prefix.
 */
app.use('/v1', routes);

/**
 * Root Endpoint
 * Returns API metadata including version and available endpoints.
 * @route GET /
 */
app.get('/', rootHandler);

/**
 * Error Handling Middleware
 * - Not Found: Handles 404 errors for undefined routes.
 * - Global Error Handler: Catches and formats all other errors.
 */
app.use(notFoundHandler);
app.use(errorHandler);

export default app;