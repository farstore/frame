import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "axios";
import { getAddress } from 'viem'

import { UserMetadata, getUsers } from '~/lib/data';
import { State } from '~/store';


// Async Thunk to Fetch Data
export const fetchUsers = createAsyncThunk<UserMetadata[], string[]>('user/fetchUsers', async (userAddresses, { getState }) => {
  const state = getState() as State;
  const missingUserAddresses = userAddresses.filter((a) => state.user.handle[a] == undefined);
  try {
    if (missingUserAddresses.length > 0) {
      let result: UserMetadata[] = [];
      for (let i = 0; i < missingUserAddresses.length; i += 100) {
        result = result.concat(await getUsers(missingUserAddresses.slice(i, i + 100).join(',')));
      }
      return result;
    } else {
      return [];
    }
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw new Error(e.response?.data?.error);
    } else {
      throw new Error((e as Error).message);
    }
  }
});

export interface UserState {
  handle: {
    [key: string]: string | undefined;
  },
}

const initialState: UserState = {
  handle: { },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: { },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        const handle = Object.assign({}, state.handle);
        action.payload.forEach((result: UserMetadata) => {
          handle[getAddress(result.address)] = result.user.username;
        })
        state.handle = handle;
      })
  },
});

export default userSlice.reducer;
