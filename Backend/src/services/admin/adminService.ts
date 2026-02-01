import { AdminRepository,adminRepository } from "../../repositories/Admin/admin.repo.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
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
        if(!isMatch) throw new Error("Invalid adminn credentials");

        const token = jwt.sign(
            {id:admin._id,role:'admin'},
            process.env.JWT_SECRET as string,
            {expiresIn:'1d'}
        );

        return {
            admin:{id:admin._id,name:admin.name,email:admin.email},
            token
        }
    }

    async listUsers(page:number,limit:number,search?:string,status?:string){
        const result = await this.adminRepo.findAllUsers(page,limit,search,status);
        // Don't throw error if no users found - just return empty result
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