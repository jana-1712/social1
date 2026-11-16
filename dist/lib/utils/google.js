"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleToken = verifyGoogleToken;
const google_auth_library_1 = require("google-auth-library");
const env_1 = require("../config/env");
const app_error_1 = require("../error/app-error");
const client = new google_auth_library_1.OAuth2Client({
    clientId: env_1.env.google.clientId
});
async function verifyGoogleToken(idToken) {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: env_1.env.google.clientId || undefined
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new app_error_1.AppError('Invalid Google token: email not found', 400);
        }
        return {
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            sub: payload.sub,
            picture: payload.picture
        };
    }
    catch (err) {
        if (err instanceof app_error_1.AppError)
            throw err;
        throw new app_error_1.AppError('Failed to verify Google token: ' + (err.message || 'invalid token'), 401);
    }
}
