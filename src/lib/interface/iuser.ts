import { Provider, Gender } from '../../app/auth/enum/enum';

export interface IUser {
    _id?: any;
    userName: string;
    email: string;
    password?: string;
    provider: Provider;
    gender: Gender;
    phoneNumber?: string;
    isVerified: boolean;
    isPrivate: boolean;
    bio?: string;
    profilePic?: string;
    followersCount: number;
    followingCount: number;
    failedLoginAttempts?: number;
    lockUntil?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}
