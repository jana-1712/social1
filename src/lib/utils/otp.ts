import crypto from 'node:crypto';

export function generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
}

export function generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
}
