import Admin from '../../models/Admin.js'
import { IAdminDocument } from '../../interface/admin/admin.interface.js'
import { BaseRepository } from '../BaseRepository.js'
import User from '../../models/User.js';

export class AdminRepository extends BaseRepository<IAdminDocument>{
    constructor(){
        super(Admin)
    }
    async findByEmail(email:string):Promise<IAdminDocument|null>{
        return await this.model.findOne({email:email.toLowerCase()});
    }
    async findAllUsers(page:number,limit:number,search?:string,status?:string){
        const skip=(page-1)*limit;
        
        // Build query object
        let query: any = {};
        
        // Add search functionality
        if (search && search.trim()) {
            query.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } }
            ];
        }
        
        // Add status filter
        if (status && status !== 'ALL STATUS') {
            switch (status) {
                case 'ACTIVE':
                    query.is_verified = true;
                    query.is_blocked = false;
                    break;
                case 'PENDING':
                    query.is_verified = false;
                    query.is_blocked = false;
                    break;
                case 'SUSPENDED':
                    query.is_blocked = true;
                    break;
            }
        }
        
        const [users,totalUsers] = await Promise.all([
            User.find(query).select('-password').sort({createdAt:-1}).skip(skip).limit(limit),
            User.countDocuments(query)
        ])
        return {
            users,
            totalUsers,
            totalPages:Math.ceil(totalUsers/limit),
            currentPage:page
        }
    }
    async toogleUserBlock(userId:string){
        const user = await User.findById(userId);
        if(!user) throw new Error("User not found");

        user.is_blocked = !user.is_blocked;
        return await user.save();
    }
}


export const adminRepository = new AdminRepository();