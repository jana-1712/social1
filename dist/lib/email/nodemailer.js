"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
let transporter = null;
function getTransporter() {
    if (!transporter) {
        transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: env_1.env.nodemailer.user,
                pass: env_1.env.nodemailer.password
            }
        });
    }
    return transporter;
}
class EmailService {
    static async sendMail(to, subject, html) {
        if (!env_1.env.nodemailer.user || !env_1.env.nodemailer.password) {
            console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
            console.log(`[Email Mock Body]:\n${html}`);
            return true;
        }
        try {
            await getTransporter().sendMail({
                from: {
                    name: 'Social App',
                    address: env_1.env.nodemailer.user
                },
                to,
                subject,
                html
            });
            return true;
        }
        catch (error) {
            console.error('Failed to send email:', error);
            // Log code to console as fallback so testing never gets blocked
            console.log(`[Email Fallback] Email send failed. Content for ${to}: ${subject}`);
            throw error;
        }
    }
    static async sendVerificationOtp(to, otp) {
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Welcome to Social App!</h2>
                <p>Please use the following 6-digit code to verify your email address:</p>
                <h1 style="color: #4CAF50; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
        `;
        return this.sendMail(to, 'Verify Your Social App Account', html);
    }
    static async sendPasswordResetOtp(to, otp, resetLink) {
        const linkHtml = resetLink ? `<p>Or click this secure link to reset your password: <a href="${resetLink}">Reset Password</a></p>` : '';
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. Use the following OTP code:</p>
                <h1 style="color: #E53935; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
                ${linkHtml}
                <p>This code is valid for 10 minutes.</p>
                <p>If you did not request a password reset, please secure your account immediately.</p>
            </div>
        `;
        return this.sendMail(to, 'Password Reset Code - Social App', html);
    }
}
exports.EmailService = EmailService;
