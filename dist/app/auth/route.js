"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("./controller/auth.controller"));
const guard_1 = require("../../lib/auth/guard");
exports.authRouter = (0, express_1.Router)();
// Registration & Email Verification
exports.authRouter.post('/register', (req, res, next) => auth_controller_1.default.register(req, res, next));
exports.authRouter.patch('/verify-account', (req, res, next) => auth_controller_1.default.verifyAccount(req, res, next));
exports.authRouter.patch('/verifyAccount', (req, res, next) => auth_controller_1.default.verifyAccount(req, res, next));
exports.authRouter.post('/send-otp', (req, res, next) => auth_controller_1.default.sendOtp(req, res, next));
// Login & Session Generation
exports.authRouter.post('/login', (req, res, next) => auth_controller_1.default.login(req, res, next));
// Token Refreshing & Revocation
exports.authRouter.post('/refresh-token', (req, res, next) => auth_controller_1.default.refreshToken(req, res, next));
exports.authRouter.post('/refresh', (req, res, next) => auth_controller_1.default.refreshToken(req, res, next));
exports.authRouter.post('/logout', (req, res, next) => auth_controller_1.default.logout(req, res, next));
exports.authRouter.post('/logout-all', guard_1.authGuard, (req, res, next) => auth_controller_1.default.logoutAll(req, res, next));
// Password Reset Flow (OTP / Secure Link)
exports.authRouter.post('/forgot-password', (req, res, next) => auth_controller_1.default.forgotPassword(req, res, next));
exports.authRouter.patch('/reset-password', (req, res, next) => auth_controller_1.default.resetPassword(req, res, next));
// OAuth 2.0 Integration (Google sign-in)
exports.authRouter.post('/google', (req, res, next) => auth_controller_1.default.googleLogin(req, res, next));
exports.authRouter.post('/google-login', (req, res, next) => auth_controller_1.default.googleLogin(req, res, next));
exports.default = exports.authRouter;
