import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { taskApi } from "../../../api/taskApi";
import { getApiErrorMessage } from "../../../helpers/apiError";

export const fetchAssignees = createAsyncThunk(
  "tasks/fetchAssignees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskApi.getAssignees();
      return response.data.data.users;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch assignees")
      );
    }
  }
);

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskApi.listTasks(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch tasks"));
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskApi.createTask(taskData);
      return response.data.data.task;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create task"));
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  "tasks/fetchTaskById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTaskById(id);
      return response.data.data.task;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch task details")
      );
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  "tasks/updateTaskStatus",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskApi.updateTaskStatus(id, data);
      return response.data.data.task;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update task status")
      );
    }
  }
);

export const reassignTask = createAsyncThunk(
  "tasks/reassignTask",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskApi.reassignTask(id, data);
      return response.data.data.task;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to reassign task")
      );
    }
  }
);

export const fetchTaskHistory = createAsyncThunk(
  "tasks/fetchTaskHistory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTaskHistory(id);
      return { taskId: id, history: response.data.data.history };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch task history")
      );
    }
  }
);

export const addChecklistItem = createAsyncThunk(
  "tasks/addChecklistItem",
  async ({ taskId, title }, { rejectWithValue }) => {
    try {
      const response = await taskApi.addChecklistItem(taskId, { title });
      return { taskId, item: response.data.data.item };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to add checklist item")
      );
    }
  }
);

export const toggleChecklistItem = createAsyncThunk(
  "tasks/toggleChecklistItem",
  async ({ taskId, checklistId }, { rejectWithValue }) => {
    try {
      const response = await taskApi.toggleChecklistItem(taskId, checklistId);
      return { taskId, item: response.data.data.item };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update checklist item")
      );
    }
  }
);

export const deleteChecklistItem = createAsyncThunk(
  "tasks/deleteChecklistItem",
  async ({ taskId, checklistId }, { rejectWithValue }) => {
    try {
      await taskApi.deleteChecklistItem(taskId, checklistId);
      return { taskId, checklistId };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to delete checklist item")
      );
    }
  }
);

const initialState = {
  tasks: [],
  assignees: [],
  selectedTask: null,
  statusHistory: [],
  pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  loading: false,
  assigneesLoading: false,
  error: null,
};

const upsertTaskInList = (state, task) => {
  if (!task?.id) return;
  const index = state.tasks.findIndex((t) => t.id === task.id);
  if (index !== -1) {
    state.tasks[index] = task;
  }
  if (state.selectedTask?.id === task.id) {
    state.selectedTask = {
      ...state.selectedTask,
      ...task,
      checklist: task.checklist ?? state.selectedTask.checklist,
    };
  }
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearSelectedTask: (state) => {
      state.selectedTask = null;
      state.statusHistory = [];
    },
    clearTaskError: (state) => {
      state.error = null;
    },
    setSelectedTaskChecklist: (state, action) => {
      if (state.selectedTask) {
        state.selectedTask.checklist = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignees.pending, (state) => {
        state.assigneesLoading = true;
      })
      .addCase(fetchAssignees.fulfilled, (state, action) => {
        state.assigneesLoading = false;
        state.assignees = action.payload || [];
      })
      .addCase(fetchAssignees.rejected, (state, action) => {
        state.assigneesLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.tasks.unshift(action.payload);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedTask = null;
      })

      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        upsertTaskInList(state, action.payload);
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(reassignTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(reassignTask.fulfilled, (state, action) => {
        state.loading = false;
        upsertTaskInList(state, action.payload);
      })
      .addCase(reassignTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTaskHistory.fulfilled, (state, action) => {
        state.statusHistory = action.payload.history || [];
      })

      .addCase(addChecklistItem.fulfilled, (state, action) => {
        const { item } = action.payload;
        if (state.selectedTask?.checklist) {
          state.selectedTask.checklist.push(item);
        } else if (state.selectedTask) {
          state.selectedTask.checklist = [item];
        }
      })

      .addCase(toggleChecklistItem.fulfilled, (state, action) => {
        const { item } = action.payload;
        if (!state.selectedTask?.checklist) return;
        const idx = state.selectedTask.checklist.findIndex((c) => c.id === item.id);
        if (idx !== -1) {
          state.selectedTask.checklist[idx] = item;
        }
      })

      .addCase(deleteChecklistItem.fulfilled, (state, action) => {
        const { checklistId } = action.payload;
        if (state.selectedTask?.checklist) {
          state.selectedTask.checklist = state.selectedTask.checklist.filter(
            (c) => c.id !== checklistId
          );
        }
      });
  },
});

export const { clearSelectedTask, clearTaskError, setSelectedTaskChecklist } =
  taskSlice.actions;
export default taskSlice.reducer;
