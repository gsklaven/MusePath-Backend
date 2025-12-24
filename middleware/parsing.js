import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';

/**
 * Request parsing and processing middleware stack
 */
export const parsingMiddleware = [
  // Compress response bodies
  compression(),
  
  // Parse JSON request bodies
  express.json({ limit: '10mb' }),
  
  // Parse URL-encoded bodies
  express.urlencoded({ extended: true, limit: '10mb' }),
  
  // Parse cookies on incoming requests
  cookieParser()
];