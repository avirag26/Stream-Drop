import Box  from "@/models/Box";
import { IBoxDocument } from "@/interface/box/box.interface";
import { BaseRepository } from "../BaseRepository";

export class BoxRepository extends BaseRepository<IBoxDocument>{
    constructor(){
        super(Box)
    }
    async findByCode(code:string):Promise<IBoxDocument | null>{
        return await this.model.findOne({boxCode:code})
    }
    
    public async findLatestByCreator(userId: string) {

    return await this.model.findOne({ creatorId: userId }).sort({ createdAt: -1 });

     }
}

export const boxRepository = new BoxRepository();