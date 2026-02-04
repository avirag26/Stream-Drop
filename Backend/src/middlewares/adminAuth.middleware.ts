import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IPayload } from '../interface/auth/auth.interface';

export interface AdminAuthRequest extends Request {
    admin?: IPayload;
}

export class AdminAuthMiddleware {
    public static verifyAdminToken = (req: AdminAuthRequest, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            res.status(401).json({ success: false, message: "Access denied. No token provided." });
            return;
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as IPayload;

           
            if (decoded.role !== 'admin') {
                res.status(403).json({ success: false, message: "Access denied. Admin privileges required." });
                return;
            }

            req.admin = decoded;
            next();
        } catch (error) {
            res.status(401).json({ success: false, message: "Invalid or expired token." });
        }
    };
}