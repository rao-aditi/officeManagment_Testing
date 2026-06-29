import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../../../api/userApi";
import { getApiErrorMessage } from "../../../helpers/apiError";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userApi.getAllUsers(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch users")
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userApi.createUser(userData);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to create user")
      );
    }
  }
);

export const getUserById = createAsyncThunk(
  "users/getUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserById(id);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch user details")
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUser({ id, data });
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update user")
      );
    }
  }
);

export const activateUser = createAsyncThunk(
  "users/activateUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApi.activateUser(id);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to activate user")
      );
    }
  }
);

export const deactivateUser = createAsyncThunk(
  "users/deactivateUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await userApi.deactivateUser(id);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to deactivate user")
      );
    }
  }
);

const initialState = {
  users: [],
  selectedUser: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  loading: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,

  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },

    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.pagination =
          action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload) {
          state.users.unshift(action.payload);
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User By Id
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedUser = null;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );

        if (index !== -1) {
          state.users[index] = action.payload;
        }

        state.selectedUser = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Activate User
      .addCase(activateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        state.loading = false;

        const updatedUser = action.payload;
        if (!updatedUser?.id) return;

        const index = state.users.findIndex(
          (user) => user.id === updatedUser.id
        );

        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...updatedUser };
        }
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Deactivate User
      .addCase(deactivateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.loading = false;

        const updatedUser = action.payload;
        if (!updatedUser?.id) return;

        const index = state.users.findIndex(
          (user) => user.id === updatedUser.id
        );

        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...updatedUser };
        }
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedUser,
  clearSelectedUser,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;