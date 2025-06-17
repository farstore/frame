import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "axios";

import { AppMetadata, FrameMetadata, getAllApps, getAppByDomain } from '~/lib/data';
// import { State } from '~/store';
import { fetchUsers } from './userSlice';

// Async Thunk to Fetch Data
export const fetchAllApps = createAsyncThunk<AppMetadata[], void>('app/fetchAllApps', async (_, { dispatch }) => {
  try {
    const results = await getAllApps();
    if (results.length > 0) {
      dispatch(fetchUsers(results.map(r => r.owner)));
    }
    return results;
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
  tokens: {
    [key: string]: string | null;
  },
  owners: {
    [key: string]: string;
  },
  symbols: {
    [key: string]: string;
  },
  liquidity: {
    [key: string]: number;
  },
  createTimes: {
    [key: string]: number;
  },
  funding: {
    [key: string]: number;
  },
  frames: {
    [key: string]: FrameMetadata;
  }
  filteredDomains: string[];
  sortedDomains: string[];
  count: number;
}

const initialState: AppState = {
  tokens: { },
  owners: { },
  symbols: { },
  liquidity: { },
  funding: { },
  createTimes: { },
  frames: { },
  error: null,
  filteredDomains: [],
  sortedDomains: [],
  count: 0
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    filterApps: (state, action) => {
      const { filter } = action.payload;
      const search = action.payload.search.toLowerCase();
      const domains = Object.keys(state.frames).filter(domain => {
        if (search.length == 0) {
          return true;
        }
        return state.frames[domain].name.toLowerCase().indexOf(search) > -1;
      });
      if (filter == 'trade') {
        state.filteredDomains = domains
        .filter(a => state.liquidity[a] > 0)
        .sort((a, b) => {
          if (state.liquidity[a] == state.liquidity[b]) {
            return state.createTimes[a] > state.createTimes[b] ? -1 : 1;
          }
          return state.liquidity[a] > state.liquidity[b] ? -1 : 1
        });
      } else if (filter == 'fund') {
        state.filteredDomains = domains
        .filter(a => state.liquidity[a] == 0)
        .sort((a, b) => {
          if (state.funding[a] == state.funding[b]) {
            return state.createTimes[a] > state.createTimes[b] ? -1 : 1;
          }
          return state.funding[a] > state.funding[b] ? -1 : 1;
        });
      } else {
        // search
        state.filteredDomains = domains
        .sort((a, b) => state.frames[a].name < state.frames[b].name ? -1 : 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllApps.fulfilled, (state, action) => {
        action.payload.forEach((app: AppMetadata) => {
          state.frames[app.domain] = app.frame;
          state.tokens[app.domain] = app.token;
          state.owners[app.domain] = app.owner;
          state.symbols[app.domain] = app.symbol;
          state.liquidity[app.domain] = app.liquidity;
          state.funding[app.domain] = app.funding;
          state.createTimes[app.domain] = app.createTime;
        })
        state.count = Object.keys(state.frames).length;
      })
      .addCase(fetchAppByDomain.fulfilled, (state, action) => {
        const app = action.payload as AppMetadata;
        state.frames[app.domain] = app.frame;
        state.tokens[app.domain] = app.token;
        state.owners[app.domain] = app.owner;
        state.symbols[app.domain] = app.symbol;
        state.liquidity[app.domain] = app.liquidity;
        state.funding[app.domain] = app.funding;
        state.createTimes[app.domain] = app.createTime;
        state.count = Object.keys(state.frames).length;
      })
  },
});

export const { clearError } = appSlice.actions;
export const { filterApps } = appSlice.actions;
export default appSlice.reducer;
