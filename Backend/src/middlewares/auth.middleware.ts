import {Request , Response , NextFunction} from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request{
    user?:{
        id:string;
        tier:boolean
    };
}

export class AuthMiddleware {
    public static verifyToken = (req: AuthRequest,res:Response,next:NextFunction):void=>{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer')){
            res.status(401).json({success:false,message:"Access denied .No token provided."});
            return;
        }

        const token = authHeader.split(' ')[1]

        try {
            const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as {id:string;tier:boolean};

            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({success:false,message:"Invalid or expired token."});
        }
    }
}