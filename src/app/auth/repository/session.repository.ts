import { Types } from 'mongoose';
import { AbstractRepository } from '../../../lib/db/abstract.repository';
import { ISession, Session } from '../model/session.model';

class SessionRepository extends AbstractRepository<ISession> {
    constructor() {
        super(Session);
    }

    async findActiveSession(token: string): Promise<ISession | null> {
        return this.model.findOne({
            token,
            isRevoked: false,
            expiresAt: { $gt: new Date() }
        });
    }

    async revokeSession(token: string): Promise<ISession | null> {
        return this.model.findOneAndUpdate(
            { token },
            { isRevoked: true },
            { new: true }
        );
    }

    async revokeAllUserSessions(userId: string | Types.ObjectId): Promise<any> {
        return this.model.updateMany(
            { userId: new Types.ObjectId(userId) },
            { isRevoked: true }
        );
    }

    async createSession(data: {
        userId: Types.ObjectId | string;
        token: string;
        expiresAt: Date;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<ISession> {
        return this.model.create({
            userId: new Types.ObjectId(data.userId),
            token: data.token,
            expiresAt: data.expiresAt,
            userAgent: data.userAgent || '',
            ipAddress: data.ipAddress || '',
            isRevoked: false
        });
    }
}

export default new SessionRepository();
