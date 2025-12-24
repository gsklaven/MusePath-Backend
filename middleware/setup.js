import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import { getLogger } from './logger.js';
import { RATE_LIMIT } from '../config/constants.js';

/**
 * Setup security middleware
 */
export const setupSecurity = (app) => {
  // Set security headers
  app.use(helmet());
  
  // Enable CORS with credentials
  app.use(cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }));

  // Rate limiting
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
};

/**
 * Setup request processing middleware
 */
export const setupMiddleware = (app) => {
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(getLogger());
  app.use(mongoSanitize());
};