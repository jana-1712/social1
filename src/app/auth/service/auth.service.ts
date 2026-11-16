import { RegisterDto, LoginDto, SendOtpDto, VerifyAccountDto, ResetPasswordDto } from '../dto';
import userRepository from '../../user/repository/user.repository';
import otpRepository from '../repository/otp.repository';
import sessionRepository from '../repository/session.repository';
import { hashPassword, comparePassword } from '../../../lib/utils/hash';
import { generateOtp } from '../../../lib/utils/otp';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../lib/utils/token';
import { verifyGoogleToken } from '../../../lib/utils/google';
import { EmailService } from '../../../lib/email/nodemailer';
import { AppError } from '../../../lib/error/app-error';
import { Provider, Gender } from '../enum/enum';
import {
    userExist,
    userNotExist,
    userNotVerified,
    userVerified,
    invalidCode,
    otpExpired,
    invalidCredentials,
    tokenRevoked
} from '../error';
import { toMs } from '../../../pkg/utils/time';

export class AuthService {
    async register(userData: RegisterDto) {
        const email = userData.email.trim().toLowerCase();
        const userName = userData.userName.trim();

        const existingEmail = await userRepository.findByEmail(email);
        if (existingEmail) {
            throw userExist;
        }

        const existingUserName = await userRepository.findByUserName(userName);
        if (existingUserName) {
            throw new AppError('Username is already taken', 409);
        }

        const hashedPassword = await hashPassword(userData.password);

        const createdUser = await userRepository.create({
            userName,
            email,
            password: hashedPassword,
            phoneNumber: userData.phoneNumber || '',
            gender: userData.gender !== undefined ? userData.gender : Gender.MALE,
            provider: Provider.LOCAL,
            isVerified: false,
            isPrivate: false
        });

        // Generate 6-digit OTP
        const code = generateOtp();
        await otpRepository.deleteOtpByEmail(email, 'VERIFICATION');
        await otpRepository.createOtp({
            email,
            code,
            type: 'VERIFICATION',
            expiresAt: new Date(Date.now() + toMs(10, 'minutes'))
        });

        // Send verification email
        try {
            await EmailService.sendVerificationOtp(email, code);
        } catch (error) {
            console.error('Failed to send verification email:', error);
        }

        const userObj = createdUser.toObject ? createdUser.toObject() : createdUser;
        delete (userObj as any).password;

        return userObj;
    }

    async verifyAccount(data: VerifyAccountDto) {
        const email = data.email.trim().toLowerCase();
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw userNotExist;
        }

        if (user.isVerified) {
            throw userVerified;
        }

        const otp = await otpRepository.findOtpByEmail(email, 'VERIFICATION');
        if (!otp) {
            throw otpExpired;
        }

        if (String(otp.code) !== String(data.code).trim()) {
            throw invalidCode;
        }

        const updatedUser = await userRepository.update(
            { email },
            { isVerified: true }
        );

        await otpRepository.deleteOtpByEmail(email, 'VERIFICATION');

        return updatedUser;
    }

    async sendOtp(data: SendOtpDto, type: 'VERIFICATION' | 'PASSWORD_RESET' = 'VERIFICATION') {
        const email = data.email.trim().toLowerCase();
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw userNotExist;
        }

        if (type === 'VERIFICATION' && user.isVerified) {
            throw userVerified;
        }

        await otpRepository.deleteOtpByEmail(email, type);

        const code = generateOtp();
        await otpRepository.createOtp({
            email,
            code,
            type,
            expiresAt: new Date(Date.now() + toMs(10, 'minutes'))
        });

        if (type === 'VERIFICATION') {
            await EmailService.sendVerificationOtp(email, code);
        } else {
            await EmailService.sendPasswordResetOtp(email, code);
        }

        return { email, message: 'Verification code sent successfully' };
    }

    async login(userData: LoginDto, meta?: { userAgent?: string; ipAddress?: string }) {
        const email = userData.email.trim().toLowerCase();
        const user = await userRepository.findByEmailWithPassword(email);

        if (!user) {
            throw invalidCredentials;
        }

        if (user.provider === Provider.LOCAL && !user.isVerified) {
            throw userNotVerified;
        }

        // Account locking mechanism
        if (user.lockUntil && user.lockUntil > new Date()) {
            const remainingSeconds = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000);
            throw new AppError(`Too many failed attempts. Account locked. Try again in ${remainingSeconds}s`, 429);
        }

        if (user.lockUntil && user.lockUntil <= new Date()) {
            user.failedLoginAttempts = 0;
            user.lockUntil = null;
        }

        const isMatch = await comparePassword(userData.password, user.password || '');
        if (!isMatch) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + toMs(15, 'minutes'));
                await user.save();
                throw new AppError('Too many failed attempts. Account locked for 15 minutes', 429);
            }
            await user.save();
            throw new AppError(`Invalid credentials. ${5 - user.failedLoginAttempts} attempts remaining`, 401);
        }

        // Reset failed login attempts on successful login
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        return this.createAuthSession(user, meta);
    }

    async refreshToken(refreshTokenStr: string, meta?: { userAgent?: string; ipAddress?: string }) {
        if (!refreshTokenStr) {
            throw new AppError('Refresh token is required', 400);
        }

        let payload;
        try {
            payload = verifyRefreshToken(refreshTokenStr);
        } catch {
            throw tokenRevoked;
        }

        const session = await sessionRepository.findActiveSession(refreshTokenStr);
        if (!session) {
            throw tokenRevoked;
        }

        const user = await userRepository.findById(payload.id);
        if (!user) {
            throw userNotExist;
        }

        // Revoke the used refresh token (Token rotation pattern for security)
        await sessionRepository.revokeSession(refreshTokenStr);

        // Generate a new session with new tokens
        return this.createAuthSession(user, meta);
    }

    async logout(refreshTokenStr?: string) {
        if (refreshTokenStr) {
            await sessionRepository.revokeSession(refreshTokenStr);
        }
        return { message: 'Logged out successfully' };
    }

    async logoutAll(userId: string) {
        await sessionRepository.revokeAllUserSessions(userId);
        return { message: 'All sessions revoked successfully' };
    }

    async forgotPassword(email: string) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await userRepository.findByEmail(normalizedEmail);

        if (!user) {
            throw userNotExist;
        }

        await otpRepository.deleteOtpByEmail(normalizedEmail, 'PASSWORD_RESET');

        const code = generateOtp();
        await otpRepository.createOtp({
            email: normalizedEmail,
            code,
            type: 'PASSWORD_RESET',
            expiresAt: new Date(Date.now() + toMs(10, 'minutes'))
        });

        const resetLink = `http://localhost:3000/api/auth/reset-password?email=${encodeURIComponent(normalizedEmail)}&code=${code}`;
        await EmailService.sendPasswordResetOtp(normalizedEmail, code, resetLink);

        return { message: 'Password reset OTP sent to your email' };
    }

    async resetPassword(data: ResetPasswordDto) {
        const email = data.email.trim().toLowerCase();
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw userNotExist;
        }

        const otp = await otpRepository.findOtpByEmail(email, 'PASSWORD_RESET');
        if (!otp) {
            throw otpExpired;
        }

        if (String(otp.code) !== String(data.code).trim()) {
            throw invalidCode;
        }

        const hashedPassword = await hashPassword(data.newPassword);

        await userRepository.update(
            { email },
            {
                password: hashedPassword,
                failedLoginAttempts: 0,
                lockUntil: null
            }
        );

        // Invalidate all existing sessions for security
        await sessionRepository.revokeAllUserSessions(user._id);
        await otpRepository.deleteOtpByEmail(email, 'PASSWORD_RESET');

        return { message: 'Password reset successfully. Please login with your new password.' };
    }

    async loginWithGoogle(idToken: string, meta?: { userAgent?: string; ipAddress?: string }) {
        const googleUser = await verifyGoogleToken(idToken);
        const email = googleUser.email.trim().toLowerCase();

        let user = await userRepository.findByEmail(email);

        if (!user) {
            let userName = googleUser.name.replace(/\s+/g, '_').toLowerCase();
            const existingUserName = await userRepository.findByUserName(userName);
            if (existingUserName) {
                userName = `${userName}_${Math.floor(Math.random() * 1000)}`;
            }

            user = await userRepository.create({
                userName,
                email,
                provider: Provider.GOOGLE,
                gender: Gender.MALE,
                isVerified: true,
                isPrivate: false,
                profilePic: googleUser.picture || ''
            });
        }

        return this.createAuthSession(user, meta);
    }

    private async createAuthSession(user: any, meta?: { userAgent?: string; ipAddress?: string }) {
        const tokenPayload = {
            id: user._id.toString(),
            email: user.email,
            userName: user.userName
        };

        const refreshToken = generateRefreshToken(tokenPayload);
        const accessToken = generateAccessToken(tokenPayload);

        // Store session in database (7 days expiration)
        const sessionExpiry = new Date(Date.now() + toMs(7, 'days'));
        await sessionRepository.createSession({
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

export default new AuthService();
