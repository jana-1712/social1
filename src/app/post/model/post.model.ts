
import { Schema, model, Types } from "mongoose";

export interface IPost {
    content: string;
    userId: Types.ObjectId;
    commentsCount: number;
    reactionsCount: number;
    allowsComments: boolean;
}

const schema = new Schema<IPost>({
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 200
    },

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    commentsCount: {
        type: Number,
        default: 0
    },

    reactionsCount: {
        type: Number,
        default: 0
    },

    allowsComments: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const Post = model<IPost>("Post", schema);
