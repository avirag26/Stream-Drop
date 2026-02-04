import { Request, Response } from 'express';
import { AuthService, authService } from '../../services/user/authService';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class AuthController {
    constructor(private authService: AuthService) {}

   private setReshCookie(res:Response,token:string){
    res.cookie('refreshToken',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:'strict',
        maxAge:7*24*60*60*1000
    })
   }

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

            const {user,accessToken,refreshToken} = await this.authService.verifyAndCreate(email, otp);

            this.setReshCookie(res,refreshToken)

            res.status(201).json({
                success: true,
                message: "Account verified and created successfully",
                data: {user,token:accessToken}
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
            const {user,accessToken,refreshToken} = await this.authService.login(email, password);
            
            this.setReshCookie(res,refreshToken);

            res.status(200).json({
                success: true,
                message: "Login successful",
                data: {user,token:accessToken}
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

    public googleLogin = async (req: Request, res: Response): Promise<void> => {
        try {
            const { credential } = req.body;
            const {user,accessToken,refreshToken} = await this.authService.googleLogin(credential);
            
            this.setReshCookie(res,refreshToken)
            res.status(200).json({
                success: true,
                message: "Google login successful",
                data: {user,token:accessToken}
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Google login failed"
            });
        }
    };
    public checkStatus = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user!.id;
            const user = await this.authService.getUserById(userId);
            
            if (!user || user.is_blocked) {
                res.status(403).json({
                    success: false,
                    message: "Account suspended"
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Active"
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: "Invalid session"
            });
        }
    };

    public refreshToken = async (req:Request,res:Response):Promise<void>=>{
        try {
            const token = req.cookies.refreshToken;
            if(!token) throw new Error("No refresh token provided");

            const {accessToken}=await this.authService.refreshAccessToken(token)

            res.status(200).json({
                success:true,
                data:{token:accessToken}
            })
        } catch (error:any) {
            res.status(403).json({ success: false, message: "Invalid session" });
        }
    }

    public logout = async (req: Request, res: Response): Promise<void> => {
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: "Logged out" });
    };
}

export const authController = new AuthController(authService);