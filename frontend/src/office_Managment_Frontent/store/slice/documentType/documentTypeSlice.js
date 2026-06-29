import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { documentTypeApi } from "../../../api/documentTypeApi";
import { getApiErrorMessage } from "../../../helpers/apiError";

export const fetchDocumentTypes = createAsyncThunk(
  "documentTypes/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await documentTypeApi.getAll(params);
      return response.data.data.documentTypes;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch document types")
      );
    }
  }
);

export const fetchDocumentTypeById = createAsyncThunk(
  "documentTypes/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentTypeApi.getById(id);
      return response.data.data.documentType;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch document type")
      );
    }
  }
);

export const createDocumentType = createAsyncThunk(
  "documentTypes/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await documentTypeApi.create(payload);

      return {
        documentType: response.data.data.documentType,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to create document type")
      );
    }
  }
);

export const updateDocumentType = createAsyncThunk(
  "documentTypes/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await documentTypeApi.update(id, data);

      return {
        documentType: response.data.data.documentType,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update document type")
      );
    }
  }
);

export const deleteDocumentType = createAsyncThunk(
  "documentTypes/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentTypeApi.delete(id);

      return {
        id,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to delete document type")
      );
    }
  }
);

const documentTypeSlice = createSlice({
  name: "documentTypes",
  initialState: {
    list: [],
    selectedItem: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedDocumentType: (state) => {
      state.selectedItem = null;
    },
    clearDocumentTypeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchDocumentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDocumentTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchDocumentTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addMatcher(
        (action) =>
          [
            createDocumentType.pending.type,
            updateDocumentType.pending.type,
            deleteDocumentType.pending.type,
          ].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [
            createDocumentType.fulfilled.type,
            updateDocumentType.fulfilled.type,
            deleteDocumentType.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;
          if (action.type === createDocumentType.fulfilled.type) {
            state.list = [...state.list, action.payload.documentType];
          }
          if (action.type === updateDocumentType.fulfilled.type) {
            state.list = state.list.map((item) =>
              item.id === action.payload.documentType.id
                ? action.payload.documentType
                : item
            );

            state.selectedItem = action.payload.documentType;
          }
          if (action.type === deleteDocumentType.fulfilled.type) {
            state.list = state.list.filter(
              (item) => item.id !== action.payload.id
            );
            if (state.selectedItem?.id === action.payload.id) {
              state.selectedItem = null;
            }
          }
        }
      )
      .addMatcher(
        (action) =>
          [
            createDocumentType.rejected.type,
            updateDocumentType.rejected.type,
            deleteDocumentType.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearSelectedDocumentType, clearDocumentTypeError } =
  documentTypeSlice.actions;
export default documentTypeSlice.reducer;
