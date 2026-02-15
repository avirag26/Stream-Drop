import { Request , Response } from "express";
import { BoxService } from "@/services/box/boxService";
import { boxService } from "@/services/box/boxService";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { HTTP_STATUS } from "@/constants/httpStatus";
import { MESSAGES } from "@/constants/messages"; 
export class BoxController {
    constructor(private boxService : BoxService){}

    public create = async (req:AuthRequest,res:Response):Promise<void> =>{
       try {
        const userId = req.user!.id
        const { boxName } = req.body;

        if (!boxName) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MESSAGES.BOX.NAME_REQUIRED
            });
            return;
        }

        const newBox = await this.boxService.createBox(userId, boxName)

        res.status(HTTP_STATUS.CREATED).json({
            success:true,
            message: MESSAGES.BOX.CREATED,
            data:newBox
        })
       } catch (error:any) {
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || MESSAGES.BOX.CREATE_FAILED
            });
       }
    }

    public getBox = async (req: Request, res: Response): Promise<void> => {
        try {
            const  code  = req.params.code as string;
            const box = await this.boxService.getBoxByCode(code)

            if(!box){
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    success:false,
                    message: MESSAGES.BOX.NOT_FOUND
                })
                return;
            }
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGES.BOX.RETRIEVED,
                data: box
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: MESSAGES.BOX.NOT_FOUND
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
         res.status(HTTP_STATUS.NOT_FOUND).json({
            success:false,
            message: MESSAGES.BOX.NO_ACTIVE_SESSION
         })
         return;
       }

       res.status(HTTP_STATUS.OK).json({ 
            success: true, 
            data:box 
        });

       } catch (error:any){
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
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

            res.status(HTTP_STATUS.OK).json({
                success:true,
                 message: MESSAGES.BOX.DELETED,
                 data:result
            })
        } catch (error:any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success:false,
                message:error.message
            })
        }
    }
}
export const boxController = new BoxController(boxService);