import { Schema, model, Document, Types } from 'mongoose';

export interface ISession extends Document {
    userId: Types.ObjectId;
    token: string;
    isRevoked: boolean;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const sessionSchema = new Schema<ISession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        isRevoked: {
            type: Boolean,
            default: false,
            index: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 } // Auto-cleanup expired sessions
        },
        userAgent: {
            type: String,
            default: ''
        },
        ipAddress: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

export const Session = model<ISession>('Session', sessionSchema);
