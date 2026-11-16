import { Types } from 'mongoose';
import { AbstractRepository } from '../../../lib/db/abstract.repository';
import { IFollow, Follow, FollowStatus } from '../model/follow.model';

class FollowRepository extends AbstractRepository<IFollow> {
    constructor() {
        super(Follow);
    }

    async findRelationship(
        followerId: string | Types.ObjectId,
        followingId: string | Types.ObjectId
    ): Promise<IFollow | null> {
        return this.model.findOne({
            followerId: new Types.ObjectId(followerId),
            followingId: new Types.ObjectId(followingId)
        });
    }

    async createOrUpdateFollow(
        followerId: string | Types.ObjectId,
        followingId: string | Types.ObjectId,
        status: FollowStatus
    ): Promise<IFollow> {
        return this.model.findOneAndUpdate(
            {
                followerId: new Types.ObjectId(followerId),
                followingId: new Types.ObjectId(followingId)
            },
            {
                followerId: new Types.ObjectId(followerId),
                followingId: new Types.ObjectId(followingId),
                status
            },
            { upsert: true, new: true }
        );
    }

    async removeFollow(
        followerId: string | Types.ObjectId,
        followingId: string | Types.ObjectId
    ): Promise<any> {
        return this.model.findOneAndDelete({
            followerId: new Types.ObjectId(followerId),
            followingId: new Types.ObjectId(followingId)
        });
    }

    async getFollowers(
        userId: string | Types.ObjectId,
        skip: number = 0,
        limit: number = 20
    ) {
        const filter = {
            followingId: new Types.ObjectId(userId),
            status: 'ACCEPTED' as FollowStatus
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

    async getFollowing(
        userId: string | Types.ObjectId,
        skip: number = 0,
        limit: number = 20
    ) {
        const filter = {
            followerId: new Types.ObjectId(userId),
            status: 'ACCEPTED' as FollowStatus
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

    async getPendingRequests(
        userId: string | Types.ObjectId,
        skip: number = 0,
        limit: number = 20
    ) {
        const filter = {
            followingId: new Types.ObjectId(userId),
            status: 'PENDING' as FollowStatus
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

    async getFollowingIds(userId: string | Types.ObjectId): Promise<Types.ObjectId[]> {
        const relationships = await this.model.find({
            followerId: new Types.ObjectId(userId),
            status: 'ACCEPTED'
        }).select('followingId');

        return relationships.map(r => r.followingId);
    }
}

export default new FollowRepository();
