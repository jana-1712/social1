import { Schema, model, Document, Types } from 'mongoose';

export type FollowStatus = 'ACCEPTED' | 'PENDING' | 'REJECTED';

export interface IFollow extends Document {
    followerId: Types.ObjectId;
    followingId: Types.ObjectId;
    status: FollowStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

const followSchema = new Schema<IFollow>(
    {
        followerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        followingId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        status: {
            type: String,
            enum: ['ACCEPTED', 'PENDING', 'REJECTED'],
            default: 'ACCEPTED',
            required: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const Follow = model<IFollow>('Follow', followSchema);
