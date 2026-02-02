
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface BoxState {
    items: any[];
    loading: boolean;
    error: string | null;
}

const initialState: BoxState = {
    items: [],
    loading: false,
    error: null,
};


export const fetchBoxes = createAsyncThunk('boxes/fetchAll', async (_, thunkApi) => {
    try {
        const response = await api.get('/boxes');
        return response.data.data; 
    } catch (error: any) {
        return thunkApi.rejectWithValue(error.response.data.message || "Failed to fetch boxes");
    }
});


export const deleteBox = createAsyncThunk('boxes/delete', async (boxId: string, thunkApi) => {
    try {
        await api.delete(`/box/delete/${boxId}`);
        return boxId; 
    } catch (error: any) {
        return thunkApi.rejectWithValue(error.response.data.message || "Delete failed");
    }
});

const boxSlice = createSlice({
    name: 'boxes',
    initialState,
    reducers: {
        clearBoxError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        
            .addCase(fetchBoxes.pending, (state) => { state.loading = true; })
            .addCase(fetchBoxes.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
           
            .addCase(deleteBox.pending, (state) => { state.loading = true; })
            .addCase(deleteBox.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(box => box._id !== action.payload);
            })
            .addCase(deleteBox.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearBoxError } = boxSlice.actions;
export default boxSlice.reducer;