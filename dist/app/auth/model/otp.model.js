"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = void 0;
const mongoose_1 = require("mongoose");
const otpSchema = new mongoose_1.Schema({
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
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
});
exports.Otp = (0, mongoose_1.model)('Otp', otpSchema);
