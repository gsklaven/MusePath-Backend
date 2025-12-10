import * as authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { validateEmailFormat, validateUsernameFormat, validatePasswordStrength } from '../middleware/auth.js';

/**
 * User Authentication and Registration Controller
 * Handles HTTP requests for authentication and registration operations
 */

/**
 * Register a new user
 * POST /auth/register
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const Register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Validate input
        if (!username || !email || !password) {
            return sendError(res, 'Username, email, and password are required', 400);
        }

        // Validate input types
        if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            return sendError(res, 'Invalid input types', 400);
        }

        // Validate username format
        if (!validateUsernameFormat(username)) {
            return sendError(res, 'Invalid username format. Use only letters, numbers, underscores, and hyphens (3-30 characters)', 400);
        }

        // Validate email format
        if (!validateEmailFormat(email)) {
            return sendError(res, 'Invalid email format', 400);
        }

        // Validate password strength
        const pwCheck = validatePasswordStrength(password);
        if (!pwCheck.isValid) {
            return sendError(res, pwCheck.message, 400);
        }

        // Register user via service
        const newUser = await authService.registerUser({ username, email, password });

        return sendSuccess(res, newUser, 'User created successfully', 201);
    } catch (err) {
        console.error('Registration error:', err);
        return sendError(res, err.message || 'Failed to create user', err.status || 500);
    }
};

/**
 * Login user
 * POST /auth/login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const Login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate input
        if (!username || !password) {
            return sendError(res, 'Username and password are required', 400);
        }

        // Validate input types
        if (typeof username !== 'string' || typeof password !== 'string') {
            return sendError(res, 'Invalid input types', 400);
        }

        // Validate username format (security check)
        if (!validateUsernameFormat(username)) {
            return sendError(res, 'Invalid username format', 400);
        }

        // Login user via service (returns { user, token })
        const result = await authService.loginUser({ username, password });
        const { user, token } = result;

        // Set token as httpOnly cookie
        const cookieMaxAge = Number(process.env.JWT_COOKIE_MAX_AGE_MS) || 1000 * 60 * 60 * 24 * 7; // default 7 days
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: cookieMaxAge
        });

        // Return only user info (token stored in cookie)
        return sendSuccess(res, user, 'Login successful', 200);
    } catch (err) {
        console.error('Login error:', err);
        return sendError(res, err.message || 'Failed to login', err.status || 401);
    }
};

/**
 * Logout user
 * POST /auth/logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const Logout = async (req, res) => {
    // Delegate logout actions to authService (revoke token, clear cookie)
    try {
        authService.logoutUser({ req, res });
        return sendSuccess(res, null, 'Logout successful', 200);
    } catch (err) {
        console.error('Logout error:', err);
        return sendError(res, 'Failed to logout', 500);
    }
};