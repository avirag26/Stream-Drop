import { Document , Types } from "mongoose";

export interface IBox {
    boxCode:string;
    boxName:string;
    creatorId:Types.ObjectId | null;
    expiresAt:Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IBoxDocument extends IBox,Document{
    _id:Types.ObjectId;
}