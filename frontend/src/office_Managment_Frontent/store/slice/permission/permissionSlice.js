import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosConfig";
import { apiEndPoints } from "../../../helpers/constants";

export const fetchPermissionMatrix = createAsyncThunk(
  "permission/fetchPermissionMatrix",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(apiEndPoints.permissionMatrix);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch permission matrix."
      );
    }
  }
);

export const assignPermissionToRole = createAsyncThunk(
  "permission/assignPermissionToRole",
  async ({ roleId, permissionIds }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(apiEndPoints.rolePermissions, {
        roleId,
        permissionIds,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to assign permission."
      );
    }
  }
);

export const removePermissionFromRole = createAsyncThunk(
  "permission/removePermissionFromRole",
  async ({ roleId, permissionIds }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(apiEndPoints.rolePermissions, {
        data: { roleId, permissionIds },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove permission."
      );
    }
  }
);

const initialState = {
  matrix: { roles: [], permissions: [] },
  matrixLoading: false,
  matrixError: null,
  matrixActionLoading: false,
};

const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {
    clearMatrixError: (state) => {
      state.matrixError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissionMatrix.pending, (state) => {
        state.matrixLoading = true;
        state.matrixError = null;
      })
      .addCase(fetchPermissionMatrix.fulfilled, (state, action) => {
        state.matrixLoading = false;
        state.matrix = action.payload?.data || { roles: [], permissions: [] };
      })
      .addCase(fetchPermissionMatrix.rejected, (state, action) => {
        state.matrixLoading = false;
        state.matrixError = action.payload;
      })
      .addCase(assignPermissionToRole.pending, (state) => {
        state.matrixActionLoading = true;
      })
      .addCase(assignPermissionToRole.fulfilled, (state) => {
        state.matrixActionLoading = false;
      })
      .addCase(assignPermissionToRole.rejected, (state, action) => {
        state.matrixActionLoading = false;
        state.matrixError = action.payload;
      })
      .addCase(removePermissionFromRole.pending, (state) => {
        state.matrixActionLoading = true;
      })
      .addCase(removePermissionFromRole.fulfilled, (state) => {
        state.matrixActionLoading = false;
      })
      .addCase(removePermissionFromRole.rejected, (state, action) => {
        state.matrixActionLoading = false;
        state.matrixError = action.payload;
      });
  },
});

export const { clearMatrixError } = permissionSlice.actions;
export default permissionSlice.reducer;
