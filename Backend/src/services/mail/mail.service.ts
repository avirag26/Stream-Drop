import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();
export class MailService{
    private transporter;

    constructor(){
        this.transporter=nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        });
    }

    async sendOTP(email:string,otp:string){
        const mailOption = {
            from:`"StreamDrop Team"<${process.env.MAIL_USER}>`,
            to:email,
            subject:"Verify your StreamDrop Account",
            html:`
                 <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb;">StreamDrop Verification</h2>
                    <p>Your 6-digit verification code is:</p>
                    <h1 style="letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px; display: inline-block;">${otp}</h1>
                    <p style="font-size: 12px; color: #64748b; margin-top: 20px;">This code expires in 10 minutes.</p>
                </div>
            `
        };
        return await this.transporter.sendMail(mailOption)
    }
}

export const mailService = new MailService();