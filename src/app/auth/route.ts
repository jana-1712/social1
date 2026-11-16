import { Router } from 'express';
import authController from './controller/auth.controller';
import { authGuard } from '../../lib/auth/guard';

export const authRouter = Router();

// Registration & Email Verification
authRouter.post('/register', (req, res, next) => authController.register(req, res, next));
authRouter.patch('/verify-account', (req, res, next) => authController.verifyAccount(req, res, next));
authRouter.patch('/verifyAccount', (req, res, next) => authController.verifyAccount(req, res, next));
authRouter.post('/send-otp', (req, res, next) => authController.sendOtp(req, res, next));

// Login & Session Generation
authRouter.post('/login', (req, res, next) => authController.login(req, res, next));

// Token Refreshing & Revocation
authRouter.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));
authRouter.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));
authRouter.post('/logout', (req, res, next) => authController.logout(req, res, next));
authRouter.post('/logout-all', authGuard, (req, res, next) => authController.logoutAll(req, res, next));

// Password Reset Flow (OTP / Secure Link)
authRouter.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
authRouter.patch('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// OAuth 2.0 Integration (Google sign-in)
authRouter.post('/google', (req, res, next) => authController.googleLogin(req, res, next));
authRouter.post('/google-login', (req, res, next) => authController.googleLogin(req, res, next));

export default authRouter;
