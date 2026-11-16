import { AbstractRepository } from '../../../lib/db/abstract.repository';
import { IOtp, Otp, OtpType } from '../model/otp.model';

class OtpRepository extends AbstractRepository<IOtp> {
    constructor() {
        super(Otp);
    }

    async findOtpByEmail(email: string, type: OtpType = 'VERIFICATION'): Promise<IOtp | null> {
        return this.model.findOne({
            email: email.trim().toLowerCase(),
            type
        }).sort({ createdAt: -1 });
    }

    async deleteOtpByEmail(email: string, type?: OtpType): Promise<any> {
        const filter: any = { email: email.trim().toLowerCase() };
        if (type) filter.type = type;
        return this.model.deleteMany(filter);
    }

    async createOtp(data: { email: string; code: string; type?: OtpType; expiresAt: Date }): Promise<IOtp> {
        return this.model.create({
            email: data.email.trim().toLowerCase(),
            code: data.code,
            type: data.type || 'VERIFICATION',
            expiresAt: data.expiresAt
        });
    }
}

export default new OtpRepository();
