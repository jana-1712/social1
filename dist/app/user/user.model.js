"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const enum_1 = require("../auth/enum/enum");
const userSchema = new mongoose_1.Schema({
    userName: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: 2,
        maxlength: 30,
        index: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider === enum_1.Provider.LOCAL;
        },
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        default: ''
    },
    provider: {
        type: Number,
        enum: [enum_1.Provider.LOCAL, enum_1.Provider.GOOGLE, enum_1.Provider.FACEBOOK],
        default: enum_1.Provider.LOCAL,
        required: true
    },
    gender: {
        type: Number,
        enum: [enum_1.Gender.MALE, enum_1.Gender.FEMALE],
        default: enum_1.Gender.MALE,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isPrivate: {
        type: Boolean,
        default: false // Public by default, can be toggled to Private
    },
    bio: {
        type: String,
        maxlength: 250,
        default: ''
    },
    profilePic: {
        type: String,
        default: ''
    },
    followersCount: {
        type: Number,
        default: 0
    },
    followingCount: {
        type: Number,
        default: 0
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});
userSchema.index({ userName: 'text', email: 'text' });
const User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
