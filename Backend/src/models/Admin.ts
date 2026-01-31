import mongoose,{Schema} from "mongoose";
import { IAdminDocument } from "@/interface/admin/admin.interface";

const adminSchema =new Schema<IAdminDocument>(
    
       {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
    },
    {
        timestamps: true
    }
    
)

const Admin = mongoose.model<IAdminDocument>('Admin',adminSchema);
export default Admin