import { UserRepository, userRepository } from "../../repositories/User/user.repo";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { IUser } from "../../interface/user/user.interface";
import redisClient from "../../config/redis"; 
import { mailService } from "../mail/mail.service";
import { OAuth2Client } from 'google-auth-library';
import { generateToken, verifyRefreshToken } from "../../utils/jwt.utils";
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(private userRepo: UserRepository) {
        this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    
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
  
     
        
        const {accessToken,refreshToken} = generateToken(newUser._id.toString(), 'user', newUser.tier);
        return {
            user: { 
                id: newUser._id, 
                name: newUser.name, 
                email: newUser.email, 
                tier: newUser.tier 
            },
            accessToken,
            refreshToken
        };
    }

    async login(email: string, pass: string) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) throw new Error("Invalid email or password");

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        if (user.is_blocked) throw new Error("Account has been suspended");

      
        const {accessToken,refreshToken} = generateToken(user._id.toString(), 'user', user.tier);

        return {
            user: { id: user._id, name: user.name, email: user.email, tier: user.tier },
            accessToken,
            refreshToken
        };
    }

    async refreshAccessToken(token: string) {
        try {
          
            const decoded = verifyRefreshToken(token);

            const user = await this.userRepo.findById(decoded.id);
            
            if (!user) {
                throw new Error("User no longer exists");
            }

            if (user.is_blocked) {
                throw new Error("Account has been suspended");
            }

      
            const tokens = generateToken(user._id.toString(), 'user', user.tier);

            return {
                accessToken: tokens.accessToken
            };
        } catch (error: any) {
            throw new Error("Invalid or expired refresh session");
        }
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

   async resendRegistrationOtp(email: string) {
   
    const cachedData = await redisClient.get(`temp_user:${email}`);
    if (!cachedData) throw new Error("No pending registration found for this email");

    const userData = JSON.parse(cachedData);
    

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
  
    userData.otp = otp;
    
 
    await redisClient.setEx(
        `temp_user:${email}`,
        600,
        JSON.stringify(userData)
    );

   
    await mailService.sendOTP(email, otp);
    
    return { email, otp };
   }

   async resendResetOtp(email: string) {
 
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("No account found with this email");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.setEx(`reset_otp:${email}`, 300, otp);

    
    await mailService.sendOTP(email, otp);
    
    return { success: true };
   }

   async getUserById(userId: string) {
        return await this.userRepo.findById(userId);
    }

   async googleLogin(credential: string) {
    try {
      
        const ticket = await this.googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Invalid Google token');
        }

        const { email, name, picture, sub: googleId } = payload;

        if (!email || !name) {
            throw new Error('Missing required Google profile information');
        }

        let user = await this.userRepo.findByEmail(email);

        if (user) {
         
            if (!user.googleId) {
                const updatedUser = await this.userRepo.updateById(user._id.toString(), { 
                    googleId,
                    avatar: picture 
                });
                user = updatedUser || user;
            }
        } else {
           
            user = await this.userRepo.create({
                name,
                email,
                password: '', 
                googleId,
                avatar: picture,
                is_verified: true, 
                tier: 'free'
            });
        }

        if (!user) {
            throw new Error("Failed to create or retrieve user");
        }

        if (user.is_blocked) {
            throw new Error("Account has been suspended");
        }

        const { accessToken, refreshToken } = generateToken(user._id.toString(), 'user', user.tier);
        return {
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                tier: user.tier,
                avatar: user.avatar 
            },
            accessToken,
            refreshToken
        };
    } catch (error: any) {
        throw new Error(`Google authentication failed: ${error.message}`);
    }
   }
}

export const authService = new AuthService(userRepository);