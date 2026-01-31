import { Document } from "mongoose";

export interface IAdmin{
    name:string;
    email:string;
    password:string;
    createdAt?:Date;
    updatedAt?:Date;
}

export interface IAdminDocument extends IAdmin , Document {}
