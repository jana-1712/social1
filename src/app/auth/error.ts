import { AppError } from '../../lib/error/app-error';

export const userExist = new AppError('User already exists with this email', 409);
export const userNotExist = new AppError('User does not exist', 404);
export const userNotVerified = new AppError('Please verify your email first before logging in', 403);
export const userVerified = new AppError('Account is already verified', 400);
export const invalidCode = new AppError('Invalid verification code', 400);
export const otpExpired = new AppError('Verification code has expired or was not requested', 400);
export const invalidCredentials = new AppError('Invalid email or password', 401);
export const unauthorized = new AppError('Unauthorized access, please login first', 401);
export const tokenRevoked = new AppError('Session has expired or token was revoked. Please login again.', 401);
