"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 200
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.Post = (0, mongoose_1.model)("Post", schema);
