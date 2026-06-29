import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clientApi } from "../../../api/clientApi";
import { getApiErrorMessage } from "../../../helpers/apiError";

export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await clientApi.getAllClients(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch clients"));
    }
  }
);

export const fetchClientById = createAsyncThunk(
  "clients/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await clientApi.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch client"));
    }
  }
);

const initialState = {
  clients: [],
  selectedClient: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  loading: false,
  error: null,
};

const clientSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload.clients || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedClient = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedClient = action.payload;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedClient, clearError } = clientSlice.actions;
export default clientSlice.reducer;
