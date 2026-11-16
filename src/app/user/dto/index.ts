import { Gender } from '../../auth/enum/enum';

export interface UpdateProfileDto {
    userName?: string;
    bio?: string;
    phoneNumber?: string;
    gender?: Gender;
    profilePic?: string;
}

export interface UpdatePrivacyDto {
    isPrivate: boolean;
}

export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}

export interface PaginationDto {
    page?: number;
    limit?: number;
}
