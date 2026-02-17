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

     async deleteBox(boxId:string,creatorId:string){
        return await Box.findOneAndDelete({
            _id:boxId,
            creatorId:creatorId
        })
     }

  async countActiveBoxesByUser(userId: string): Promise<number> {
    return await this.model.countDocuments({ 
        creatorId: userId,
        expiresAt: { $gt: new Date() }
    });
 }
 
}

export const boxRepository = new BoxRepository();