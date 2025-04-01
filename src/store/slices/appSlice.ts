import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "axios";

import { AppMetadata, FrameMetadata, getApps, getAppByDomain } from '~/lib/data';
import { State } from '~/store';

// Async Thunk to Fetch Data
export const fetchApps = createAsyncThunk<AppMetadata[], number[]>('app/fetchApps', async (frameIds, { getState }) => {
  const state = getState() as State;
  const missingFrameIds = frameIds.filter((frameId) => state.app.frames[frameId] == undefined);
  try {
    const result = await getApps(missingFrameIds.join(','));
    return result;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw new Error(e.response?.data?.error);
    } else {
      throw new Error((e as Error).message);
    }
  }
});

export const fetchAppByDomain = createAsyncThunk<AppMetadata, string>('app/fetchAppByDomain', async (domain) => {
  try {
    const result = await getAppByDomain(domain);
    return result;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw new Error(e.response?.data?.error);
    } else {
      throw new Error((e as Error).message);
    }
  }
});

export interface AppState {
  error: string | null;
  loading: {
    [key: number]: boolean;
  },
  domains: {
    [key: number]: string;
  },
  frames: {
    [key: number]: FrameMetadata;
  }
  filteredFrameIds: number[];
}

const initialState: AppState = {
  loading: { },
  domains: { },
  frames: { },
  error: null,
  filteredFrameIds: [],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    filterApps: (state, action) => {
      const query = action.payload.toLowerCase();
      state.filteredFrameIds = [];
      for (const frameId in state.frames) {
        if (
          state.frames[frameId].name.toLowerCase().indexOf(query) > -1 ||
          state.frames[frameId].tagline?.toLowerCase().indexOf(query) > -1
        ) {
          state.filteredFrameIds.push(Number(frameId));
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApps.pending, (state, action) => {
        action.meta.arg.map(frameId => {
          state.loading[frameId] = true;
        });
        state.error = null;
      })
      .addCase(fetchApps.fulfilled, (state, action) => {
        action.meta.arg.map(frameId => {
          state.loading[frameId] = false;
        });
        action.payload.forEach((app: AppMetadata) => {
          state.frames[app.frameId] = app.frame;
          state.domains[app.frameId] = app.domain;
        })
      })
      .addCase(fetchApps.rejected, (state, action) => {
        action.meta.arg.map(frameId => {
          state.loading[frameId] = false;
        });
        state.error = action.error.message || null;
      })
      .addCase(fetchAppByDomain.fulfilled, (state, action) => {
        const app = action.payload as AppMetadata;
        console.log('app', app);
        state.frames[app.frameId] = app.frame;
        state.domains[app.frameId] = app.domain;
      })
  },
});

export const { clearError } = appSlice.actions;
export const { filterApps } = appSlice.actions;
export default appSlice.reducer;
