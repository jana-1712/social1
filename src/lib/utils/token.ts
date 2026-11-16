import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface UserTokenPayload {
    id: string;
    email: string;
    userName: string;
    sessionId?: string;
}

export function generateAccessToken(payload: UserTokenPayload): string {
    return jwt.sign(payload, env.jwt.secret, {
        expiresIn: env.jwt.expiresIn as any
    });
}

export function generateRefreshToken(payload: UserTokenPayload): string {
    return jwt.sign(payload, env.jwt.refreshSecret, {
        expiresIn: env.jwt.refreshExpiresIn as any
    });
}

export function verifyAccessToken(token: string): UserTokenPayload {
    return jwt.verify(token, env.jwt.secret) as UserTokenPayload;
}

export function verifyRefreshToken(token: string): UserTokenPayload {
    return jwt.verify(token, env.jwt.refreshSecret) as UserTokenPayload;
}
