import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  tier: string;
  is_verified: boolean;
  createdAt: string;
  profilePhoto?: string;
}

interface ProfileState {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  passwordLoading: boolean;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  updateLoading: false,
  passwordLoading: false,
};

export const fetchProfile = createAsyncThunk('profile/fetch', async (_, thunkApi) => {
  try {
    const response = await api.get('/profile');
    if (response.data.success) {
      return response.data.data;
    }
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.response?.data?.message || 'Failed to load profile');
  }
});

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (updates: { name?: string }, thunkApi) => {
    try {
      const response = await api.put('/profile', updates);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (data: { currentPassword: string; newPassword: string }, thunkApi) => {
    try {
      const response = await api.post('/profile/change-password', data);
      if (response.data.success) {
        return response.data;
      }
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

export const uploadProfilePhoto = createAsyncThunk(
  'profile/uploadPhoto',
  async (file: File, thunkApi) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/profile/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        return response.data.data.profilePhoto;
      }
    } catch (error: any) {
      return thunkApi.rejectWithValue(error.response?.data?.message);
    }
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      })
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadProfilePhoto.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(uploadProfilePhoto.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (state.profile) {
          state.profile.profilePhoto = action.payload;
        }
      })
      .addCase(uploadProfilePhoto.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      })
  },
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;
