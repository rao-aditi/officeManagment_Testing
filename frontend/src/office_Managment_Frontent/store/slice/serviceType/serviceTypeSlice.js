import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { serviceTypeApi } from "../../../api/serviceTypeApi";
import { getApiErrorMessage } from "../../../helpers/apiError";

export const fetchServiceTypes = createAsyncThunk(
  "serviceTypes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.getAll();
      return response.data.data.serviceTypes;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch service types")
      );
    }
  }
);

export const fetchServiceTypeById = createAsyncThunk(
  "serviceTypes/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.getById(id);
      return response.data.data.serviceType;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch service type")
      );
    }
  }
);

export const createServiceType = createAsyncThunk(
  "serviceTypes/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.create(payload);
      return response.data.data.serviceType;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to create service type")
      );
    }
  }
);

export const updateServiceType = createAsyncThunk(
  "serviceTypes/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await serviceTypeApi.update(id, data);
      return response.data.data.serviceType;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update service type")
      );
    }
  }
);

export const deleteServiceType = createAsyncThunk(
  "serviceTypes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await serviceTypeApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to delete service type")
      );
    }
  }
);

const serviceTypeSlice = createSlice({
  name: "serviceTypes",
  initialState: {
    list: [],
    selectedItem: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedServiceType: (state) => {
      state.selectedItem = null;
    },
    clearServiceTypeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchServiceTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchServiceTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchServiceTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addMatcher(
        (action) =>
          [
            createServiceType.pending.type,
            updateServiceType.pending.type,
            deleteServiceType.pending.type,
          ].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [
            createServiceType.fulfilled.type,
            updateServiceType.fulfilled.type,
            deleteServiceType.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;
          if (action.type === createServiceType.fulfilled.type) {
            state.list = [...state.list, action.payload].sort((a, b) =>
              (a.serviceName || "").localeCompare(b.serviceName || "")
            );
          }
          if (action.type === updateServiceType.fulfilled.type) {
            state.list = state.list
              .map((item) =>
                item.id === action.payload.id ? action.payload : item
              )
              .sort((a, b) =>
                (a.serviceName || "").localeCompare(b.serviceName || "")
              );
            state.selectedItem = action.payload;
          }
          if (action.type === deleteServiceType.fulfilled.type) {
            state.list = state.list.filter((item) => item.id !== action.payload);
            if (state.selectedItem?.id === action.payload) {
              state.selectedItem = null;
            }
          }
        }
      )
      .addMatcher(
        (action) =>
          [
            createServiceType.rejected.type,
            updateServiceType.rejected.type,
            deleteServiceType.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearSelectedServiceType, clearServiceTypeError } =
  serviceTypeSlice.actions;
export default serviceTypeSlice.reducer;
