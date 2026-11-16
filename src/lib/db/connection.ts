import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectDB(): Promise<typeof mongoose> {
    try {
        const conn = await mongoose.connect(env.db.url);
        console.log(`[Database] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error('[Database] MongoDB connection error:', error);
        throw error;
    }
}
