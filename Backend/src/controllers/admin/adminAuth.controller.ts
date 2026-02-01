import { Request, Response } from "express";
import { adminAuthService } from "../../services/admin/adminService.js";

export class AdminAuthController {
    public register = async (req:Request,res:Response):Promise<void>=>{
        try {
            const admin = await adminAuthService.register(req.body)
            res.status(201).json({
                success:true,
                message:"Admin created successfully",
                data:{
                    id:admin._id,
                    name:admin.name,
                    email:admin.email
                }
            });
        } catch (error:any) {
            res.status(400).json({
                success:false,
                message:error.message || "Registration failed"
            })
        }
    };

    public login = async (req:Request,res:Response):Promise<void>=>{
        try {
            const {email,password} = req.body;
            const result = await adminAuthService.login(email,password);
            res.status(200).json({
                success:true,
                message:"Admin authenticated successfull",
                data:result
            })
        } catch (error:any) {
            res.status(401).json({
                success:false,
                message:error.message || "invalid credentials"
            })
        }
    }

    public getUsers = async (req:Request,res:Response)=>{
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const status = req.query.status as string;
            
            const result = await adminAuthService.listUsers(page,limit,search,status);
            res.status(200).json({
                success:true,
                message:"User retrived successfully",
                data:result.users,
                pagination:{
                    totalUsers:result.totalUsers,
                    totalPages:result.totalPages,
                    currentPage:result.currentPage,
                    limit:limit
                }
            })
        } catch (error:any) {
            res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }

    public toogleBlock = async(req:Request,res:Response)=>{
        try {
            const {userId} = req.params;
            const result = await adminAuthService.toogleBlockStatus(userId as string);

            res.status(200).json({
                success:true,
                message:`User ${result.is_blocked ? 'blocked':'unblocked'} successfully`,
                data:result
            })
        } catch (error:any) {
            res.status(500).json({success:false,message:error.message})
        }
    }
}

export const adminAuthController = new AdminAuthController()