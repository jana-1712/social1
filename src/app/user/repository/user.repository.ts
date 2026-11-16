import { IUser } from '../../../lib/interface/iuser';
import User from '../user.model';
import { AbstractRepository } from '../../../lib/db/abstract.repository';
import { Types } from 'mongoose';

class UserRepository extends AbstractRepository<IUser> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string) {
        return this.model.findOne({ email: email.trim().toLowerCase() });
    }

    async findByEmailWithPassword(email: string) {
        return this.model.findOne({ email: email.trim().toLowerCase() }).select('+password');
    }

    async findByUserName(userName: string) {
        return this.model.findOne({ userName: userName.trim() });
    }

    async searchUsers(query: string, excludeUserId?: string, limit: number = 20, skip: number = 0) {
        const trimmed = query.trim();
        const regex = new RegExp(trimmed, 'i');

        const filter: any = {
            $or: [
                { userName: { $regex: regex } },
                { email: { $regex: regex } }
            ]
        };

        if (excludeUserId) {
            filter._id = { $ne: new Types.ObjectId(excludeUserId) };
        }

        const [users, total] = await Promise.all([
            this.model.find(filter)
                .select('userName email profilePic bio isPrivate followersCount followingCount createdAt')
                .skip(skip)
                .limit(limit),
            this.model.countDocuments(filter)
        ]);

        return { users, total };
    }

    async getSuggestions(excludeIds: (string | Types.ObjectId)[], limit: number = 10) {
        return this.model.find({
            _id: { $nin: excludeIds }
        })
            .select('userName email profilePic bio isPrivate followersCount followingCount')
            .sort({ followersCount: -1, createdAt: -1 })
            .limit(limit);
    }

    async updateFollowersCount(userId: string | Types.ObjectId, change: number) {
        return this.model.findByIdAndUpdate(
            userId,
            { $inc: { followersCount: change } },
            { new: true }
        );
    }

    async updateFollowingCount(userId: string | Types.ObjectId, change: number) {
        return this.model.findByIdAndUpdate(
            userId,
            { $inc: { followingCount: change } },
            { new: true }
        );
    }
}

export default new UserRepository();
