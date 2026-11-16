import express, { Express, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { router } from "./route";
import { globalErrorHandler } from "./lib/error/error-handler";
import { AppError } from "./lib/error/app-error";

export function createApp(): Express {
    const app: Express = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // API Routes
    app.use('/api', router);

    // 404 Handler
    app.use((req: Request, res: Response, next: NextFunction) => {
        next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server!`, 404));
    });

    // Global Error Handler
    app.use(globalErrorHandler);

    return app;
}
