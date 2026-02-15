export const MESSAGES = {
 
  AUTH: {
    OTP_SENT: 'OTP sent to email. Please verify to complete registration.',
    ACCOUNT_VERIFIED: 'Account verified and created successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out',
    RESET_OTP_SENT: 'Reset OTP sent to your email',
    OTP_VERIFIED: 'OTP verified. You can now reset your password.',
    PASSWORD_RESET_SUCCESS: 'Password updated successfully.',
    OTP_RESENT: 'OTP resent successfully',
    RESET_OTP_RESENT: 'Reset OTP resent successfully',
    GOOGLE_LOGIN_SUCCESS: 'Google login successful',
    ACCOUNT_ACTIVE: 'Active',
    ACCOUNT_SUSPENDED: 'Account suspended',
    INVALID_SESSION: 'Invalid session',
    NO_REFRESH_TOKEN: 'No refresh token provided',
    
    
    REGISTRATION_FAILED: 'Registration failed',
    OTP_VERIFICATION_FAILED: 'OTP verification failed',
    AUTH_FAILED: 'Authentication failed',
    INVALID_OTP_TYPE: 'Invalid OTP type',
    RESEND_OTP_FAILED: 'Failed to resend OTP',
    GOOGLE_LOGIN_FAILED: 'Google login failed',
  },

  
  PROFILE: {
    FETCH_SUCCESS: 'Profile fetched successfully',
    UPDATE_SUCCESS: 'Profile update successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    
    
    FETCH_FAILED: 'Failed to fetch profile',
    UPDATE_FAILED: 'Failed to update profile',
    PASSWORD_CHANGE_FAILED: 'Failed to change password',
  },

  
  BOX: {
    CREATED: 'Box created successfully',
    RETRIEVED: 'Box retrieved',
    DELETED: 'Box deleted successfully',
    NAME_REQUIRED: 'Box name is required',
    NOT_FOUND: 'Box not found',
    NO_ACTIVE_SESSION: 'No active session',
    
    
    CREATE_FAILED: 'Failed to create box',
  },

  
  ADMIN: {
    CREATED: 'Admin created successfully',
    LOGIN_SUCCESS: 'Admin authenticated successfully',
    LOGOUT_SUCCESS: 'Admin logged out successfully',
    TOKEN_REFRESHED: 'Admin token refreshed successfully',
    USERS_RETRIEVED: 'User retrieved successfully',
    USER_BLOCKED: 'blocked',
    USER_UNBLOCKED: 'unblocked',
    
    
    REGISTRATION_FAILED: 'Registration failed',
    INVALID_CREDENTIALS: 'invalid credentials',
    TOKEN_REFRESH_FAILED: 'Failed to refresh admin token',
  },

  
  COMMON: {
    SUCCESS: 'Operation successful',
    FAILED: 'Operation failed',
  },
} as const;
