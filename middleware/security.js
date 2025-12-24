import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { RATE_LIMIT } from '../config/constants.js';

/**
 * Security-related middleware stack
 */
export const securityMiddleware = [
  // Set security headers
  helmet(),
  
  // Enable CORS with credentials
  cors({
    origin: [
      process.env.CLIENT_URL, 
      'http://localhost:3000', 
      'http://localhost:3001'
    ],
    credentials: true
  }),
  
  // Rate limiting
  rateLimit({
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
  }),
  
  // Sanitize user input to prevent NoSQL injection
  mongoSanitize()
];