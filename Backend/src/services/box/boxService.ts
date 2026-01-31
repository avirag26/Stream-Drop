import { BoxRepository ,boxRepository} from "@/repositories/Box/box.repo";
import crypto from  'crypto'

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
            code = crypto.randomInt(100000, 999999).toString();
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

}
export const boxService = new BoxService(boxRepository);