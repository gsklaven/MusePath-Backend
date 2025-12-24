import * as authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { validateEmailFormat, validateUsernameFormat, validatePasswordStrength } from '../middleware/auth.js';

/**
 * User Authentication and Registration Controller
 * Handles HTTP requests for authentication and registration operations
 */

/**
 * Helper to generate standard cookie options.
 * @returns {import('express').CookieOptions}
 */
const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: Number(process.env.JWT_COOKIE_MAX_AGE_MS) || 604800000 // 7 days
});

/**
 * Register a new user.
 * 
 * @route POST /auth/register
 * @param {import('express').Request} req - Express request object containing username, email, and password in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the created user or an error.
 */
export const Register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Validate input
        if (!username || !email || !password) {
            return sendError(res, 'Username, email, and password are required', 400);
        }

        // Group validations to reduce complexity
        const validations = [
            validateUsernameFormat(username),
            validateEmailFormat(email),
            validatePasswordStrength(password)
        ];
        
        const failedValidation = validations.find(v => !v.isValid);
        if (failedValidation) {
            return sendError(res, failedValidation.message, 400);
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
 * Login user.
 * 
 * @route POST /auth/login
 * @param {import('express').Request} req - Express request object containing username and password in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with user info and token, and sets a httpOnly cookie.
 */
export const Login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate input
        if (!username || !password) {
            return sendError(res, 'Username and password are required', 400);
        }


        // Validate username format (security check)
        const usernameCheck = validateUsernameFormat(username);
        if (!usernameCheck.isValid) {
            return sendError(res, usernameCheck.message, 400);
        }

        // Login user via service (returns { user, token })
        const { user, token } = await authService.loginUser({ username, password });

        // Set token as httpOnly cookie
        res.cookie('token', token, getCookieOptions());

        // Return user info AND token (for Authorization header support)
        return sendSuccess(res, { ...user, token }, 'Login successful', 200);
    } catch (err) {
        console.error('Login error:', err);
        return sendError(res, err.message || 'Failed to login', err.status || 401);
    }
};

/**
 * Logout user.
 * 
 * @route POST /auth/logout
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response confirming logout.
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