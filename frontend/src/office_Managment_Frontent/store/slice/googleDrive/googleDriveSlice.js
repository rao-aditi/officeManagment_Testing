import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { googleDriveApi } from "../../../api/googleDriveApi";
import { getApiErrorMessage } from "../../../helpers/apiError";

export const fetchGoogleDriveStatus = createAsyncThunk(
  "googleDrive/fetchStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await googleDriveApi.getStatus();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch Google Drive status")
      );
    }
  }
);

export const getGoogleDriveAuthUrl = createAsyncThunk(
  "googleDrive/getAuthUrl",
  async (_, { rejectWithValue }) => {
    try {
      const response = await googleDriveApi.getAuthUrl();
      return response.data.data.url;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to start Google Drive connection")
      );
    }
  }
);

export const disconnectGoogleDrive = createAsyncThunk(
  "googleDrive/disconnect",
  async (_, { rejectWithValue }) => {
    try {
      await googleDriveApi.disconnect();
      return null;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to disconnect Google Drive")
      );
    }
  }
);

const googleDriveSlice = createSlice({
  name: "googleDrive",
  initialState: {
    connected: false,
    email: null,
    loading: false,
    connecting: false,
    disconnecting: false,
    error: null,
  },
  reducers: {
    clearGoogleDriveError: (state) => {
      state.error = null;
    },
    setGoogleDriveConnected: (state, action) => {
      state.connected = Boolean(action.payload?.connected);
      state.email = action.payload?.email || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoogleDriveStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoogleDriveStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.connected = Boolean(action.payload?.connected);
        state.email = action.payload?.email || null;
      })
      .addCase(fetchGoogleDriveStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getGoogleDriveAuthUrl.pending, (state) => {
        state.connecting = true;
        state.error = null;
      })
      .addCase(getGoogleDriveAuthUrl.fulfilled, (state) => {
        state.connecting = false;
      })
      .addCase(getGoogleDriveAuthUrl.rejected, (state, action) => {
        state.connecting = false;
        state.error = action.payload;
      })
      .addCase(disconnectGoogleDrive.pending, (state) => {
        state.disconnecting = true;
        state.error = null;
      })
      .addCase(disconnectGoogleDrive.fulfilled, (state) => {
        state.disconnecting = false;
        state.connected = false;
        state.email = null;
      })
      .addCase(disconnectGoogleDrive.rejected, (state, action) => {
        state.disconnecting = false;
        state.error = action.payload;
      });
  },
});

export const { clearGoogleDriveError, setGoogleDriveConnected } =
  googleDriveSlice.actions;
export default googleDriveSlice.reducer;
