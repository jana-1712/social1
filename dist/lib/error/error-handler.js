"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = globalErrorHandler;
const app_error_1 = require("./app-error");
function globalErrorHandler(err, req, res, next) {
    if (err instanceof app_error_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }
    // Handle mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors || {}).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: messages.join(', ') || 'Validation error'
        });
    }
    // Handle duplicate key error in mongoose
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({
            success: false,
            message: `${field} already exists`
        });
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token has expired'
        });
    }
    console.error('Unhandled Error:', err);
    return res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
}
