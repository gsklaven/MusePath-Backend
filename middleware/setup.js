import { securityMiddleware } from './security.js';
import { parsingMiddleware } from './parsing.js';
import { getLogger } from './logger.js';

/**
 * Setup security middleware
 */
export const setupSecurity = (app) => {
  securityMiddleware.forEach(middleware => app.use(middleware));
};

/**
 * Setup request processing middleware
 */
export const setupMiddleware = (app) => {
  parsingMiddleware.forEach(middleware => app.use(middleware));
  app.use(getLogger());
};