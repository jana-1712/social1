import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: any = null;

function getTransporter(): any {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env.nodemailer.user,
                pass: env.nodemailer.password
            }
        });
    }
    return transporter;
}

export class EmailService {
    static async sendMail(to: string, subject: string, html: string): Promise<boolean> {
        if (!env.nodemailer.user || !env.nodemailer.password) {
            console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
            console.log(`[Email Mock Body]:\n${html}`);
            return true;
        }

        try {
            await getTransporter().sendMail({
                from: {
                    name: 'Social App',
                    address: env.nodemailer.user
                },
                to,
                subject,
                html
            });
            return true;
        } catch (error) {
            console.error('Failed to send email:', error);
            // Log code to console as fallback so testing never gets blocked
            console.log(`[Email Fallback] Email send failed. Content for ${to}: ${subject}`);
            throw error;
        }
    }

    static async sendVerificationOtp(to: string, otp: string): Promise<boolean> {
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

    static async sendPasswordResetOtp(to: string, otp: string, resetLink?: string): Promise<boolean> {
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
