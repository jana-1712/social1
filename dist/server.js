"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const node_http_1 = __importDefault(require("node:http"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./lib/config/env");
const connection_1 = require("./lib/db/connection");
const app = (0, app_1.createApp)();
const server = node_http_1.default.createServer(app);
const PORT = env_1.env.port || 3000;
async function startServer() {
    try {
        await (0, connection_1.connectDB)();
    }
    catch (err) {
        console.warn('[Database] Could not connect to MongoDB initially. Will proceed running server.');
    }
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
startServer();
async function shutdown() {
    console.log('Shutting down server gracefully...');
    await mongoose_1.default.disconnect();
    server.close();
    process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
