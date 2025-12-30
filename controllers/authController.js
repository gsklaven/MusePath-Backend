import * as authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { validateEmailFormat, validateUsernameFormat, validatePasswordStrength } from '../middleware/auth.js';

/**
 * User Authentication and Registration Controller
 * 
 * This controller manages the HTTP requests related to user authentication, including registration,
 * login, and logout processes. It acts as the interface between the client-facing API routes
 * and the underlying authentication business logic in the `authService`.
 */

/**
 * Generates a standard set of options for setting secure, httpOnly cookies.
 * The options are determined by the application's environment (production vs. development).
 *
 * @returns {import('express').CookieOptions} An object containing options for cookie creation.
 */
const getCookieOptions = () => ({
    // The cookie cannot be accessed by client-side scripts, which helps mitigate XSS attacks.
    httpOnly: true,
    // The cookie is only sent over HTTPS in production.
    secure: process.env.NODE_ENV === 'production',
    // Controls when the cookie is sent. 'lax' is a reasonable default for development.
    // In production, 'none' might be required for cross-site requests, but requires `secure: true`.
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    // The maximum age of the cookie in milliseconds. Defaults to 7 days.
    maxAge: Number(process.env.JWT_COOKIE_MAX_AGE_MS) || 604800000 // 7 days
});

/**
 * Handles the registration of a new user.
 * It validates the incoming user data, passes it to the registration service, and sends back the result.
 * 
 * @route POST /auth/register
 * @param {import('express').Request} req - Express request object, expecting `username`, `email`, and `password` in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the newly created user or an error message.
 */
export const Register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Basic Input Validation
        if (!username || !email || !password) {
            return sendError(res, 'Username, email, and password are required', 400);
        }

        // 2. Format and Strength Validation
        // Group validation checks to find the first failure.
        const validations = [
            validateUsernameFormat(username),
            validateEmailFormat(email),
            validatePasswordStrength(password)
        ];
        
        const failedValidation = validations.find(v => !v.isValid);
        if (failedValidation) {
            return sendError(res, failedValidation.message, 400);
        }

        // 3. Delegate to Service
        // The service handles the core logic of user creation and password hashing.
        const newUser = await authService.registerUser({ username, email, password });

        // 4. Send Success Response
        return sendSuccess(res, newUser, 'User created successfully', 201);
    } catch (err) {
        // Catch errors from the service (e.g., "User already exists") or other unexpected errors.
        console.error('Registration error:', err);
        return sendError(res, err.message || 'Failed to create user', err.status || 500);
    }
};

/**
 * Handles user login.
 * It validates credentials, retrieves a user and token from the service, sets a secure cookie, and returns user info.
 * 
 * @route POST /auth/login
 * @param {import('express').Request} req - Express request object, expecting `username` and `password` in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with user info and a JWT, and sets an httpOnly cookie.
 */
export const Login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Basic Input Validation
        if (!username || !password) {
            return sendError(res, 'Username and password are required', 400);
        }

        // 2. Username Format Validation (as a preliminary security check)
        const usernameCheck = validateUsernameFormat(username);
        if (!usernameCheck.isValid) {
            return sendError(res, usernameCheck.message, 400);
        }

        // 3. Delegate to Service
        // The service authenticates the user and generates a JWT.
        const { user, token } = await authService.loginUser({ username, password });

        // 4. Set Cookie
        // The token is stored in a secure, httpOnly cookie to protect against XSS.
        res.cookie('token', token, getCookieOptions());

        // 5. Send Success Response
        // The token is also returned in the body to support clients that prefer using the Authorization header.
        return sendSuccess(res, { ...user, token }, 'Login successful', 200);
    } catch (err) {
        // Catch errors from the service (e.g., "Invalid credentials").
        console.error('Login error:', err);
        return sendError(res, err.message || 'Failed to login', err.status || 401);
    }
};

/**
 * Handles user logout.
 * This delegates the core logout logic (e.g., token revocation) to the authentication service.
 * 
 * @route POST /auth/logout
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response confirming a successful logout.
 */
export const Logout = async (req, res) => {
    try {
        // The service is responsible for handling token invalidation and clearing the cookie.
        authService.logoutUser({ req, res });
        return sendSuccess(res, null, 'Logout successful', 200);
    } catch (err) {
        console.error('Logout error:', err);
        return sendError(res, 'Failed to logout', 500);
    }
};