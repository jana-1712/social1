import { Schema, model } from 'mongoose';
import { Provider, Gender } from '../auth/enum/enum';
import type { IUser } from '../../lib/interface/iuser';

const userSchema = new Schema<IUser>(
    {
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
            required: function (this: any) {
                return this.provider === Provider.LOCAL;
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
            enum: [Provider.LOCAL, Provider.GOOGLE, Provider.FACEBOOK],
            default: Provider.LOCAL,
            required: true
        },
        gender: {
            type: Number,
            enum: [Gender.MALE, Gender.FEMALE],
            default: Gender.MALE,
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
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret: Record<string, any>) {
                delete ret.password;
                delete ret.__v;
                return ret;
            }
        }
    }
);

userSchema.index({ userName: 'text', email: 'text' });

const User = model<IUser>('User', userSchema);
export default User;
