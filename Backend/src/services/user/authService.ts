import { UserRepository, userRepository } from "@/repositories/User/user.repo";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { IUser } from "@/interface/user/user.interface";
import redisClient from "@/config/redis"; 
import { mailService } from "../mail/mail.service";
export class AuthService {
    constructor(private userRepo: UserRepository) {}

    
    async preRegister(userData: IUser) {
        const existing = await this.userRepo.findByEmail(userData.email);
        if (existing) throw new Error('User already exists');

        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        

        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        const tempUser = {
            ...userData,
            password: hashedPassword,
            otp
        };

        
        await redisClient.setEx(
            `temp_user:${userData.email}`,
            600,
            JSON.stringify(tempUser)
        );

      await mailService.sendOTP(userData.email, otp);
        return { email: userData.email, otp }; 
    }

  
    async verifyAndCreate(email: string, submittedOtp: string) {
      
        const cachedData = await redisClient.get(`temp_user:${email}`);
        if (!cachedData) throw new Error("OTP expired or invalid session");

        const userData = JSON.parse(cachedData);


        if (userData.otp !== submittedOtp) throw new Error("Incorrect OTP code");
        
      
        const { otp, ...finalUserData } = userData; 
        const newUser = await this.userRepo.create({
            ...finalUserData,
            is_verified: true 
        });

   
        await redisClient.del(`temp_user:${email}`);

     
        const token = jwt.sign(
            { id: newUser._id, tier: newUser.tier },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        return {
            user: { 
                id: newUser._id, 
                name: newUser.name, 
                email: newUser.email, 
                tier: newUser.tier 
            },
            token
        };
    }

    async login(email: string, pass: string) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) throw new Error("Invalid email or password");

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        if (user.is_blocked) throw new Error("Account has been suspended");

        const token = jwt.sign(
            { id: user._id, tier: user.tier },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        return {
            user: { id: user._id, name: user.name, email: user.email, tier: user.tier },
            token
        };
    }

    async forgotPasswordRequest(email:string){
        const user = await this.userRepo.findByEmail(email);
        if(!user) throw new Error("No account  found with this email");

        const otp = Math.floor(100000+Math.random()*900000).toString();

        await redisClient.setEx(`reset_otp:${email}`,300,otp);

        await mailService.sendOTP(email,otp);
        return{success:true};
    }

  async verifyResetOtp(email: string, otp: string) {
    const cachedOtp = await redisClient.get(`reset_otp:${email}`);
    if (!cachedOtp || cachedOtp !== otp) throw new Error("Invalid or expired OTP");

    
    const resetToken = Math.random().toString(36).substring(2, 15);
    

    await redisClient.setEx(`reset_token:${email}`, 600, resetToken);
    await redisClient.del(`reset_otp:${email}`);

    return { resetToken };
   }

   async finalizePasswordReset(email: string, token: string, newPass: string) {
    const cachedToken = await redisClient.get(`reset_token:${email}`);
    if (!cachedToken || cachedToken !== token) throw new Error("Session expired. Please restart reset process.");

    const hashedPassword = await bcrypt.hash(newPass, 12);
    const updatedUser = await this.userRepo.updateByEmail(email, { password: hashedPassword });

    if (!updatedUser) throw new Error("User not found");

    await redisClient.del(`reset_token:${email}`);
    return { success: true };
   }
}

export const authService = new AuthService(userRepository);