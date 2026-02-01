import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api'

interface AuthState {
    user: any | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    success: string | null;
    resetStep: number;
    tempEmail: string | null;
    resetToken: string | null;
    isVerifying: boolean;
}

const initialState: AuthState = {
    user: (() => {
        const userData = localStorage.getItem('user');
        return userData && userData !== 'undefined' ? JSON.parse(userData) : null;
    })(),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    success: null,
    resetStep: 1,
    tempEmail: null,
    resetToken: null,
    isVerifying: false,
}

export const registerUser = createAsyncThunk('auth/register', async (userData: any, thunkApi) => {
    try {
        const response = await api.post('/auth/register', userData);
        if (response.data.success) {
            return { email: userData.email };
        }
    } catch (error: any) {
        return thunkApi.rejectWithValue(error.response.data.message || "Registration failed")
    }
})

export const verifyAccountOtp = createAsyncThunk('auth/verifyAccount', async (data: { email: string, otp: string }, thunkApi) => {
    try {
        const response = await api.post('/auth/verify-otp', data);
        if (response.data.success) {
            return response.data.data;
        }
    } catch (error: any) {
        return thunkApi.rejectWithValue(error.response.data.message || "Verification failed");
    }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials: any, thunkApi) => {
    try {
        const response = await api.post('/auth/login', credentials);
        if (response.data.success) {
            return response.data.data
        }
    } catch (error: any) {
        return thunkApi.rejectWithValue(error.response.data.message || "Login failed")
    }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email: string, thunkApi) => {
    try {
        await api.post('/auth/forgot-password', { email });
        return { email }
    } catch (error: any) {
        return thunkApi.rejectWithValue(error.response.data.message || "Failed to send OTP");
    }
})

export const verifyResetOtp = createAsyncThunk('auth/verifyOtp', async (data: { email: string, otp: string }, thunkApi) => {
    try {
        const response = await api.post('/auth/verify-reset-otp', data);
        console.log('verifyResetOtp response:', response.data);
        return response.data.data;
    } catch (error: any) {
        console.log('verifyResetOtp error:', error.response?.data);
        return thunkApi.rejectWithValue(error.response.data.message || "Invalid OTP");
    }
});

export const finalizeReset = createAsyncThunk('auth/finalizeReset', async (data: any, thunkApi) => {
    try {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    } catch (error: any) {
        return thunkApi.rejectWithValue(error.response.data.message || "Password reset failed");
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null
            state.token = null
            state.error = null
            state.success = null
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = null;
        },
        resetForgotPasswordState: (state) => {
            state.resetStep = 1;
            state.tempEmail = null;
            state.resetToken = null;
            state.error = null;
            state.success = null;
        },
        cancelVerification: (state) => {
            state.isVerifying = false;
            state.tempEmail = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; state.success = null; })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = "Registration successful! Please check your email for verification.";
                if (action.payload) {
                    state.isVerifying = true;
                    state.tempEmail = action.payload.email;
                }
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(verifyAccountOtp.pending, (state) => { state.loading = true; state.error = null; state.success = null; })
            .addCase(verifyAccountOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.isVerifying = false;
                state.success = "Account verified successfully! Welcome to StreamDrop.";
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(verifyAccountOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; state.success = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = "Login successful! Welcome back.";
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string
            })
            .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null; state.success = null; })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = "OTP sent successfully! Please check your email.";
                state.tempEmail = action.payload.email;
                state.resetStep = 2;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(verifyResetOtp.pending, (state) => { 
                state.loading = true; 
                state.error = null; 
                state.success = null;
            })
            .addCase(verifyResetOtp.fulfilled, (state, action) => {
                console.log('verifyResetOtp.fulfilled payload:', action.payload);
                state.loading = false;
                state.success = "OTP verified successfully! You can now reset your password.";
                state.resetToken = action.payload.resetToken;
                state.resetStep = 3;
                console.log('Updated state:', { resetToken: state.resetToken, resetStep: state.resetStep });
            })
            .addCase(verifyResetOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(finalizeReset.fulfilled, (state) => {
                state.loading = false;
                state.success = "Password reset successful! You can now login with your new password.";
                state.resetStep = 1;
                state.tempEmail = null;
                state.resetToken = null;
                state.error = null;
            });
    }
})

export const { logout, clearError, clearSuccess, resetForgotPasswordState, cancelVerification } = authSlice.actions;
export default authSlice.reducer