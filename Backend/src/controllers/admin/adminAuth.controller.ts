import { Request, Response } from "express";
import { adminAuthService } from "../../services/admin/adminService.js";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { MESSAGES } from "../../constants/messages";

export class AdminAuthController {
    private setRefreshCookie(res: Response, token: string) {
        res.cookie('adminRefreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }

    public register = async (req: Request, res: Response): Promise<void> => {
        try {
            const admin = await adminAuthService.register(req.body)
            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: MESSAGES.ADMIN.CREATED,
                data: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email
                }
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || MESSAGES.ADMIN.REGISTRATION_FAILED
            })
        }
    };

    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            const { admin, accessToken, refreshToken } = await adminAuthService.login(email, password);
            
            this.setRefreshCookie(res, refreshToken);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGES.ADMIN.LOGIN_SUCCESS,
                data: { admin, token: accessToken }
            })
        } catch (error: any) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: error.message || MESSAGES.ADMIN.INVALID_CREDENTIALS
            })
        }
    }

    public refreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.cookies.adminRefreshToken;
            
            if (!token) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: MESSAGES.AUTH.NO_REFRESH_TOKEN
                });
                return;
            }

            const result = await adminAuthService.refreshAccessToken(token);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGES.ADMIN.TOKEN_REFRESHED,
                data: result
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: error.message || MESSAGES.ADMIN.TOKEN_REFRESH_FAILED
            });
        }
    };

    public logout = async (req: Request, res: Response): Promise<void> => {
        res.clearCookie('adminRefreshToken');
        res.status(HTTP_STATUS.OK).json({ 
            success: true, 
            message: MESSAGES.ADMIN.LOGOUT_SUCCESS 
        });
    };

    public getUsers = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const status = req.query.status as string;
            
            const result = await adminAuthService.listUsers(page, limit, search, status);
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGES.ADMIN.USERS_RETRIEVED,
                data: result.users,
                pagination: {
                    totalUsers: result.totalUsers,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: limit
                }
            })
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message
            })
        }
    }

    public toogleBlock = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const result = await adminAuthService.toogleBlockStatus(userId as string);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: `User ${result.is_blocked ? MESSAGES.ADMIN.USER_BLOCKED : MESSAGES.ADMIN.USER_UNBLOCKED} successfully`,
                data: result
            })
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
                success: false, 
                message: error.message 
            })
        }
    }
}

export const adminAuthController = new AdminAuthController()