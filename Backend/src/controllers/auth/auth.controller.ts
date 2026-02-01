import { Request, Response } from 'express';
import { AuthService, authService } from '@/services/user/authService';

export class AuthController {
    constructor(private authService: AuthService) {}

    public register = async (req: Request, res: Response): Promise<void> => {
        try {
          
            const result = await this.authService.preRegister(req.body);
         
            console.log(result.otp)
            res.status(200).json({
                success: true,
                message: "OTP sent to email. Please verify to complete registration.",
                data:{
                    otp:result.otp
                }
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    };

    public verifyOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, otp } = req.body;

            const result = await this.authService.verifyAndCreate(email, otp);

            res.status(201).json({
                success: true,
                message: "Account verified and created successfully",
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "OTP verification failed"
            });
        }
    };

    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: result
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: error.message || "Authentication failed"
            });
        }
    };

    public forgotPassword = async (req:Request, res:Response):Promise<void>=>{
        try {
            const {email} = req.body;
            await this.authService.forgotPasswordRequest(email)
            res.status(200).json({success:true,message:"Reset OTP sent to your email"});

        } catch (error:any) {
            res.status(400).json({success:false,message:error.message})
        }
    }

    public verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        const result = await this.authService.verifyResetOtp(email, otp);
        
        res.status(200).json({
            success: true,
            message: "OTP verified. You can now reset your password.",
            data: result 
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};


    public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, token, password } = req.body;
        await this.authService.finalizePasswordReset(email, token, password);
        
        res.status(200).json({
            success: true,
            message: "Password updated successfully."
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
    };

    public resendOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, type } = req.body; 
            
            if (type === 'registration') {
                const result = await this.authService.resendRegistrationOtp(email);
                res.status(200).json({
                    success: true,
                    message: "OTP resent successfully",
                    data: { otp: result.otp }
                });
            } else if (type === 'reset') {
                await this.authService.resendResetOtp(email);
                res.status(200).json({
                    success: true,
                    message: "Reset OTP resent successfully"
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Invalid OTP type"
                });
            }
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to resend OTP"
            });
        }
    };
}

export const authController = new AuthController(authService);