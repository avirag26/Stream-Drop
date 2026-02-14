import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { ProfileService,profileService } from "@/services/user/profileService";

export class ProfileController{
    constructor(private profileService:ProfileService){}

    public getProfile = async (req:AuthRequest,res:Response):Promise<void> =>{
        try {
            const userId=req.user!.id;
            const profile = await this.profileService.getProfile(userId);

            res.status(200).json({
                success:true,
                data:profile
            })
        } catch (error:any) {
            res.status(400).json({
                success:false,
                message:error.message || 'failed to fetch prfile'
            })
        }
    }


    public updateProfile = async (req:AuthRequest,res:Response):Promise<void> =>{
        try {
            const userId=req.user!.id;
            const updates =req.body;

            const updateProfile = await this.profileService.updateProfile(userId,updates);

            res.status(200).json({
                success:true,
                message:'Profile update successfully',
                data:updateProfile
            })
        } catch (error:any) {
            res.status(400).json({
                success:false,
                message:error.message || "Failed to update profile"
            })
        }
    }

    public chnagePassword = async (req:AuthRequest,res:Response):Promise<void> =>{
       try {
        const userId = req.user!.id;
        const {currentPassword,newPassword}=req.body

        await this.profileService.changePasword(userId,currentPassword,newPassword);

        res.status(200).json({
            success:true,
            message:'Password chnaged successfullt'
        });
       } catch (error:any) {
        res.status(400).json({
            success:false,
            message:error.message || "Failed to chnage password"
        })
       }
    }
}


export const profileController=new ProfileController(profileService)