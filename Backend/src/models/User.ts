import { Schema, model } from 'mongoose';
import { IUserDocument } from '@/interface/user/user.interface';

const userSchema = new Schema<IUserDocument>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        is_blocked: { type: Boolean, default: false },
        is_verified: { type: Boolean, default: false }, 
        tier: { type: Boolean, default: false },
    },
    {
        timestamps: true
    }
);


userSchema.index({ email: 1 });

export default model<IUserDocument>('User', userSchema);