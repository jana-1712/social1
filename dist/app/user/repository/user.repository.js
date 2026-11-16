"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../user.model"));
const abstract_repository_1 = require("../../../lib/db/abstract.repository");
const mongoose_1 = require("mongoose");
class UserRepository extends abstract_repository_1.AbstractRepository {
    constructor() {
        super(user_model_1.default);
    }
    async findByEmail(email) {
        return this.model.findOne({ email: email.trim().toLowerCase() });
    }
    async findByEmailWithPassword(email) {
        return this.model.findOne({ email: email.trim().toLowerCase() }).select('+password');
    }
    async findByUserName(userName) {
        return this.model.findOne({ userName: userName.trim() });
    }
    async searchUsers(query, excludeUserId, limit = 20, skip = 0) {
        const trimmed = query.trim();
        const regex = new RegExp(trimmed, 'i');
        const filter = {
            $or: [
                { userName: { $regex: regex } },
                { email: { $regex: regex } }
            ]
        };
        if (excludeUserId) {
            filter._id = { $ne: new mongoose_1.Types.ObjectId(excludeUserId) };
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
    async getSuggestions(excludeIds, limit = 10) {
        return this.model.find({
            _id: { $nin: excludeIds }
        })
            .select('userName email profilePic bio isPrivate followersCount followingCount')
            .sort({ followersCount: -1, createdAt: -1 })
            .limit(limit);
    }
    async updateFollowersCount(userId, change) {
        return this.model.findByIdAndUpdate(userId, { $inc: { followersCount: change } }, { new: true });
    }
    async updateFollowingCount(userId, change) {
        return this.model.findByIdAndUpdate(userId, { $inc: { followingCount: change } }, { new: true });
    }
}
exports.default = new UserRepository();
