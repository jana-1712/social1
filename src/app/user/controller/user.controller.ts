import type { Request, Response, NextFunction } from 'express';
import userService from '../service/user.service';

export class UserController {
    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const profile = await userService.getMe(userId);
            res.status(200).json({
                success: true,
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const rawParam = req.params.identifier || req.params.id;
            const identifier = Array.isArray(rawParam) ? rawParam[0] : String(rawParam);
            const currentUserId = req.user?.id;
            const profile = await userService.getUserProfile(identifier, currentUserId);
            res.status(200).json({
                success: true,
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const updated = await userService.updateProfile(userId, req.body);
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    async followUser(req: Request, res: Response, next: NextFunction) {
        try {
            const currentUserId = req.user!.id;
            const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
            const result = await userService.followUser(currentUserId, targetUserId);
            res.status(200).json({
                success: true,
                message: result.message,
                status: result.status
            });
        } catch (error) {
            next(error);
        }
    }

    async unfollowUser(req: Request, res: Response, next: NextFunction) {
        try {
            const currentUserId = req.user!.id;
            const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
            const result = await userService.unfollowUser(currentUserId, targetUserId);
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    async getFollowers(req: Request, res: Response, next: NextFunction) {
        try {
            const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
            const currentUserId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await userService.getFollowers(targetUserId, currentUserId, page, limit);
            res.status(200).json({
                success: true,
                data: result.list,
                total: result.total,
                page,
                limit
            });
        } catch (error) {
            next(error);
        }
    }

    async getFollowing(req: Request, res: Response, next: NextFunction) {
        try {
            const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
            const currentUserId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await userService.getFollowing(targetUserId, currentUserId, page, limit);
            res.status(200).json({
                success: true,
                data: result.list,
                total: result.total,
                page,
                limit
            });
        } catch (error) {
            next(error);
        }
    }

    async getPendingRequests(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await userService.getPendingRequests(userId, page, limit);
            res.status(200).json({
                success: true,
                data: result.list,
                total: result.total,
                page,
                limit
            });
        } catch (error) {
            next(error);
        }
    }

    async respondToFollowRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : String(req.params.requestId);
            const action = (req.body.action || 'ACCEPT').toUpperCase() as 'ACCEPT' | 'REJECT';

            const result = await userService.respondToFollowRequest(userId, requestId, action);
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    async searchUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const query = (req.query.q as string) || '';
            const currentUserId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await userService.searchUsers(query, currentUserId, page, limit);
            res.status(200).json({
                success: true,
                data: result.users,
                total: result.total,
                page,
                limit
            });
        } catch (error) {
            next(error);
        }
    }

    async getSuggestions(req: Request, res: Response, next: NextFunction) {
        try {
            const currentUserId = req.user!.id;
            const limit = parseInt(req.query.limit as string) || 10;

            const suggestions = await userService.getSuggestions(currentUserId, limit);
            res.status(200).json({
                success: true,
                data: suggestions
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePrivacy(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const isPrivate = Boolean(req.body.isPrivate);

            const result = await userService.updatePrivacy(userId, isPrivate);
            res.status(200).json({
                success: true,
                message: result.message,
                data: { isPrivate: result.isPrivate }
            });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const result = await userService.changePassword(userId, req.body);
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
