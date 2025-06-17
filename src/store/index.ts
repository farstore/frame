"use client";

import { configureStore } from '@reduxjs/toolkit';
import appReducer, { AppState } from './slices/appSlice';
import userReducer, { UserState } from './slices/userSlice';

export interface State {
  app: AppState;
  user: UserState;
}

export const store = configureStore({
  reducer: {
    app: appReducer,
    user: userReducer,
  },
});

export type Dispatch = typeof store.dispatch;