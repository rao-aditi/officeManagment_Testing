import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentApi } from "../../../api/paymentApi";
import { getApiErrorMessage } from "../../../helpers/apiError";

export const fetchPayments = createAsyncThunk(
  "payments/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getAll(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch payments")
      );
    }
  }
);

export const fetchPaymentsByInvoice = createAsyncThunk(
  "payments/fetchByInvoice",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getByInvoice(invoiceId);
      return { invoiceId, payments: response.data.data.payments || [] };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch invoice payments")
      );
    }
  }
);

export const createPayment = createAsyncThunk(
  "payments/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await paymentApi.create(payload);
      return response.data.data.payment;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to record payment")
      );
    }
  }
);

const paymentSlice = createSlice({
  name: "payments",
  initialState: {
    list: [],
    invoicePayments: {},
    pagination: { total: 0, page: 1, limit: 50, totalPages: 1 },
    loading: false,
    error: null,
  },
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.payments || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPaymentsByInvoice.fulfilled, (state, action) => {
        state.invoicePayments[action.payload.invoiceId] =
          action.payload.payments;
      })
      .addMatcher(
        (action) => createPayment.pending.type === action.type,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => createPayment.fulfilled.type === action.type,
        (state, action) => {
          state.loading = false;
          state.list = [action.payload, ...state.list];
        }
      )
      .addMatcher(
        (action) => createPayment.rejected.type === action.type,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
