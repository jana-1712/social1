import type { Request, Response, NextFunction } from 'express';
import authService from '../service/auth.service';
import { toMs } from '../../../pkg/utils/time';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await authService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please check your email for the verification code.',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.verifyAccount(req.body);
            res.status(200).json({
                success: true,
                message: 'Account verified successfully. You can now login.',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async sendOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const type = req.body.type || 'VERIFICATION';
            const result = await authService.sendOtp(req.body, type);
            res.status(200).json({
                success: true,
                message: 'Verification OTP sent successfully to your email.',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const meta = {
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip || req.socket.remoteAddress
            };
            const result = await authService.login(req.body, meta);

            // Set HTTP-only cookies
            res.cookie('access-token', result.accessToken, {
                httpOnly: true,
                maxAge: toMs(15, 'minutes')
            });
            res.cookie('refresh-token', result.refreshToken, {
                httpOnly: true,
                maxAge: toMs(7, 'days')
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
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies?.['refresh-token'] || req.body?.refreshToken;
            const meta = {
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip || req.socket.remoteAddress
            };

            const result = await authService.refreshToken(refreshToken, meta);

            res.cookie('access-token', result.accessToken, {
                httpOnly: true,
                maxAge: toMs(15, 'minutes')
            });
            res.cookie('refresh-token', result.refreshToken, {
                httpOnly: true,
                maxAge: toMs(7, 'days')
            });

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies?.['refresh-token'] || req.body?.refreshToken;
            await authService.logout(refreshToken);

            res.clearCookie('access-token');
            res.clearCookie('refresh-token');

            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async logoutAll(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            await authService.logoutAll(userId);

            res.clearCookie('access-token');
            res.clearCookie('refresh-token');

            res.status(200).json({
                success: true,
                message: 'All active sessions have been revoked successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.resetPassword(req.body);
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    async googleLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const idToken = req.body.idToken || req.body.token || req.body.credential;
            const meta = {
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip || req.socket.remoteAddress
            };

            const result = await authService.loginWithGoogle(idToken, meta);

            res.cookie('access-token', result.accessToken, {
                httpOnly: true,
                maxAge: toMs(15, 'minutes')
            });
            res.cookie('refresh-token', result.refreshToken, {
                httpOnly: true,
                maxAge: toMs(7, 'days')
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
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
