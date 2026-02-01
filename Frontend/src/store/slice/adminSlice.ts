import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface AdminAuthState {
    admin: any | null;
    token: string | null;
    users: any[]; 
    pagination: {
        totalPages: number;
        totalUsers: number;
        currentPage: number;
    };
    loading: boolean;
    error: string | null;
}

const initialState: AdminAuthState = {
    admin: (() => {
        const adminData = localStorage.getItem('admin');
        return adminData && adminData !== 'undefined' ? JSON.parse(adminData) : null;
    })(),
    token: localStorage.getItem('adminToken') || null,
    users: [],
    pagination: { totalPages: 0, totalUsers: 0, currentPage: 1 },
    loading: false,
    error: null,
};

export const adminLogin = createAsyncThunk('admin/login', async (credentials: any, thunkApi) => {
    try {
        const response = await api.post('/admin/login', credentials);
        if (response.data.success) {
            localStorage.setItem('adminToken', response.data.data.token);
            localStorage.setItem('admin', JSON.stringify(response.data.data.admin));
            return {
                admin: response.data.data.admin,
                token: response.data.data.token
            };
        } else {
            return thunkApi.rejectWithValue('Access denied. Admin privileges required.');
        }
    } catch (error: any) {
        return thunkApi.rejectWithValue(error.response?.data?.message || "Admin login failed");
    }
});

export const fetchAllUsers = createAsyncThunk(
    'admin/fetchAllUsers',
    async ({ page, limit, search, status }: { page: number; limit: number; search?: string; status?: string }, thunkApi) => {
        try {
            let url = `/admin/users?page=${page}&limit=${limit}`;
            if (search && search.trim()) {
                url += `&search=${encodeURIComponent(search.trim())}`;
            }
            if (status && status !== 'ALL STATUS') {
                url += `&status=${encodeURIComponent(status)}`;
            }
            const response = await api.get(url);
            return response.data; 
        } catch (error: any) {
            return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to fetch users");
        }
    }
);

export const toggleBlockUser = createAsyncThunk(
    'admin/toggleBlockUser',
    async (userId: string, thunkApi) => {
        try {
            const response = await api.patch(`/admin/users/${userId}/block`);
            return response.data; 
        } catch (error: any) {
            return thunkApi.rejectWithValue(error.response?.data?.message || "Failed to toggle user status");
        }
    }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    adminLogout: (state) => {
      state.admin = null;
      state.token = null; 
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
    },

    clearAdminError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.admin = action.payload.admin;
          state.token = action.payload.token; 
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; })
     .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
    })
    .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
    })
    .addCase(toggleBlockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase(toggleBlockUser.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different response structures
        const userData = action.payload.data || action.payload;
        const userId = userData.id || userData._id;
        
        const index = state.users.findIndex(user => user._id === userId);
        if (index !== -1) {
            state.users[index].is_blocked = userData.is_blocked;
        }
    })
    .addCase(toggleBlockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });
  }
});

export const { adminLogout, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
