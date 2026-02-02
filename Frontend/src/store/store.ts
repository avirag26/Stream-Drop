import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import adminReducer from './slice/adminSlice';
import boxReducer from './slice/boxSlice'
export const store = configureStore({
    reducer:{
        auth:authReducer,
        admin:adminReducer,
        boxes: boxReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;