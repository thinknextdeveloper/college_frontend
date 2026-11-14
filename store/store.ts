import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authslice';
import registerReducer from './slices/registerSlice';
import studentReducer from './slices/studentSlice';


export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
       register: registerReducer,
       student: studentReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];