import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api'

interface AuthState {
    user: any | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    resetStep: number;
    tempEmail: string | null;
    resetToken: string | null;
    isVerifying: boolean;
    resendLoading: boolean;
}

const initialState: AuthState = {
    user: (() => {
        const userData = localStorage.getItem('user');
        return userData && userData !== 'undefined' ? JSON.parse(userData) : null;
    })(),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    resetStep: 1,
    tempEmail: null,
    resetToken: null,
    isVerifying: false,
    resendLoading: false,
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

export const resendOtp = createAsyncThunk('auth/resendOtp', async (data: { email: string, type: 'registration' | 'reset' }, thunkApi) => {
    try {
        const response = await api.post('/auth/resend-otp', data);
        return response.data;
    } catch (error: any) {
        return thunkApi.rejectWithValue(error.response.data.message || "Failed to resend OTP");
    }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async (credential: string, thunkApi) => {
    try {
        const response = await api.post('/auth/google-login', { credential });
        if (response.data.success) {
            return response.data.data;
        }
    } catch (error: any) {
        return thunkApi.rejectWithValue(error.response.data.message || "Google login failed");
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        setToken: (state, action) => {
            state.token = action.payload;
            localStorage.setItem('token', action.payload);
        },
        clearError: (state) => {
            state.error = null;
        },
        resetForgotPasswordState: (state) => {
            state.resetStep = 1;
            state.tempEmail = null;
            state.resetToken = null;
            state.error = null;
        },
        cancelVerification: (state) => {
            state.isVerifying = false;
            state.tempEmail = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.isVerifying = true;
                    state.tempEmail = action.payload.email;
                }
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(verifyAccountOtp.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(verifyAccountOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.isVerifying = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(verifyAccountOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string
            })
            .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
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
            })
            .addCase(verifyResetOtp.fulfilled, (state, action) => {
                console.log('verifyResetOtp.fulfilled payload:', action.payload);
                state.loading = false;
                state.resetToken = action.payload.resetToken;
                state.resetStep = 3;
                console.log('Updated state:', { resetToken: state.resetToken, resetStep: state.resetStep });
            })
            .addCase(verifyResetOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(finalizeReset.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(finalizeReset.fulfilled, (state) => {
                state.loading = false;
                state.resetStep = 1;
                state.tempEmail = null;
                state.resetToken = null;
                state.error = null;
            })
            .addCase(finalizeReset.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(resendOtp.pending, (state) => {
                state.resendLoading = true;
                state.error = null;
            })
            .addCase(resendOtp.fulfilled, (state) => {
                state.resendLoading = false;
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.resendLoading = false;
                state.error = action.payload as string;
            })
            .addCase(googleLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
})

export const { logout, setToken, clearError, resetForgotPasswordState, cancelVerification } = authSlice.actions;
export default authSlice.reducer