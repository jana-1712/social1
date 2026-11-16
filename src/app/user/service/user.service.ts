import { Types } from 'mongoose';
import userRepository from '../repository/user.repository';
import followRepository from '../repository/follow.repository';
import sessionRepository from '../../auth/repository/session.repository';
import { hashPassword, comparePassword } from '../../../lib/utils/hash';
import { AppError } from '../../../lib/error/app-error';
import { userNotExist, invalidCredentials } from '../../auth/error';
import { UpdateProfileDto, ChangePasswordDto } from '../dto';

export class UserService {
    async getMe(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw userNotExist;
        }
        return user;
    }

    async getUserProfile(targetIdentifier: string, currentUserId?: string) {
        let user;
        if (Types.ObjectId.isValid(targetIdentifier)) {
            user = await userRepository.findById(targetIdentifier);
        }
        if (!user) {
            user = await userRepository.findByUserName(targetIdentifier);
        }
        if (!user) {
            throw userNotExist;
        }

        const isOwner = currentUserId && user._id.toString() === currentUserId;

        let followStatus: 'ACCEPTED' | 'PENDING' | 'NONE' = 'NONE';
        let isFollowing = false;

        if (currentUserId && !isOwner) {
            const rel = await followRepository.findRelationship(currentUserId, user._id);
            if (rel) {
                followStatus = rel.status as 'ACCEPTED' | 'PENDING';
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

    async updateProfile(userId: string, data: UpdateProfileDto) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw userNotExist;
        }

        if (data.userName && data.userName.trim() !== user.userName) {
            const existingUserName = await userRepository.findByUserName(data.userName);
            if (existingUserName && existingUserName._id.toString() !== userId) {
                throw new AppError('Username is already in use', 409);
            }
        }

        const updateData: any = {};
        if (data.userName) updateData.userName = data.userName.trim();
        if (data.bio !== undefined) updateData.bio = data.bio;
        if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber.trim();
        if (data.gender !== undefined) updateData.gender = data.gender;
        if (data.profilePic !== undefined) updateData.profilePic = data.profilePic;

        const updated = await userRepository.updateById(userId, updateData);
        return updated;
    }

    async followUser(currentUserId: string, targetUserId: string) {
        if (currentUserId === targetUserId) {
            throw new AppError('You cannot follow yourself', 400);
        }

        const targetUser = await userRepository.findById(targetUserId);
        if (!targetUser) {
            throw userNotExist;
        }

        const existing = await followRepository.findRelationship(currentUserId, targetUserId);
        if (existing) {
            if (existing.status === 'ACCEPTED') {
                throw new AppError('You are already following this user', 400);
            }
            if (existing.status === 'PENDING') {
                throw new AppError('Follow request already pending', 400);
            }
        }

        // Privacy check: If target is private, require follow request
        if (targetUser.isPrivate) {
            await followRepository.createOrUpdateFollow(currentUserId, targetUserId, 'PENDING');
            return {
                status: 'PENDING',
                message: 'Follow request sent to private account.'
            };
        }

        // Target is public: follow directly
        await followRepository.createOrUpdateFollow(currentUserId, targetUserId, 'ACCEPTED');
        await Promise.all([
            userRepository.updateFollowingCount(currentUserId, 1),
            userRepository.updateFollowersCount(targetUserId, 1)
        ]);

        return {
            status: 'ACCEPTED',
            message: 'You are now following this user.'
        };
    }

    async unfollowUser(currentUserId: string, targetUserId: string) {
        if (currentUserId === targetUserId) {
            throw new AppError('You cannot unfollow yourself', 400);
        }

        const relationship = await followRepository.findRelationship(currentUserId, targetUserId);
        if (!relationship) {
            throw new AppError('You are not following or requesting this user', 400);
        }

        await followRepository.removeFollow(currentUserId, targetUserId);

        if (relationship.status === 'ACCEPTED') {
            await Promise.all([
                userRepository.updateFollowingCount(currentUserId, -1),
                userRepository.updateFollowersCount(targetUserId, -1)
            ]);
        }

        return {
            message: relationship.status === 'PENDING'
                ? 'Follow request cancelled'
                : 'User unfollowed successfully'
        };
    }

    async getFollowers(targetUserId: string, currentUserId?: string, page: number = 1, limit: number = 20) {
        const targetUser = await userRepository.findById(targetUserId);
        if (!targetUser) {
            throw userNotExist;
        }

        // Privacy check
        if (targetUser.isPrivate && currentUserId !== targetUserId) {
            const rel = currentUserId ? await followRepository.findRelationship(currentUserId, targetUserId) : null;
            if (!rel || rel.status !== 'ACCEPTED') {
                throw new AppError('This account is private. Follow this account to see followers.', 403);
            }
        }

        const skip = (page - 1) * limit;
        return followRepository.getFollowers(targetUserId, skip, limit);
    }

    async getFollowing(targetUserId: string, currentUserId?: string, page: number = 1, limit: number = 20) {
        const targetUser = await userRepository.findById(targetUserId);
        if (!targetUser) {
            throw userNotExist;
        }

        // Privacy check
        if (targetUser.isPrivate && currentUserId !== targetUserId) {
            const rel = currentUserId ? await followRepository.findRelationship(currentUserId, targetUserId) : null;
            if (!rel || rel.status !== 'ACCEPTED') {
                throw new AppError('This account is private. Follow this account to see following list.', 403);
            }
        }

        const skip = (page - 1) * limit;
        return followRepository.getFollowing(targetUserId, skip, limit);
    }

    async getPendingRequests(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        return followRepository.getPendingRequests(userId, skip, limit);
    }

    async respondToFollowRequest(userId: string, requestId: string, action: 'ACCEPT' | 'REJECT') {
        const request = await followRepository.findById(requestId);
        if (!request || request.followingId.toString() !== userId || request.status !== 'PENDING') {
            throw new AppError('Pending follow request not found', 404);
        }

        if (action === 'ACCEPT') {
            request.status = 'ACCEPTED';
            await request.save();

            await Promise.all([
                userRepository.updateFollowersCount(userId, 1),
                userRepository.updateFollowingCount(request.followerId, 1)
            ]);

            return { message: 'Follow request accepted' };
        } else {
            await followRepository.delete(request._id);
            return { message: 'Follow request rejected' };
        }
    }

    async searchUsers(query: string, currentUserId?: string, page: number = 1, limit: number = 20) {
        if (!query || query.trim().length === 0) {
            return { users: [], total: 0 };
        }

        const skip = (page - 1) * limit;
        const result = await userRepository.searchUsers(query, currentUserId, limit, skip);

        // Augment with follow status if currentUserId is provided
        if (currentUserId && result.users.length > 0) {
            const followingIds = await followRepository.getFollowingIds(currentUserId);
            const followingSet = new Set(followingIds.map(id => id.toString()));

            const augmented = result.users.map((u: any) => {
                const uObj = u.toObject ? u.toObject() : u;
                uObj.isFollowing = followingSet.has(u._id.toString());
                return uObj;
            });

            return { users: augmented, total: result.total };
        }

        return result;
    }

    async getSuggestions(currentUserId: string, limit: number = 10) {
        const followingIds = await followRepository.getFollowingIds(currentUserId);
        const excludeIds = [new Types.ObjectId(currentUserId), ...followingIds];

        return userRepository.getSuggestions(excludeIds, limit);
    }

    async updatePrivacy(userId: string, isPrivate: boolean) {
        const user = await userRepository.updateById(userId, { isPrivate });
        if (!user) {
            throw userNotExist;
        }

        // If toggled from private to public, automatically accept all pending requests
        if (!isPrivate) {
            const pendingRequests = await followRepository.find({
                followingId: new Types.ObjectId(userId),
                status: 'PENDING'
            });

            if (pendingRequests.length > 0) {
                for (const req of pendingRequests) {
                    req.status = 'ACCEPTED';
                    await req.save();
                    await userRepository.updateFollowingCount(req.followerId, 1);
                }
                await userRepository.updateFollowersCount(userId, pendingRequests.length);
            }
        }

        return {
            isPrivate: user.isPrivate,
            message: `Account is now ${user.isPrivate ? 'Private' : 'Public'}`
        };
    }

    async changePassword(userId: string, data: ChangePasswordDto) {
        const user = await userRepository.findByEmailWithPassword(
            (await userRepository.findById(userId))?.email || ''
        );

        if (!user) {
            throw userNotExist;
        }

        const isMatch = await comparePassword(data.oldPassword, user.password || '');
        if (!isMatch) {
            throw new AppError('Incorrect old password', 400);
        }

        const newHash = await hashPassword(data.newPassword);
        user.password = newHash;
        await user.save();

        // Invalidate all active sessions for security
        await sessionRepository.revokeAllUserSessions(userId);

        return { message: 'Password changed successfully. Please login again.' };
    }
}

export default new UserService();
