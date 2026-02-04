import { Request, Response } from "express";
import { adminAuthService } from "../../services/admin/adminService.js";

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
            res.status(201).json({
                success: true,
                message: "Admin created successfully",
                data: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email
                }
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Registration failed"
            })
        }
    };

    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            const { admin, accessToken, refreshToken } = await adminAuthService.login(email, password);
            
            this.setRefreshCookie(res, refreshToken);

            res.status(200).json({
                success: true,
                message: "Admin authenticated successfully",
                data: { admin, token: accessToken }
            })
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: error.message || "invalid credentials"
            })
        }
    }

    public refreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.cookies.adminRefreshToken;
            
            if (!token) {
                res.status(400).json({
                    success: false,
                    message: "No refresh token provided"
                });
                return;
            }

            const result = await adminAuthService.refreshAccessToken(token);

            res.status(200).json({
                success: true,
                message: "Admin token refreshed successfully",
                data: result
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: error.message || "Failed to refresh admin token"
            });
        }
    };

    public logout = async (req: Request, res: Response): Promise<void> => {
        res.clearCookie('adminRefreshToken');
        res.status(200).json({ 
            success: true, 
            message: "Admin logged out successfully" 
        });
    };

    public getUsers = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const status = req.query.status as string;
            
            const result = await adminAuthService.listUsers(page, limit, search, status);
            res.status(200).json({
                success: true,
                message: "User retrieved successfully",
                data: result.users,
                pagination: {
                    totalUsers: result.totalUsers,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: limit
                }
            })
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    public toogleBlock = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const result = await adminAuthService.toogleBlockStatus(userId as string);

            res.status(200).json({
                success: true,
                message: `User ${result.is_blocked ? 'blocked' : 'unblocked'} successfully`,
                data: result
            })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
}

export const adminAuthController = new AdminAuthController()