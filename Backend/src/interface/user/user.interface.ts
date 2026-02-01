import {Document ,Types} from 'mongoose'

export interface IUser{
    name:string;
    email:string;
    password:string;
    is_blocked:boolean;
    is_verified:boolean;
    tier:string;
    googleId?:string;
    avatar?:string;
    createdAt?:Date;
    updatedAt?:Date;
}

export interface IUserDocument extends IUser ,Document{
    _id:Types.ObjectId
}