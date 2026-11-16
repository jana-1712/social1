import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { AppError } from '../error/app-error';

const client = new OAuth2Client({
    clientId: env.google.clientId
});

export interface GoogleUserPayload {
    email: string;
    name: string;
    sub: string;
    picture?: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleUserPayload> {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: env.google.clientId || undefined
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new AppError('Invalid Google token: email not found', 400);
        }

        return {
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            sub: payload.sub,
            picture: payload.picture
        };
    } catch (err: any) {
        if (err instanceof AppError) throw err;
        throw new AppError('Failed to verify Google token: ' + (err.message || 'invalid token'), 401);
    }
}
