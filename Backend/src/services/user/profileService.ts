import { UserRepository, userRepository } from '../../repositories/User/user.repo';
import bcrypt from 'bcryptjs';

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
        createdAt:user.createdAt
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
        tier:updateUser.tier
     }
   }

   async changePasword(userId:string,currentPassword:string,newPassword:string){
     const user = await this.userRepo.findById(userId);

     if(!user)throw new Error("User not found");

     const isMatch=await bcrypt.compare(currentPassword,user.password);
     if(!isMatch)throw new Error("Current password is incorrect");

     const hashedPassword = await bcrypt.hash(newPassword,12);

     await this.userRepo.updateById(userId,{password:hashedPassword});

     return {success:true}
   }
}

export const profileService = new ProfileService(userRepository);
