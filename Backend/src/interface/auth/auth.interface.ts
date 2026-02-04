import { JwtPayload } from "jsonwebtoken";

export interface IPayload extends JwtPayload{
    id: string;
    role?: 'user' | 'admin';
    tier?: string;
}

export interface IToken {
    accessToken: string;
    refreshToken: string;
}