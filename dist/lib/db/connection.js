"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
async function connectDB() {
    try {
        const conn = await mongoose_1.default.connect(env_1.env.db.url);
        console.log(`[Database] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    }
    catch (error) {
        console.error('[Database] MongoDB connection error:', error);
        throw error;
    }
}
