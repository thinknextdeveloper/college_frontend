import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authslice';
import registerReducer from './slices/registerSlice';


export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
       register: registerReducer,
      // add more slices here later: application, admin, notifications...
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];