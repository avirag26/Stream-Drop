import User from "@/models/User";
import { IUserDocument } from "@/interface/user/user.interface";
import { BaseRepository } from "../BaseRepository";

export class UserRepository extends BaseRepository<IUserDocument>{
    constructor(){
        super(User);
    }

    async findByEmail(email:string):Promise<IUserDocument| null>{
        return await this.model.findOne({email})
    }

    async updateByEmail(email:string,updateData:Partial<IUserDocument>):Promise<IUserDocument|null>{
        return await this.model.findOneAndUpdate(
            {email:email.toLocaleLowerCase()},
            {$set:updateData},
            {new:true}
        )
    }
}

export const userRepository = new UserRepository();