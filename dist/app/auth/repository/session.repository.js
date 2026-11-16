"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const abstract_repository_1 = require("../../../lib/db/abstract.repository");
const session_model_1 = require("../model/session.model");
class SessionRepository extends abstract_repository_1.AbstractRepository {
    constructor() {
        super(session_model_1.Session);
    }
    async findActiveSession(token) {
        return this.model.findOne({
            token,
            isRevoked: false,
            expiresAt: { $gt: new Date() }
        });
    }
    async revokeSession(token) {
        return this.model.findOneAndUpdate({ token }, { isRevoked: true }, { new: true });
    }
    async revokeAllUserSessions(userId) {
        return this.model.updateMany({ userId: new mongoose_1.Types.ObjectId(userId) }, { isRevoked: true });
    }
    async createSession(data) {
        return this.model.create({
            userId: new mongoose_1.Types.ObjectId(data.userId),
            token: data.token,
            expiresAt: data.expiresAt,
            userAgent: data.userAgent || '',
            ipAddress: data.ipAddress || '',
            isRevoked: false
        });
    }
}
exports.default = new SessionRepository();
