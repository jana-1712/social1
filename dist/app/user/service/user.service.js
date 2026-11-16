"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const mongoose_1 = require("mongoose");
const user_repository_1 = __importDefault(require("../repository/user.repository"));
const follow_repository_1 = __importDefault(require("../repository/follow.repository"));
const session_repository_1 = __importDefault(require("../../auth/repository/session.repository"));
const hash_1 = require("../../../lib/utils/hash");
const app_error_1 = require("../../../lib/error/app-error");
const error_1 = require("../../auth/error");
class UserService {
    async getMe(userId) {
        const user = await user_repository_1.default.findById(userId);
        if (!user) {
            throw error_1.userNotExist;
        }
        return user;
    }
    async getUserProfile(targetIdentifier, currentUserId) {
        let user;
        if (mongoose_1.Types.ObjectId.isValid(targetIdentifier)) {
            user = await user_repository_1.default.findById(targetIdentifier);
        }
        if (!user) {
            user = await user_repository_1.default.findByUserName(targetIdentifier);
        }
        if (!user) {
            throw error_1.userNotExist;
        }
        const isOwner = currentUserId && user._id.toString() === currentUserId;
        let followStatus = 'NONE';
        let isFollowing = false;
        if (currentUserId && !isOwner) {
            const rel = await follow_repository_1.default.findRelationship(currentUserId, user._id);
            if (rel) {
                followStatus = rel.status;
                isFollowing = rel.status === 'ACCEPTED';
            }
        }
        // Privacy Control: If profile is private and requester is NOT owner and NOT following
        if (user.isPrivate && !isOwner && !isFollowing) {
            return {
                _id: user._id,
                userName: user.userName,
                profilePic: user.profilePic || '',
                bio: user.bio || '',
                isPrivate: true,
                followersCount: user.followersCount,
                followingCount: user.followingCount,
                followStatus,
                isFollowing: false,
                isRestricted: true,
                message: 'This account is private. Follow this account to see full details.'
            };
        }
        const userObj = user.toObject ? user.toObject() : user;
        delete userObj.password;
        return {
            ...userObj,
            isOwner: !!isOwner,
            followStatus,
            isFollowing,
            isRestricted: false
        };
    }
    async updateProfile(userId, data) {
        const user = await user_repository_1.default.findById(userId);
        if (!user) {
            throw error_1.userNotExist;
        }
        if (data.userName && data.userName.trim() !== user.userName) {
            const existingUserName = await user_repository_1.default.findByUserName(data.userName);
            if (existingUserName && existingUserName._id.toString() !== userId) {
                throw new app_error_1.AppError('Username is already in use', 409);
            }
        }
        const updateData = {};
        if (data.userName)
            updateData.userName = data.userName.trim();
        if (data.bio !== undefined)
            updateData.bio = data.bio;
        if (data.phoneNumber !== undefined)
            updateData.phoneNumber = data.phoneNumber.trim();
        if (data.gender !== undefined)
            updateData.gender = data.gender;
        if (data.profilePic !== undefined)
            updateData.profilePic = data.profilePic;
        const updated = await user_repository_1.default.updateById(userId, updateData);
        return updated;
    }
    async followUser(currentUserId, targetUserId) {
        if (currentUserId === targetUserId) {
            throw new app_error_1.AppError('You cannot follow yourself', 400);
        }
        const targetUser = await user_repository_1.default.findById(targetUserId);
        if (!targetUser) {
            throw error_1.userNotExist;
        }
        const existing = await follow_repository_1.default.findRelationship(currentUserId, targetUserId);
        if (existing) {
            if (existing.status === 'ACCEPTED') {
                throw new app_error_1.AppError('You are already following this user', 400);
            }
            if (existing.status === 'PENDING') {
                throw new app_error_1.AppError('Follow request already pending', 400);
            }
        }
        // Privacy check: If target is private, require follow request
        if (targetUser.isPrivate) {
            await follow_repository_1.default.createOrUpdateFollow(currentUserId, targetUserId, 'PENDING');
            return {
                status: 'PENDING',
                message: 'Follow request sent to private account.'
            };
        }
        // Target is public: follow directly
        await follow_repository_1.default.createOrUpdateFollow(currentUserId, targetUserId, 'ACCEPTED');
        await Promise.all([
            user_repository_1.default.updateFollowingCount(currentUserId, 1),
            user_repository_1.default.updateFollowersCount(targetUserId, 1)
        ]);
        return {
            status: 'ACCEPTED',
            message: 'You are now following this user.'
        };
    }
    async unfollowUser(currentUserId, targetUserId) {
        if (currentUserId === targetUserId) {
            throw new app_error_1.AppError('You cannot unfollow yourself', 400);
        }
        const relationship = await follow_repository_1.default.findRelationship(currentUserId, targetUserId);
        if (!relationship) {
            throw new app_error_1.AppError('You are not following or requesting this user', 400);
        }
        await follow_repository_1.default.removeFollow(currentUserId, targetUserId);
        if (relationship.status === 'ACCEPTED') {
            await Promise.all([
                user_repository_1.default.updateFollowingCount(currentUserId, -1),
                user_repository_1.default.updateFollowersCount(targetUserId, -1)
            ]);
        }
        return {
            message: relationship.status === 'PENDING'
                ? 'Follow request cancelled'
                : 'User unfollowed successfully'
        };
    }
    async getFollowers(targetUserId, currentUserId, page = 1, limit = 20) {
        const targetUser = await user_repository_1.default.findById(targetUserId);
        if (!targetUser) {
            throw error_1.userNotExist;
        }
        // Privacy check
        if (targetUser.isPrivate && currentUserId !== targetUserId) {
            const rel = currentUserId ? await follow_repository_1.default.findRelationship(currentUserId, targetUserId) : null;
            if (!rel || rel.status !== 'ACCEPTED') {
                throw new app_error_1.AppError('This account is private. Follow this account to see followers.', 403);
            }
        }
        const skip = (page - 1) * limit;
        return follow_repository_1.default.getFollowers(targetUserId, skip, limit);
    }
    async getFollowing(targetUserId, currentUserId, page = 1, limit = 20) {
        const targetUser = await user_repository_1.default.findById(targetUserId);
        if (!targetUser) {
            throw error_1.userNotExist;
        }
        // Privacy check
        if (targetUser.isPrivate && currentUserId !== targetUserId) {
            const rel = currentUserId ? await follow_repository_1.default.findRelationship(currentUserId, targetUserId) : null;
            if (!rel || rel.status !== 'ACCEPTED') {
                throw new app_error_1.AppError('This account is private. Follow this account to see following list.', 403);
            }
        }
        const skip = (page - 1) * limit;
        return follow_repository_1.default.getFollowing(targetUserId, skip, limit);
    }
    async getPendingRequests(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        return follow_repository_1.default.getPendingRequests(userId, skip, limit);
    }
    async respondToFollowRequest(userId, requestId, action) {
        const request = await follow_repository_1.default.findById(requestId);
        if (!request || request.followingId.toString() !== userId || request.status !== 'PENDING') {
            throw new app_error_1.AppError('Pending follow request not found', 404);
        }
        if (action === 'ACCEPT') {
            request.status = 'ACCEPTED';
            await request.save();
            await Promise.all([
                user_repository_1.default.updateFollowersCount(userId, 1),
                user_repository_1.default.updateFollowingCount(request.followerId, 1)
            ]);
            return { message: 'Follow request accepted' };
        }
        else {
            await follow_repository_1.default.delete(request._id);
            return { message: 'Follow request rejected' };
        }
    }
    async searchUsers(query, currentUserId, page = 1, limit = 20) {
        if (!query || query.trim().length === 0) {
            return { users: [], total: 0 };
        }
        const skip = (page - 1) * limit;
        const result = await user_repository_1.default.searchUsers(query, currentUserId, limit, skip);
        // Augment with follow status if currentUserId is provided
        if (currentUserId && result.users.length > 0) {
            const followingIds = await follow_repository_1.default.getFollowingIds(currentUserId);
            const followingSet = new Set(followingIds.map(id => id.toString()));
            const augmented = result.users.map((u) => {
                const uObj = u.toObject ? u.toObject() : u;
                uObj.isFollowing = followingSet.has(u._id.toString());
                return uObj;
            });
            return { users: augmented, total: result.total };
        }
        return result;
    }
    async getSuggestions(currentUserId, limit = 10) {
        const followingIds = await follow_repository_1.default.getFollowingIds(currentUserId);
        const excludeIds = [new mongoose_1.Types.ObjectId(currentUserId), ...followingIds];
        return user_repository_1.default.getSuggestions(excludeIds, limit);
    }
    async updatePrivacy(userId, isPrivate) {
        const user = await user_repository_1.default.updateById(userId, { isPrivate });
        if (!user) {
            throw error_1.userNotExist;
        }
        // If toggled from private to public, automatically accept all pending requests
        if (!isPrivate) {
            const pendingRequests = await follow_repository_1.default.find({
                followingId: new mongoose_1.Types.ObjectId(userId),
                status: 'PENDING'
            });
            if (pendingRequests.length > 0) {
                for (const req of pendingRequests) {
                    req.status = 'ACCEPTED';
                    await req.save();
                    await user_repository_1.default.updateFollowingCount(req.followerId, 1);
                }
                await user_repository_1.default.updateFollowersCount(userId, pendingRequests.length);
            }
        }
        return {
            isPrivate: user.isPrivate,
            message: `Account is now ${user.isPrivate ? 'Private' : 'Public'}`
        };
    }
    async changePassword(userId, data) {
        const user = await user_repository_1.default.findByEmailWithPassword((await user_repository_1.default.findById(userId))?.email || '');
        if (!user) {
            throw error_1.userNotExist;
        }
        const isMatch = await (0, hash_1.comparePassword)(data.oldPassword, user.password || '');
        if (!isMatch) {
            throw new app_error_1.AppError('Incorrect old password', 400);
        }
        const newHash = await (0, hash_1.hashPassword)(data.newPassword);
        user.password = newHash;
        await user.save();
        // Invalidate all active sessions for security
        await session_repository_1.default.revokeAllUserSessions(userId);
        return { message: 'Password changed successfully. Please login again.' };
    }
}
exports.UserService = UserService;
exports.default = new UserService();
