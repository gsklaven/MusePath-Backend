import express from 'express';
import routes from './routes/index.js';
import { 
  cors, 
  helmet, 
  compression, 
  rateLimit, 
  cookieParser, 
  mongoSanitize,
  errorHandler, 
  notFoundHandler, 
  getLogger 
} from './middleware/index.js';
import { RATE_LIMIT } from './config/constants.js';

/**
 * Express Application Setup
 * Initializes the Express application and configures middleware, routes, and error handling.
 */
const app = express();

/**
 * Configuration for CORS (Cross-Origin Resource Sharing).
 */
const corsOptions = {
  origin: [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
};

/**
 * Configuration for Rate Limiting.
 */
const rateLimitOptions = {
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    data: null,
    message: 'Too many requests from this IP, please try again later.',
    error: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Metadata response for the root endpoint.
 */
const API_METADATA = {
  success: true,
  data: {
    name: 'MusePath API',
    version: '1.0.0',
    description: 'Interactive museum maps, exhibit details, and personalized navigation REST API',
    endpoints: {
      authentication: '/v1/auth',
      health: '/v1/health',
      coordinates: '/v1/coordinates',
      destinations: '/v1/destinations',
      exhibits: '/v1/exhibits',
      maps: '/v1/maps',
      routes: '/v1/routes',
      users: '/v1/users',
      notifications: '/v1/notifications',
      sync: '/v1/sync',
      downloads: '/v1/downloads'
    }
  },
  message: 'Welcome to MusePath API',
  error: null
};

/**
 * Security Middleware Configuration
 * - Helmet: Sets various HTTP headers for security.
 * - CORS: Configures Cross-Origin Resource Sharing to allow requests from specific origins.
 */
app.use(helmet()); // Set security headers
app.use(cors(corsOptions)); // Enable CORS with credentials

/**
 * Rate Limiting Configuration
 * Limits the number of requests from a single IP to prevent abuse.
 */
app.use(rateLimit(rateLimitOptions));

/**
 * Request Processing Middleware
 * - Compression: Gzip compression for responses.
 * - Body Parser: Parses JSON and URL-encoded request bodies.
 * - Cookie Parser: Parses cookies from request headers.
 * - Logger: Logs HTTP requests.
 * - Mongo Sanitize: Prevents NoSQL injection attacks.
 */
app.use(compression()); // Compress response bodies
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies on incoming requests
app.use(getLogger()); // HTTP request logging
app.use(mongoSanitize()); // Sanitize user input to prevent NoSQL injection
/**
 * API Routes Configuration
 * Mounts all API version 1 routes under /v1.
 */
app.use('/v1', routes);

/**
 * Root Endpoint
 * Provides API information and health status.
 * @route GET /
 */
app.get('/', (_, res) => res.json(API_METADATA));

/**
 * Error Handling Middleware
 * - Not Found Handler: Catches 404 errors for undefined routes.
 * - Global Error Handler: Handles all other errors and sends appropriate responses.
 */
app.use(notFoundHandler); // Handle 404 errors
app.use(errorHandler); // Handle all other errors

export default app;
