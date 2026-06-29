import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dueDateApi } from "../../../api/dueDateApi";
import { getApiErrorMessage } from "../../../helpers/apiError";

export const fetchDueDateDashboard = createAsyncThunk(
  "dueDates/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dueDateApi.getDashboard();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch due date dashboard")
      );
    }
  }
);

export const changeTaskDueDate = createAsyncThunk(
  "dueDates/changeTaskDueDate",
  async ({ taskId, data }, { rejectWithValue }) => {
    try {
      const response = await dueDateApi.changeTaskDueDate(taskId, data);
      return { taskId, result: response.data.data };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update due date")
      );
    }
  }
);

export const fetchDueDateHistory = createAsyncThunk(
  "dueDates/fetchDueDateHistory",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await dueDateApi.getDueDateHistory(taskId);
      return { taskId, history: response.data.data.history };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch due date history")
      );
    }
  }
);

export const fetchTaskReminders = createAsyncThunk(
  "dueDates/fetchTaskReminders",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await dueDateApi.getTaskReminders(taskId);
      return { taskId, reminders: response.data.data.reminders };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch reminders")
      );
    }
  }
);

export const createReminder = createAsyncThunk(
  "dueDates/createReminder",
  async ({ taskId, data }, { rejectWithValue }) => {
    try {
      const response = await dueDateApi.createReminder(taskId, data);
      return { taskId, reminder: response.data.data.reminder };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to create reminder")
      );
    }
  }
);

export const fetchMyReminders = createAsyncThunk(
  "dueDates/fetchMyReminders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await dueDateApi.getMyReminders(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch reminders")
      );
    }
  }
);

export const updateReminder = createAsyncThunk(
  "dueDates/updateReminder",
  async ({ reminderId, data, taskId }, { rejectWithValue }) => {
    try {
      const response = await dueDateApi.updateReminder(reminderId, data);
      return { taskId, reminder: response.data.data.reminder };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update reminder")
      );
    }
  }
);

export const cancelReminder = createAsyncThunk(
  "dueDates/cancelReminder",
  async ({ reminderId, taskId }, { rejectWithValue }) => {
    try {
      await dueDateApi.cancelReminder(reminderId);
      return { reminderId, taskId };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to cancel reminder")
      );
    }
  }
);

const initialState = {
  dashboard: null,
  taskReminders: [],
  dueDateHistory: [],
  myReminders: [],
  myRemindersPagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  loading: false,
  error: null,
};

const dueDateSlice = createSlice({
  name: "dueDates",
  initialState,
  reducers: {
    clearDueDateError: (state) => {
      state.error = null;
    },
    clearTaskReminders: (state) => {
      state.taskReminders = [];
      state.dueDateHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDueDateDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDueDateDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDueDateDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(changeTaskDueDate.pending, (state) => {
        state.loading = true;
      })
      .addCase(changeTaskDueDate.fulfilled, (state, action) => {
        state.loading = false;
        const { taskId, result } = action.payload;
        if (result?.newDueDate) {
          state.taskReminders = state.taskReminders.filter(
            (r) => r.taskId !== taskId || r.reminderType === "CUSTOM"
          );
        }
      })
      .addCase(changeTaskDueDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDueDateHistory.fulfilled, (state, action) => {
        state.dueDateHistory = action.payload.history || [];
      })

      .addCase(fetchTaskReminders.fulfilled, (state, action) => {
        state.taskReminders = action.payload.reminders || [];
      })

      .addCase(createReminder.fulfilled, (state, action) => {
        if (action.payload.reminder) {
          state.taskReminders.push(action.payload.reminder);
        }
      })

      .addCase(fetchMyReminders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyReminders.fulfilled, (state, action) => {
        state.loading = false;
        state.myReminders = action.payload.reminders || [];
        state.myRemindersPagination =
          action.payload.pagination || initialState.myRemindersPagination;
      })
      .addCase(fetchMyReminders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateReminder.fulfilled, (state, action) => {
        const { reminder } = action.payload;
        const idx = state.taskReminders.findIndex((r) => r.id === reminder.id);
        if (idx !== -1) {
          state.taskReminders[idx] = reminder;
        }
        const myIdx = state.myReminders.findIndex((r) => r.id === reminder.id);
        if (myIdx !== -1) {
          state.myReminders[myIdx] = reminder;
        }
      })

      .addCase(cancelReminder.fulfilled, (state, action) => {
        const { reminderId } = action.payload;
        state.taskReminders = state.taskReminders.filter(
          (r) => r.id !== reminderId
        );
        state.myReminders = state.myReminders.filter((r) => r.id !== reminderId);
      });
  },
});

export const { clearDueDateError, clearTaskReminders } = dueDateSlice.actions;
export default dueDateSlice.reducer;
