"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const route_1 = require("./route");
const error_handler_1 = require("./lib/error/error-handler");
const app_error_1 = require("./lib/error/app-error");
function createApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    // API Routes
    app.use('/api', route_1.router);
    // 404 Handler
    app.use((req, res, next) => {
        next(new app_error_1.AppError(`Cannot find ${req.method} ${req.originalUrl} on this server!`, 404));
    });
    // Global Error Handler
    app.use(error_handler_1.globalErrorHandler);
    return app;
}
