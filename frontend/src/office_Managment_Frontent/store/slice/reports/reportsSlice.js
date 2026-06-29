import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reportsApi } from "../../../api/reportsApi";
import { getApiErrorMessage } from "../../../helpers/apiError";

// Helper for mapping report type to api call
const getApiMethod = (reportType) => {
  switch (reportType) {
    case 'tasks': return reportsApi.getTasksReport;
    case 'overdue': return reportsApi.getOverdueReport;
    case 'clients': return reportsApi.getClientsReport;
    case 'fees': return reportsApi.getFeesReport;
    case 'invoices': return reportsApi.getInvoicesReport;
    case 'payments': return reportsApi.getPaymentsReport;
    case 'staff-performance': return reportsApi.getStaffPerformanceReport;
    default: return null;
  }
};

export const fetchReportData = createAsyncThunk(
  "reports/fetchReportData",
  async ({ reportType, filters }, { rejectWithValue }) => {
    try {
      const apiMethod = getApiMethod(reportType);
      if (!apiMethod) throw new Error("Invalid report type");

      const response = await apiMethod(filters);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch report data"));
    }
  }
);

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearReportData: (state) => {
      state.data = [];
    },
    clearReportError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || [];
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      });
  },
});

export const { clearReportData, clearReportError } = reportsSlice.actions;
export default reportsSlice.reducer;
