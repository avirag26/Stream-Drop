import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { ProfileService,profileService } from "@/services/user/profileService";
import { HTTP_STATUS } from "@/constants/httpStatus";
import { MESSAGES } from "@/constants/messages";

export class ProfileController{
    constructor(private profileService:ProfileService){}

    public getProfile = async (req:AuthRequest,res:Response):Promise<void> =>{
        try {
            const userId=req.user!.id;
            const profile = await this.profileService.getProfile(userId);

            res.status(HTTP_STATUS.OK).json({
                success:true,
                data:profile
            })
        } catch (error:any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success:false,
                message:error.message || MESSAGES.PROFILE.FETCH_FAILED
            })
        }
    }


    public updateProfile = async (req:AuthRequest,res:Response):Promise<void> =>{
        try {
            const userId=req.user!.id;
            const updates =req.body;

            const updateProfile = await this.profileService.updateProfile(userId,updates);

            res.status(HTTP_STATUS.OK).json({
                success:true,
                message: MESSAGES.PROFILE.UPDATE_SUCCESS,
                data:updateProfile
            })
        } catch (error:any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success:false,
                message:error.message || MESSAGES.PROFILE.UPDATE_FAILED
            })
        }
    }

    public chnagePassword = async (req:AuthRequest,res:Response):Promise<void> =>{
       try {
        const userId = req.user!.id;
        const {currentPassword,newPassword}=req.body

        await this.profileService.changePasword(userId,currentPassword,newPassword);

        res.status(HTTP_STATUS.OK).json({
            success:true,
            message: MESSAGES.PROFILE.PASSWORD_CHANGED
        });
       } catch (error:any) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success:false,
            message:error.message || MESSAGES.PROFILE.PASSWORD_CHANGE_FAILED
        })
       }
    }

    public uploadPhoto = async (req:AuthRequest,res:Response):Promise<void>=>{
        try {
            const userId=req.user!.id;
            const file = req.file as any;

            if(!file){
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success:false,
                    message:'No file uploaded'
                });
                return;
            }

            const photoUrl= file.location;

            const updateUser = await this.profileService.updateProfilePhoto(userId,photoUrl);

            res.status(HTTP_STATUS.OK).json({
                success:true,
                message:MESSAGES.PROFILE.UPDATE_SUCCESS,
                data:{profilePhoto:updateUser?.avatar}
            });
        } catch (error:any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success:false,
                message:error.message
            })
        }
    }
}


export const profileController=new ProfileController(profileService)