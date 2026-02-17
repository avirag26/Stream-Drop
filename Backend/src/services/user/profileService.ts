import { UserRepository, userRepository } from '../../repositories/User/user.repo';
import bcrypt from 'bcryptjs';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client,S3_CONFIG } from '../../config/s3.config';

export class ProfileService {
    constructor(private userRepo: UserRepository) {}

   async getProfile(userId:string){

    const user = await this.userRepo.findById(userId);

    if(!user)throw new Error("User not found");

    return{
        id:user._id,
        name:user.name,
        email:user.email,
        tier:user.tier,
        is_verified:user.is_verified,
        createdAt:user.createdAt,
        profilePhoto:user.avatar
    };
   }

   async updateProfile(userId:string,updates:{name?:string}){

    const user = await this.userRepo.findById(userId);

    if(!user)throw new Error("User not found");

     const updateUser = await this.userRepo.updateById(userId,updates)

     if(!updateUser)throw new Error("Failed to update");
     
     return{
        id:updateUser._id,
        name:updateUser.name,
        email:updateUser.email,
        tier:updateUser.tier,
        profilePhoto:updateUser.avatar
     }
   }

   async changePasword(userId:string,currentPassword:string,newPassword:string){
     const user = await this.userRepo.findById(userId);
    if(user?.googleId){
      throw new Error("User signed with google")
    }
     if(!user)throw new Error("User not found");

     const isMatch=await bcrypt.compare(currentPassword,user.password);
     if(!isMatch)throw new Error("Current password is incorrect");

     const hashedPassword = await bcrypt.hash(newPassword,12);

     await this.userRepo.updateById(userId,{password:hashedPassword});

     return {success:true}
   }

   async updateProfilePhoto(userId:string,photoUrl:string){
    const user = await this.userRepo.findById(userId);

    if(!user) throw new Error("User not found")

      if(user.avatar){
        try {
          const oldKey = user.avatar.split('.com/')[1];
          await s3Client.send(new DeleteObjectCommand({
            Bucket:S3_CONFIG.bucket,
            Key:oldKey,
          }))
        } catch (error:any) {
           console.error("Error deleting old photo:",error);
        }
      }

      const updated = await this.userRepo.updateById(userId,{
        avatar:photoUrl
      })

      return updated
   }
}

export const profileService = new ProfileService(userRepository);
