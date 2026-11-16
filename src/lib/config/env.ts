import 'dotenv/config';

export const env = {
    port: Number(process.env.PORT || 3000),
    db: {
        url: (process.env.DB_URL || 'mongodb://127.0.0.1:27017/social-app').trim()
    },
    jwt: {
        secret: (process.env.JWT_SECRET || 'super_secret_jwt_access_key_social_app_2026').trim(),
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m').trim(),
        refreshSecret: (process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_social_app_2026').trim(),
        refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d').trim()
    },
    nodemailer: {
        user: (process.env.MAIL_USER || '').trim(),
        password: (process.env.MAIL_PASSWORD || '').trim()
    },
    google: {
        clientId: (process.env.GOOGLE_WEB_OAUTH_CLIENT_ID || '').trim()
    },
    clientUrl: (process.env.CLIENT_URL || 'http://localhost:3000').trim()
};
