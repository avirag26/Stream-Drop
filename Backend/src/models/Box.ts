import { Schema , model } from "mongoose";
import { IBoxDocument } from "@/interface/box/box.interface";

const boxSchema = new Schema<IBoxDocument>({
    boxCode:{type:String,required:true,unique:true},
    boxName:{type:String,required:true},
    creatorId:{type:Schema.Types.ObjectId,ref:'User',default:null},
    expiresAt:{type:Date,required:true,index:{expires:0}}
},{
    timestamps: true
}


)

export default model<IBoxDocument>('Box',boxSchema)