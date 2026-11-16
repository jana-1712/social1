"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = __importDefault(require("../service/auth.service"));
const time_1 = require("../../../pkg/utils/time");
class AuthController {
    async register(req, res, next) {
        try {
            const user = await auth_service_1.default.register(req.body);
            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please check your email for the verification code.',
                data: user
            });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyAccount(req, res, next) {
        try {
            const result = await auth_service_1.default.verifyAccount(req.body);
            res.status(200).json({
                success: true,
                message: 'Account verified successfully. You can now login.',
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }
    async sendOtp(req, res, next) {
        try {
            const type = req.body.type || 'VERIFICATION';
            const result = await auth_service_1.default.sendOtp(req.body, type);
            res.status(200).json({
                success: true,
                message: 'Verification OTP sent successfully to your email.',
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const meta = {
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip || req.socket.remoteAddress
            };
            const result = await auth_service_1.default.login(req.body, meta);
            // Set HTTP-only cookies
            res.cookie('access-token', result.accessToken, {
                httpOnly: true,
                maxAge: (0, time_1.toMs)(15, 'minutes')
            });
            res.cookie('refresh-token', result.refreshToken, {
                httpOnly: true,
                maxAge: (0, time_1.toMs)(7, 'days')
            });
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.['refresh-token'] || req.body?.refreshToken;
            const meta = {
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip || req.socket.remoteAddress
            };
            const result = await auth_service_1.default.refreshToken(refreshToken, meta);
            res.cookie('access-token', result.accessToken, {
                httpOnly: true,
                maxAge: (0, time_1.toMs)(15, 'minutes')
            });
            res.cookie('refresh-token', result.refreshToken, {
                httpOnly: true,
                maxAge: (0, time_1.toMs)(7, 'days')
            });
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies?.['refresh-token'] || req.body?.refreshToken;
            await auth_service_1.default.logout(refreshToken);
            res.clearCookie('access-token');
            res.clearCookie('refresh-token');
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logoutAll(req, res, next) {
        try {
            const userId = req.user.id;
            await auth_service_1.default.logoutAll(userId);
            res.clearCookie('access-token');
            res.clearCookie('refresh-token');
            res.status(200).json({
                success: true,
                message: 'All active sessions have been revoked successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await auth_service_1.default.forgotPassword(email);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const result = await auth_service_1.default.resetPassword(req.body);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            next(error);
        }
    }
    async googleLogin(req, res, next) {
        try {
            const idToken = req.body.idToken || req.body.token || req.body.credential;
            const meta = {
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip || req.socket.remoteAddress
            };
            const result = await auth_service_1.default.loginWithGoogle(idToken, meta);
            res.cookie('access-token', result.accessToken, {
                httpOnly: true,
                maxAge: (0, time_1.toMs)(15, 'minutes')
            });
            res.cookie('refresh-token', result.refreshToken, {
                httpOnly: true,
                maxAge: (0, time_1.toMs)(7, 'days')
            });
            res.status(200).json({
                success: true,
                message: 'Google login successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
