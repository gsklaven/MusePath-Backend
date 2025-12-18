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

router.post('/register', authController.Register);
router.post('/login', authController.Login);
router.post('/logout', authController.Logout);

export default router;