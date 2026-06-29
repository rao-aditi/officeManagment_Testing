import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { quotationApi } from "../../../api/quotationApi";
import { getApiErrorMessage } from "../../../helpers/apiError";

export const fetchQuotations = createAsyncThunk(
  "quotations/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await quotationApi.getAll(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch quotations")
      );
    }
  }
);

export const fetchQuotationById = createAsyncThunk(
  "quotations/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await quotationApi.getById(id);
      return response.data.data.quotation;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch quotation")
      );
    }
  }
);

export const createQuotation = createAsyncThunk(
  "quotations/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await quotationApi.create(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to create quotation")
      );
    }
  }
);

export const updateQuotation = createAsyncThunk(
  "quotations/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await quotationApi.update(id, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update quotation")
      );
    }
  }
);

export const updateQuotationStatus = createAsyncThunk(
  "quotations/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await quotationApi.updateStatus(id, status);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update quotation status")
      );
    }
  }
);

const quotationSlice = createSlice({
  name: "quotations",
  initialState: {
    list: [],
    selected: null,
    pagination: { total: 0, page: 1, limit: 50, totalPages: 1 },
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedQuotation: (state) => {
      state.selected = null;
    },
    clearQuotationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.quotations || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchQuotationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchQuotationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addMatcher(
        (action) =>
          [
            createQuotation.pending.type,
            updateQuotation.pending.type,
            updateQuotationStatus.pending.type,
          ].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [
            createQuotation.fulfilled.type,
            updateQuotation.fulfilled.type,
            updateQuotationStatus.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;

          const quotation =
            action.payload?.data?.quotation || action.payload;

          if (action.type === createQuotation.fulfilled.type) {
            state.list = [quotation, ...state.list];
          } else {
            state.list = state.list.map((item) =>
              item.id === quotation.id ? quotation : item
            );
            state.selected = quotation;
          }
        }
      )
      .addMatcher(
        (action) =>
          [
            createQuotation.rejected.type,
            updateQuotation.rejected.type,
            updateQuotationStatus.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearSelectedQuotation, clearQuotationError } =
  quotationSlice.actions;
export default quotationSlice.reducer;
