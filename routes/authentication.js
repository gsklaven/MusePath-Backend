import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post("/register", authController.Register);

router.post("/login", authController.Login);

router.post("/logout", authController.Logout);

export default router;