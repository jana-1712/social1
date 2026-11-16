import { Router } from 'express';
import userController from './controller/user.controller';
import { authGuard, optionalAuthGuard } from '../../lib/auth/guard';

export const userRouter = Router();

// Current User Profile & Profile Updates
userRouter.get('/me', authGuard, (req, res, next) => userController.getMe(req, res, next));
userRouter.patch('/profile', authGuard, (req, res, next) => userController.updateProfile(req, res, next));
userRouter.put('/me', authGuard, (req, res, next) => userController.updateProfile(req, res, next));

// Search & Suggestions
userRouter.get('/search', optionalAuthGuard, (req, res, next) => userController.searchUsers(req, res, next));
userRouter.get('/suggestions', authGuard, (req, res, next) => userController.getSuggestions(req, res, next));

// Account Settings & Privacy Control (Public vs Private Profile)
userRouter.patch('/settings/privacy', authGuard, (req, res, next) => userController.updatePrivacy(req, res, next));
userRouter.patch('/settings/change-password', authGuard, (req, res, next) => userController.changePassword(req, res, next));

// Follow Requests (for private accounts)
userRouter.get('/follow-requests', authGuard, (req, res, next) => userController.getPendingRequests(req, res, next));
userRouter.patch('/follow-requests/:requestId', authGuard, (req, res, next) => userController.respondToFollowRequest(req, res, next));

// Follow / Unfollow System
userRouter.post('/:id/follow', authGuard, (req, res, next) => userController.followUser(req, res, next));
userRouter.post('/:id/unfollow', authGuard, (req, res, next) => userController.unfollowUser(req, res, next));
userRouter.delete('/:id/follow', authGuard, (req, res, next) => userController.unfollowUser(req, res, next));

// Followers & Following Lists
userRouter.get('/:id/followers', optionalAuthGuard, (req, res, next) => userController.getFollowers(req, res, next));
userRouter.get('/:id/following', optionalAuthGuard, (req, res, next) => userController.getFollowing(req, res, next));

// Profile Retrieval by ID or Username (Public vs Private profile logic)
userRouter.get('/:identifier', optionalAuthGuard, (req, res, next) => userController.getUserProfile(req, res, next));

export default userRouter;
