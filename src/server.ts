import type { Express } from "express";
import { createApp } from "./app";
import http, { Server } from "node:http";
import mongoose from "mongoose";
import { env } from "./lib/config/env";
import { connectDB } from "./lib/db/connection";

const app: Express = createApp();
const server: Server = http.createServer(app);

const PORT = env.port || 3000;

async function startServer(): Promise<void> {
    try {
        await connectDB();
    } catch (err) {
        console.warn('[Database] Could not connect to MongoDB initially. Will proceed running server.');
    }

    server.listen(PORT, (): void => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();

async function shutdown(): Promise<void> {
    console.log('Shutting down server gracefully...');
    await mongoose.disconnect();
    server.close();
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
