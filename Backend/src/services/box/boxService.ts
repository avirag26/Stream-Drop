import { BoxRepository ,boxRepository} from "@/repositories/Box/box.repo";
import { generateBoxCode } from "@/utils/codeGenerator.utils";

export class BoxService{
    constructor(private repo:BoxRepository){}

    public async createBox(userId:string | null, boxName:string){
        const code = await this.generateUniqueCode();
        
       const expiry = new Date(Date.now() + 600000);


        return await this.repo.create({
            boxCode:code,
            boxName:boxName,
            creatorId:userId as any,
            expiresAt:expiry
        })
    }

    private async generateUniqueCode():Promise<string>{
        let isUnique = false;
        let code = '';

        while (!isUnique) {
            code = generateBoxCode();
            const existing = await this.repo.findByCode(code);
            if (!existing) isUnique = true;
        }
        return code;
    }

    public async getBoxByCode(code:string){
        return await this.repo.findByCode(code)
    }
     
    public async findLatestByUser(userId: string) {
    const box = await this.repo.findLatestByCreator(userId);
    
    if (!box) return null;


    const isExpired = new Date() > new Date(box.expiresAt);
    
    return isExpired ? null : box;
     }
    public async removeBox(boxId:string,userId:string){
        const deletedBox = await this.repo.deleteBox(boxId,userId)

        if(!deletedBox){
            throw new Error("Box not found or you don't have permission to delete it")
        }

        return{
            success:true,
            message:"Box deleted successfully",
            deletedBox: {
                id: deletedBox._id,
                boxCode: deletedBox.boxCode,
                boxName: deletedBox.boxName
            }
        }
    }
}
export const boxService = new BoxService(boxRepository);