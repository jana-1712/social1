"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = authGuard;
exports.optionalAuthGuard = optionalAuthGuard;
const token_1 = require("../utils/token");
const error_1 = require("../../app/auth/error");
function authGuard(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        const token = req.cookies?.['access-token'] || req.cookies?.['access_token'] || bearerToken;
        if (!token) {
            return next(error_1.unauthorized);
        }
        const payload = (0, token_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        next(error_1.unauthorized);
    }
}
function optionalAuthGuard(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        const token = req.cookies?.['access-token'] || req.cookies?.['access_token'] || bearerToken;
        if (token) {
            const payload = (0, token_1.verifyAccessToken)(token);
            req.user = payload;
        }
    }
    catch {
        // Ignore token errors for optional guard
    }
    next();
}
