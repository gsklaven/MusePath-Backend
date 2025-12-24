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
 */
const app = express();

/**
 * Security Middleware
 */
app.use(helmet()); // Set security headers
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
})); // Enable CORS with credentials

/**
 * Rate Limiting
 */
const limiter = rateLimit({
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
});

app.use(limiter);

/**
 * Request Processing Middleware
 */
app.use(compression()); // Compress response bodies
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies on incoming requests
app.use(getLogger()); // HTTP request logging
app.use(mongoSanitize()); // Sanitize user input to prevent NoSQL injection
/**
 * API Routes
 */
app.use('/v1', routes);

// Root endpoint
app.get('/', (_, res) => {
  res.json({
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
  });
});

/**
 * Error Handling Middleware
 */
app.use(notFoundHandler); // Handle 404 errors
app.use(errorHandler); // Handle all other errors

export default app;