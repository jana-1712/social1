"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = __importDefault(require("./controller/user.controller"));
const guard_1 = require("../../lib/auth/guard");
exports.userRouter = (0, express_1.Router)();
// Current User Profile & Profile Updates
exports.userRouter.get('/me', guard_1.authGuard, (req, res, next) => user_controller_1.default.getMe(req, res, next));
exports.userRouter.patch('/profile', guard_1.authGuard, (req, res, next) => user_controller_1.default.updateProfile(req, res, next));
exports.userRouter.put('/me', guard_1.authGuard, (req, res, next) => user_controller_1.default.updateProfile(req, res, next));
// Search & Suggestions
exports.userRouter.get('/search', guard_1.optionalAuthGuard, (req, res, next) => user_controller_1.default.searchUsers(req, res, next));
exports.userRouter.get('/suggestions', guard_1.authGuard, (req, res, next) => user_controller_1.default.getSuggestions(req, res, next));
// Account Settings & Privacy Control (Public vs Private Profile)
exports.userRouter.patch('/settings/privacy', guard_1.authGuard, (req, res, next) => user_controller_1.default.updatePrivacy(req, res, next));
exports.userRouter.patch('/settings/change-password', guard_1.authGuard, (req, res, next) => user_controller_1.default.changePassword(req, res, next));
// Follow Requests (for private accounts)
exports.userRouter.get('/follow-requests', guard_1.authGuard, (req, res, next) => user_controller_1.default.getPendingRequests(req, res, next));
exports.userRouter.patch('/follow-requests/:requestId', guard_1.authGuard, (req, res, next) => user_controller_1.default.respondToFollowRequest(req, res, next));
// Follow / Unfollow System
exports.userRouter.post('/:id/follow', guard_1.authGuard, (req, res, next) => user_controller_1.default.followUser(req, res, next));
exports.userRouter.post('/:id/unfollow', guard_1.authGuard, (req, res, next) => user_controller_1.default.unfollowUser(req, res, next));
exports.userRouter.delete('/:id/follow', guard_1.authGuard, (req, res, next) => user_controller_1.default.unfollowUser(req, res, next));
// Followers & Following Lists
exports.userRouter.get('/:id/followers', guard_1.optionalAuthGuard, (req, res, next) => user_controller_1.default.getFollowers(req, res, next));
exports.userRouter.get('/:id/following', guard_1.optionalAuthGuard, (req, res, next) => user_controller_1.default.getFollowing(req, res, next));
// Profile Retrieval by ID or Username (Public vs Private profile logic)
exports.userRouter.get('/:identifier', guard_1.optionalAuthGuard, (req, res, next) => user_controller_1.default.getUserProfile(req, res, next));
exports.default = exports.userRouter;
