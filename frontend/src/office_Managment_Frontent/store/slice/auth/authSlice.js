import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosConfig";
import { apiEndPoints } from "../../../helpers/constants";

export const reqToUserLogin = createAsyncThunk(
  "reqToUserLogin",
  async (reqData = {}, { rejectWithValue }) => {
    try {
      const { onSuccess, onError, ...requestParams } = reqData;

      const response = await axiosInstance.post(
        apiEndPoints.userLogin,
        requestParams
      );

      if (onSuccess) onSuccess(response.data);

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong";

      return rejectWithValue(errorMessage);
    }
  }
);

export const getEnums = createAsyncThunk(
  "auth/getEnums",
  async (requestParams = {}, { rejectWithValue }) => {
    try {

      const response = await axiosInstance.post(
        apiEndPoints.getEnums,
        requestParams
      );

      return response.data;
    } catch (error) {

      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch enums"
      );
    }
  }
);

export const fetchUserPermissions = createAsyncThunk(
  "auth/fetchUserPermissions",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await axiosInstance.get(apiEndPoints.userPermissions, {
        signal,
      });
      return response.data;
    } catch (err) {
      if (signal.aborted || err.code === "ERR_CANCELED") {
        return rejectWithValue({ aborted: true });
      }
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch permissions."
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { permissionsLoading, permissions } = getState().auth;
      if (permissionsLoading) return false;
      if (permissions?.length > 0) return false;
      return Boolean(localStorage.getItem("accessToken"));
    },
  }
);

const initialState = {
  userDetails: null,
  permissions: [],
  permissionsLoading: false,
  enums: {},
  loading: false,
  enumsLoading: false,
  error: null,
  message: null,
};

// SLICE 
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.userDetails = null;
      state.permissions = [];
      state.error = null;
      state.loading = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload || [];
    },
  },
  extraReducers: (builder) => {
    builder

      // USER LOGIN
      .addCase(reqToUserLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(reqToUserLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload?.data?.user;
        state.permissions = action.payload?.data?.user?.permissions || [];

        const accessToken = action.payload?.data?.token?.accessToken;
        const refreshToken = action.payload?.data?.token?.refreshToken;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        localStorage.setItem(
          "userData",
          JSON.stringify(action.payload?.data?.user)
        );
      })
      .addCase(reqToUserLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetched Enums
      .addCase(getEnums.pending, (state) => {
        state.enumsLoading = true;
        state.error = null;
      })

      // .addCase(getEnums.fulfilled, (state, action) => {
      //   state.enumsLoading = false;
      //   state.enums = action.payload?.data?.enums || {};
      // })

      .addCase(getEnums.fulfilled, (state, action) => {
        state.enumsLoading = false;

        state.enums = {
          ...state.enums,
          ...(action.payload?.data?.enums || {}),
        };
      })

      .addCase(getEnums.rejected, (state, action) => {
        state.enumsLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchUserPermissions.pending, (state) => {
        state.permissionsLoading = true;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        state.permissions = action.payload?.data?.permissions || [];
        if (action.payload?.data?.role && state.userDetails) {
          state.userDetails.role = action.payload.data.role;
        }
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.permissionsLoading = false;
        if (action.meta.aborted || action.payload?.aborted) return;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setPermissions } = authSlice.actions;
export default authSlice.reducer;
