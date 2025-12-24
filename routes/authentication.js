import express from 'express';
import * as authController from '../controllers/authController.js';

/**
 * Authentication routes
 *
 * Exposes:
 * - POST /register -> create new user (calls authController.Register)
 * - POST /login    -> authenticate user (calls authController.Login)
 * - POST /logout   -> revoke session/token (calls authController.Logout)
 *
 * These routes are intentionally small and delegate validation and
 * business logic to the controller/service layer.
 */

const router = express.Router();

// Route: Register a new user
// Endpoint: POST /v1/auth/register
router.post('/register', authController.Register);

// Route: Authenticate an existing user
// Endpoint: POST /v1/auth/login
router.post('/login', authController.Login);

// Route: Log out the current user and invalidate session
// Endpoint: POST /v1/auth/logout
router.post('/logout', authController.Logout);

export default router;