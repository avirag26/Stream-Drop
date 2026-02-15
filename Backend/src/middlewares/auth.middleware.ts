import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { IPayload } from '../interface/auth/auth.interface'
import { HTTP_STATUS } from '../constants/httpStatus'
import { MESSAGES } from '../constants/messages'

export interface AuthRequest extends Request {
    user?: IPayload;
}

export class AuthMiddleware {
    public static verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
                success: false, 
                message: "Access denied. No token provided." 
            });
            return;
        }

        const token = authHeader.split(' ')[1]

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as IPayload;

      
            if (decoded.role && decoded.role !== 'user') {
                res.status(HTTP_STATUS.FORBIDDEN).json({ 
                    success: false, 
                    message: "Access denied. Invalid user token." 
                });
                return;
            }

            req.user = decoded;
            next();
        } catch (error) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
                success: false, 
                message: MESSAGES.AUTH.INVALID_SESSION 
            });
        }
    }
}