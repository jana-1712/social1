import { Schema, model, Document } from 'mongoose';

export type OtpType = 'VERIFICATION' | 'PASSWORD_RESET';

export interface IOtp extends Document {
    email: string;
    code: string;
    type: OtpType;
    expiresAt: Date;
    createdAt?: Date;
}

const otpSchema = new Schema<IOtp>(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true
        },
        code: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 6
        },
        type: {
            type: String,
            enum: ['VERIFICATION', 'PASSWORD_RESET'],
            default: 'VERIFICATION',
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 } // TTL index in MongoDB
        }
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false
        }
    }
);

export const Otp = model<IOtp>('Otp', otpSchema);
