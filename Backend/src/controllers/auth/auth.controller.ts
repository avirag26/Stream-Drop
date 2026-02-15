import { Request, Response } from 'express';
import { AuthService, authService } from '../../services/user/authService';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../constants/messages';

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
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGES.AUTH.OTP_SENT,
                data:{
                    otp:result.otp
                }
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || MESSAGES.AUTH.REGISTRATION_FAILED
            });
        }
    };

    public verifyOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, otp } = req.body;

            const {user,accessToken,refreshToken} = await this.authService.verifyAndCreate(email, otp);

            this.setReshCookie(res,refreshToken)

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: MESSAGES.AUTH.ACCOUNT_VERIFIED,
                data: {user,token:accessToken}
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || MESSAGES.AUTH.OTP_VERIFICATION_FAILED
            });
        }
    };

    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            const {user,accessToken,refreshToken} = await this.authService.login(email, password);
            
            this.setReshCookie(res,refreshToken);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGES.AUTH.LOGIN_SUCCESS,
                data: {user,token:accessToken}
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: error.message || MESSAGES.AUTH.AUTH_FAILED
            });
        }
    };

    public forgotPassword = async (req:Request, res:Response):Promise<void>=>{
        try {
            const {email} = req.body;
            await this.authService.forgotPasswordRequest(email)
            res.status(HTTP_STATUS.OK).json({
                success:true,
                message: MESSAGES.AUTH.RESET_OTP_SENT
            });

        } catch (error:any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success:false,
                message:error.message
            })
        }
    }

    public verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        const result = await this.authService.verifyResetOtp(email, otp);
        
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.AUTH.OTP_VERIFIED,
            data: result 
        });
    } catch (error: any) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
};


    public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, token, password } = req.body;
        await this.authService.finalizePasswordReset(email, token, password);
        
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS
        });
    } catch (error: any) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
    };

    public resendOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, type } = req.body; 
            
            if (type === 'registration') {
                const result = await this.authService.resendRegistrationOtp(email);
                res.status(HTTP_STATUS.OK).json({
                    success: true,
                    message: MESSAGES.AUTH.OTP_RESENT,
                    data: { otp: result.otp }
                });
            } else if (type === 'reset') {
                await this.authService.resendResetOtp(email);
                res.status(HTTP_STATUS.OK).json({
                    success: true,
                    message: MESSAGES.AUTH.RESET_OTP_RESENT
                });
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: MESSAGES.AUTH.INVALID_OTP_TYPE
                });
            }
        } catch (error: any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || MESSAGES.AUTH.RESEND_OTP_FAILED
            });
        }
    };

    public googleLogin = async (req: Request, res: Response): Promise<void> => {
        try {
            const { credential } = req.body;
            const {user,accessToken,refreshToken} = await this.authService.googleLogin(credential);
            
            this.setReshCookie(res,refreshToken)
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGES.AUTH.GOOGLE_LOGIN_SUCCESS,
                data: {user,token:accessToken}
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || MESSAGES.AUTH.GOOGLE_LOGIN_FAILED
            });
        }
    };
    public checkStatus = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user!.id;
            const user = await this.authService.getUserById(userId);
            
            if (!user || user.is_blocked) {
                res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: MESSAGES.AUTH.ACCOUNT_SUSPENDED
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGES.AUTH.ACCOUNT_ACTIVE
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: MESSAGES.AUTH.INVALID_SESSION
            });
        }
    };

    public refreshToken = async (req:Request,res:Response):Promise<void>=>{
        try {
            const token = req.cookies.refreshToken;
            if(!token) throw new Error(MESSAGES.AUTH.NO_REFRESH_TOKEN);

            const {accessToken}=await this.authService.refreshAccessToken(token)

            res.status(HTTP_STATUS.OK).json({
                success:true,
                data:{token:accessToken}
            })
        } catch (error:any) {
            res.status(HTTP_STATUS.FORBIDDEN).json({ 
                success: false, 
                message: MESSAGES.AUTH.INVALID_SESSION 
            });
        }
    }

    public logout = async (req: Request, res: Response): Promise<void> => {
        res.clearCookie('refreshToken');
        res.status(HTTP_STATUS.OK).json({ 
            success: true, 
            message: MESSAGES.AUTH.LOGOUT_SUCCESS 
        });
    };
}

export const authController = new AuthController(authService);