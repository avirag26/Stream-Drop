import { AdminRepository,adminRepository } from "../../repositories/Admin/admin.repo.js";
import bcrypt from 'bcryptjs';
import { generateToken, verifyRefreshToken } from "../../utils/jwt.utils";
import dotenv from 'dotenv'
dotenv.config()

export class AdminAuthService{
    constructor(private adminRepo:AdminRepository){}

    async register (adminData:any){
        const existing = await this.adminRepo.findByEmail(adminData.email);
        if(existing)throw new Error("Admin account already exist")
        
        const hashedPassword = await bcrypt.hash(adminData.password,12);

        return await this.adminRepo.create({
            ...adminData,
            password:hashedPassword
        })
    }

    async login (email:string,pass:string){
        const admin = await this.adminRepo.findByEmail(email);
        if(!admin) throw new Error("Invalid admin credentials");

        const isMatch = await bcrypt.compare(pass,admin.password);
        if(!isMatch) throw new Error("Invalid admin credentials");

        const {accessToken, refreshToken} = generateToken(admin._id.toString(), 'admin');

        return {
            admin:{id:admin._id,name:admin.name,email:admin.email},
            accessToken,
            refreshToken
        }
    }

    async refreshAccessToken(token: string) {
        try {
            const decoded = verifyRefreshToken(token);

            // Ensure it's an admin token
            if (decoded.role !== 'admin') {
                throw new Error("Invalid admin token");
            }

            const admin = await this.adminRepo.findById(decoded.id);
            
            if (!admin) {
                throw new Error("Admin no longer exists");
            }

            const tokens = generateToken(admin._id.toString(), 'admin');

            return {
                accessToken: tokens.accessToken
            };
        } catch (error: any) {
            throw new Error("Invalid or expired admin refresh session");
        }
    }

    async listUsers(page:number,limit:number,search?:string,status?:string){
        const result = await this.adminRepo.findAllUsers(page,limit,search,status);
        return result;
    }

    async toogleBlockStatus(userId:string){
        const updatedUser = await this.adminRepo.toogleUserBlock(userId)
        return{
            id:updatedUser._id,
            is_blocked:updatedUser.is_blocked,
            name:updatedUser.name
        }
    }
}

export const adminAuthService = new AdminAuthService(adminRepository)