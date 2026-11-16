"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = __importDefault(require("../service/user.service"));
class UserController {
    async getMe(req, res, next) {
        try {
            const userId = req.user.id;
            const profile = await user_service_1.default.getMe(userId);
            res.status(200).json({
                success: true,
                data: profile
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserProfile(req, res, next) {
        try {
            const rawParam = req.params.identifier || req.params.id;
            const identifier = Array.isArray(rawParam) ? rawParam[0] : String(rawParam);
            const currentUserId = req.user?.id;
            const profile = await user_service_1.default.getUserProfile(identifier, currentUserId);
            res.status(200).json({
                success: true,
                data: profile
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const updated = await user_service_1.default.updateProfile(userId, req.body);
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: updated
            });
        }
        catch (error) {
            next(error);
        }
    }
    async followUser(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
            const result = await user_service_1.default.followUser(currentUserId, targetUserId);
            res.status(200).json({
                success: true,
                message: result.message,
                status: result.status
            });
        }
        catch (error) {
            next(error);
        }
    }
    async unfollowUser(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
            const result = await user_service_1.default.unfollowUser(currentUserId, targetUserId);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getFollowers(req, res, next) {
        try {
            const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
            const currentUserId = req.user?.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await user_service_1.default.getFollowers(targetUserId, currentUserId, page, limit);
            res.status(200).json({
                success: true,
                data: result.list,
                total: result.total,
                page,
                limit
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getFollowing(req, res, next) {
        try {
            const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
            const currentUserId = req.user?.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await user_service_1.default.getFollowing(targetUserId, currentUserId, page, limit);
            res.status(200).json({
                success: true,
                data: result.list,
                total: result.total,
                page,
                limit
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPendingRequests(req, res, next) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await user_service_1.default.getPendingRequests(userId, page, limit);
            res.status(200).json({
                success: true,
                data: result.list,
                total: result.total,
                page,
                limit
            });
        }
        catch (error) {
            next(error);
        }
    }
    async respondToFollowRequest(req, res, next) {
        try {
            const userId = req.user.id;
            const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : String(req.params.requestId);
            const action = (req.body.action || 'ACCEPT').toUpperCase();
            const result = await user_service_1.default.respondToFollowRequest(userId, requestId, action);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            next(error);
        }
    }
    async searchUsers(req, res, next) {
        try {
            const query = req.query.q || '';
            const currentUserId = req.user?.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await user_service_1.default.searchUsers(query, currentUserId, page, limit);
            res.status(200).json({
                success: true,
                data: result.users,
                total: result.total,
                page,
                limit
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getSuggestions(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const limit = parseInt(req.query.limit) || 10;
            const suggestions = await user_service_1.default.getSuggestions(currentUserId, limit);
            res.status(200).json({
                success: true,
                data: suggestions
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updatePrivacy(req, res, next) {
        try {
            const userId = req.user.id;
            const isPrivate = Boolean(req.body.isPrivate);
            const result = await user_service_1.default.updatePrivacy(userId, isPrivate);
            res.status(200).json({
                success: true,
                message: result.message,
                data: { isPrivate: result.isPrivate }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await user_service_1.default.changePassword(userId, req.body);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.default = new UserController();
