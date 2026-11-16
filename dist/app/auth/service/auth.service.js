"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_repository_1 = __importDefault(require("../../user/repository/user.repository"));
const otp_repository_1 = __importDefault(require("../repository/otp.repository"));
const session_repository_1 = __importDefault(require("../repository/session.repository"));
const hash_1 = require("../../../lib/utils/hash");
const otp_1 = require("../../../lib/utils/otp");
const token_1 = require("../../../lib/utils/token");
const google_1 = require("../../../lib/utils/google");
const nodemailer_1 = require("../../../lib/email/nodemailer");
const app_error_1 = require("../../../lib/error/app-error");
const enum_1 = require("../enum/enum");
const error_1 = require("../error");
const time_1 = require("../../../pkg/utils/time");
class AuthService {
    async register(userData) {
        const email = userData.email.trim().toLowerCase();
        const userName = userData.userName.trim();
        const existingEmail = await user_repository_1.default.findByEmail(email);
        if (existingEmail) {
            throw error_1.userExist;
        }
        const existingUserName = await user_repository_1.default.findByUserName(userName);
        if (existingUserName) {
            throw new app_error_1.AppError('Username is already taken', 409);
        }
        const hashedPassword = await (0, hash_1.hashPassword)(userData.password);
        const createdUser = await user_repository_1.default.create({
            userName,
            email,
            password: hashedPassword,
            phoneNumber: userData.phoneNumber || '',
            gender: userData.gender !== undefined ? userData.gender : enum_1.Gender.MALE,
            provider: enum_1.Provider.LOCAL,
            isVerified: false,
            isPrivate: false
        });
        // Generate 6-digit OTP
        const code = (0, otp_1.generateOtp)();
        await otp_repository_1.default.deleteOtpByEmail(email, 'VERIFICATION');
        await otp_repository_1.default.createOtp({
            email,
            code,
            type: 'VERIFICATION',
            expiresAt: new Date(Date.now() + (0, time_1.toMs)(10, 'minutes'))
        });
        // Send verification email
        try {
            await nodemailer_1.EmailService.sendVerificationOtp(email, code);
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
        }
        const userObj = createdUser.toObject ? createdUser.toObject() : createdUser;
        delete userObj.password;
        return userObj;
    }
    async verifyAccount(data) {
        const email = data.email.trim().toLowerCase();
        const user = await user_repository_1.default.findByEmail(email);
        if (!user) {
            throw error_1.userNotExist;
        }
        if (user.isVerified) {
            throw error_1.userVerified;
        }
        const otp = await otp_repository_1.default.findOtpByEmail(email, 'VERIFICATION');
        if (!otp) {
            throw error_1.otpExpired;
        }
        if (String(otp.code) !== String(data.code).trim()) {
            throw error_1.invalidCode;
        }
        const updatedUser = await user_repository_1.default.update({ email }, { isVerified: true });
        await otp_repository_1.default.deleteOtpByEmail(email, 'VERIFICATION');
        return updatedUser;
    }
    async sendOtp(data, type = 'VERIFICATION') {
        const email = data.email.trim().toLowerCase();
        const user = await user_repository_1.default.findByEmail(email);
        if (!user) {
            throw error_1.userNotExist;
        }
        if (type === 'VERIFICATION' && user.isVerified) {
            throw error_1.userVerified;
        }
        await otp_repository_1.default.deleteOtpByEmail(email, type);
        const code = (0, otp_1.generateOtp)();
        await otp_repository_1.default.createOtp({
            email,
            code,
            type,
            expiresAt: new Date(Date.now() + (0, time_1.toMs)(10, 'minutes'))
        });
        if (type === 'VERIFICATION') {
            await nodemailer_1.EmailService.sendVerificationOtp(email, code);
        }
        else {
            await nodemailer_1.EmailService.sendPasswordResetOtp(email, code);
        }
        return { email, message: 'Verification code sent successfully' };
    }
    async login(userData, meta) {
        const email = userData.email.trim().toLowerCase();
        const user = await user_repository_1.default.findByEmailWithPassword(email);
        if (!user) {
            throw error_1.invalidCredentials;
        }
        if (user.provider === enum_1.Provider.LOCAL && !user.isVerified) {
            throw error_1.userNotVerified;
        }
        // Account locking mechanism
        if (user.lockUntil && user.lockUntil > new Date()) {
            const remainingSeconds = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000);
            throw new app_error_1.AppError(`Too many failed attempts. Account locked. Try again in ${remainingSeconds}s`, 429);
        }
        if (user.lockUntil && user.lockUntil <= new Date()) {
            user.failedLoginAttempts = 0;
            user.lockUntil = null;
        }
        const isMatch = await (0, hash_1.comparePassword)(userData.password, user.password || '');
        if (!isMatch) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + (0, time_1.toMs)(15, 'minutes'));
                await user.save();
                throw new app_error_1.AppError('Too many failed attempts. Account locked for 15 minutes', 429);
            }
            await user.save();
            throw new app_error_1.AppError(`Invalid credentials. ${5 - user.failedLoginAttempts} attempts remaining`, 401);
        }
        // Reset failed login attempts on successful login
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();
        return this.createAuthSession(user, meta);
    }
    async refreshToken(refreshTokenStr, meta) {
        if (!refreshTokenStr) {
            throw new app_error_1.AppError('Refresh token is required', 400);
        }
        let payload;
        try {
            payload = (0, token_1.verifyRefreshToken)(refreshTokenStr);
        }
        catch {
            throw error_1.tokenRevoked;
        }
        const session = await session_repository_1.default.findActiveSession(refreshTokenStr);
        if (!session) {
            throw error_1.tokenRevoked;
        }
        const user = await user_repository_1.default.findById(payload.id);
        if (!user) {
            throw error_1.userNotExist;
        }
        // Revoke the used refresh token (Token rotation pattern for security)
        await session_repository_1.default.revokeSession(refreshTokenStr);
        // Generate a new session with new tokens
        return this.createAuthSession(user, meta);
    }
    async logout(refreshTokenStr) {
        if (refreshTokenStr) {
            await session_repository_1.default.revokeSession(refreshTokenStr);
        }
        return { message: 'Logged out successfully' };
    }
    async logoutAll(userId) {
        await session_repository_1.default.revokeAllUserSessions(userId);
        return { message: 'All sessions revoked successfully' };
    }
    async forgotPassword(email) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await user_repository_1.default.findByEmail(normalizedEmail);
        if (!user) {
            throw error_1.userNotExist;
        }
        await otp_repository_1.default.deleteOtpByEmail(normalizedEmail, 'PASSWORD_RESET');
        const code = (0, otp_1.generateOtp)();
        await otp_repository_1.default.createOtp({
            email: normalizedEmail,
            code,
            type: 'PASSWORD_RESET',
            expiresAt: new Date(Date.now() + (0, time_1.toMs)(10, 'minutes'))
        });
        const resetLink = `http://localhost:3000/api/auth/reset-password?email=${encodeURIComponent(normalizedEmail)}&code=${code}`;
        await nodemailer_1.EmailService.sendPasswordResetOtp(normalizedEmail, code, resetLink);
        return { message: 'Password reset OTP sent to your email' };
    }
    async resetPassword(data) {
        const email = data.email.trim().toLowerCase();
        const user = await user_repository_1.default.findByEmail(email);
        if (!user) {
            throw error_1.userNotExist;
        }
        const otp = await otp_repository_1.default.findOtpByEmail(email, 'PASSWORD_RESET');
        if (!otp) {
            throw error_1.otpExpired;
        }
        if (String(otp.code) !== String(data.code).trim()) {
            throw error_1.invalidCode;
        }
        const hashedPassword = await (0, hash_1.hashPassword)(data.newPassword);
        await user_repository_1.default.update({ email }, {
            password: hashedPassword,
            failedLoginAttempts: 0,
            lockUntil: null
        });
        // Invalidate all existing sessions for security
        await session_repository_1.default.revokeAllUserSessions(user._id);
        await otp_repository_1.default.deleteOtpByEmail(email, 'PASSWORD_RESET');
        return { message: 'Password reset successfully. Please login with your new password.' };
    }
    async loginWithGoogle(idToken, meta) {
        const googleUser = await (0, google_1.verifyGoogleToken)(idToken);
        const email = googleUser.email.trim().toLowerCase();
        let user = await user_repository_1.default.findByEmail(email);
        if (!user) {
            let userName = googleUser.name.replace(/\s+/g, '_').toLowerCase();
            const existingUserName = await user_repository_1.default.findByUserName(userName);
            if (existingUserName) {
                userName = `${userName}_${Math.floor(Math.random() * 1000)}`;
            }
            user = await user_repository_1.default.create({
                userName,
                email,
                provider: enum_1.Provider.GOOGLE,
                gender: enum_1.Gender.MALE,
                isVerified: true,
                isPrivate: false,
                profilePic: googleUser.picture || ''
            });
        }
        return this.createAuthSession(user, meta);
    }
    async createAuthSession(user, meta) {
        const tokenPayload = {
            id: user._id.toString(),
            email: user.email,
            userName: user.userName
        };
        const refreshToken = (0, token_1.generateRefreshToken)(tokenPayload);
        const accessToken = (0, token_1.generateAccessToken)(tokenPayload);
        // Store session in database (7 days expiration)
        const sessionExpiry = new Date(Date.now() + (0, time_1.toMs)(7, 'days'));
        await session_repository_1.default.createSession({
            userId: user._id,
            token: refreshToken,
            expiresAt: sessionExpiry,
            userAgent: meta?.userAgent,
            ipAddress: meta?.ipAddress
        });
        const userObj = user.toObject ? user.toObject() : user;
        delete userObj.password;
        return {
            accessToken,
            refreshToken,
            user: userObj
        };
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
