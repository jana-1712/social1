"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const abstract_repository_1 = require("../../../lib/db/abstract.repository");
const follow_model_1 = require("../model/follow.model");
class FollowRepository extends abstract_repository_1.AbstractRepository {
    constructor() {
        super(follow_model_1.Follow);
    }
    async findRelationship(followerId, followingId) {
        return this.model.findOne({
            followerId: new mongoose_1.Types.ObjectId(followerId),
            followingId: new mongoose_1.Types.ObjectId(followingId)
        });
    }
    async createOrUpdateFollow(followerId, followingId, status) {
        return this.model.findOneAndUpdate({
            followerId: new mongoose_1.Types.ObjectId(followerId),
            followingId: new mongoose_1.Types.ObjectId(followingId)
        }, {
            followerId: new mongoose_1.Types.ObjectId(followerId),
            followingId: new mongoose_1.Types.ObjectId(followingId),
            status
        }, { upsert: true, new: true });
    }
    async removeFollow(followerId, followingId) {
        return this.model.findOneAndDelete({
            followerId: new mongoose_1.Types.ObjectId(followerId),
            followingId: new mongoose_1.Types.ObjectId(followingId)
        });
    }
    async getFollowers(userId, skip = 0, limit = 20) {
        const filter = {
            followingId: new mongoose_1.Types.ObjectId(userId),
            status: 'ACCEPTED'
        };
        const [list, total] = await Promise.all([
            this.model.find(filter)
                .populate('followerId', 'userName email profilePic bio isPrivate')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.model.countDocuments(filter)
        ]);
        return { list: list.map(item => item.followerId), total };
    }
    async getFollowing(userId, skip = 0, limit = 20) {
        const filter = {
            followerId: new mongoose_1.Types.ObjectId(userId),
            status: 'ACCEPTED'
        };
        const [list, total] = await Promise.all([
            this.model.find(filter)
                .populate('followingId', 'userName email profilePic bio isPrivate')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.model.countDocuments(filter)
        ]);
        return { list: list.map(item => item.followingId), total };
    }
    async getPendingRequests(userId, skip = 0, limit = 20) {
        const filter = {
            followingId: new mongoose_1.Types.ObjectId(userId),
            status: 'PENDING'
        };
        const [list, total] = await Promise.all([
            this.model.find(filter)
                .populate('followerId', 'userName email profilePic bio')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.model.countDocuments(filter)
        ]);
        return { list, total };
    }
    async getFollowingIds(userId) {
        const relationships = await this.model.find({
            followerId: new mongoose_1.Types.ObjectId(userId),
            status: 'ACCEPTED'
        }).select('followingId');
        return relationships.map(r => r.followingId);
    }
}
exports.default = new FollowRepository();
