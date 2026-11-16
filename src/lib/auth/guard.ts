import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, UserTokenPayload } from '../utils/token';
import { unauthorized } from '../../app/auth/error';

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            user?: UserTokenPayload;
        }
    }
}

export function authGuard(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        const token = req.cookies?.['access-token'] || req.cookies?.['access_token'] || bearerToken;

        if (!token) {
            return next(unauthorized);
        }

        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch (error) {
        next(unauthorized);
    }
}

export function optionalAuthGuard(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        const token = req.cookies?.['access-token'] || req.cookies?.['access_token'] || bearerToken;

        if (token) {
            const payload = verifyAccessToken(token);
            req.user = payload;
        }
    } catch {
        // Ignore token errors for optional guard
    }
    next();
}
