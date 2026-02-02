import { Request , Response } from "express";
import { BoxService } from "@/services/box/boxService";
import { boxService } from "@/services/box/boxService";
import { AuthRequest } from "@/middlewares/auth.middleware"; 
export class BoxController {
    constructor(private boxService : BoxService){}

    public create = async (req:AuthRequest,res:Response):Promise<void> =>{
       try {
        const userId = req.user!.id
        const { boxName } = req.body;

        if (!boxName) {
            res.status(400).json({
                success: false,
                message: "Box name is required"
            });
            return;
        }

        const newBox = await this.boxService.createBox(userId, boxName)

        res.status(201).json({
            success:true,
            message:"Box created successfully",
            data:newBox
        })
       } catch (error:any) {
          res.status(500).json({
                success: false,
                message: error.message || "Failed to create box"
            });
       }
    }

    public getBox = async (req: Request, res: Response): Promise<void> => {
        try {
            const  code  = req.params.code as string;
            const box = await this.boxService.getBoxByCode(code)

            if(!box){
                res.status(404).json({success:false,message:"Box not found"})
                return;
            }
            res.status(200).json({
                success: true,
                message: "Box retrieved",
                data: box
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: "Box not found"
            });
        }
    };

    public getLatestBox = async (req:AuthRequest,res:Response):Promise<void> =>{
       try{
        const userId = req.user!.id
     
       const box = await this.boxService.findLatestByUser(userId)
       console.log("er")
        console.log(box)
       if(!box){
         res.status(404).json({success:false,message:"No active session"})
         return;
       }

       res.status(200).json({ 
            success: true, 
            data:box 
        });

       } catch (error:any){
        res.status(500).json({
            success:false,
            message:error.message
        })
       }
    }

    public deleteBox = async(req:AuthRequest,res:Response):Promise<void>=>{
        try {
            const {boxId} = req.params
            const userId = req.user!.id

            const result = await this.boxService.removeBox(boxId as string,userId)

            res.status(200).json({
                success:true,
                 message:"Box deleted successfully",
                 data:result
            })
        } catch (error:any) {
            res.status(400).json({
                success:false,
                message:error.message
            })
        }
    }
}
export const boxController = new BoxController(boxService);