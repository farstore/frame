"use client";

import { configureStore } from '@reduxjs/toolkit';
import appReducer, { AppState } from './slices/appSlice';

export interface State {
  app: AppState;
}

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

export type Dispatch = typeof store.dispatch;