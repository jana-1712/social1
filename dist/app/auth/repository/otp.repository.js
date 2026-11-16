"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_repository_1 = require("../../../lib/db/abstract.repository");
const otp_model_1 = require("../model/otp.model");
class OtpRepository extends abstract_repository_1.AbstractRepository {
    constructor() {
        super(otp_model_1.Otp);
    }
    async findOtpByEmail(email, type = 'VERIFICATION') {
        return this.model.findOne({
            email: email.trim().toLowerCase(),
            type
        }).sort({ createdAt: -1 });
    }
    async deleteOtpByEmail(email, type) {
        const filter = { email: email.trim().toLowerCase() };
        if (type)
            filter.type = type;
        return this.model.deleteMany(filter);
    }
    async createOtp(data) {
        return this.model.create({
            email: data.email.trim().toLowerCase(),
            code: data.code,
            type: data.type || 'VERIFICATION',
            expiresAt: data.expiresAt
        });
    }
}
exports.default = new OtpRepository();
