import jwt from 'jsonwebtoken'
import { IToken, IPayload } from '../interface/auth/auth.interface'

export const generateToken = (userId: string, role: 'user' | 'admin' = 'user', tier?: string): IToken => {
    const payload: IPayload = { 
        id: userId,
        role,
        ...(tier && { tier })
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '15m'
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d'
    });

    return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): IPayload => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as IPayload;
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};