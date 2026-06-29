import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { documentApi } from "../../../api/documentApi";
import { getApiErrorMessage } from "../../../helpers/apiError";
import { toPreviewBlob } from "../../../helpers/documentPreview";

const getBlobApiErrorMessage = async (error, fallback) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed?.message || fallback;
    } catch {
      return fallback;
    }
  }
  return getApiErrorMessage(error, fallback);
};

export const fetchDocuments = createAsyncThunk(
  "documents/fetchDocuments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await documentApi.getAllDocuments(params);
      return {
        documents: response.data.data || [],
        pagination: response.data.pagination || {},
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load documents")
      );
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  "documents/fetchDocumentById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentApi.getDocumentById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch document")
      );
    }
  }
);

export const fetchDocumentStats = createAsyncThunk(
  "documents/fetchDocumentStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentApi.getDocumentStats();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch document stats")
      );
    }
  }
);

export const uploadDocument = createAsyncThunk(
  "documents/uploadDocument",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await documentApi.uploadDocument(formData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to upload document")
      );
    }
  }
);

export const deleteDocument = createAsyncThunk(
  "documents/deleteDocument",
  async (id, { rejectWithValue }) => {
    try {
      await documentApi.deleteDocument(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to delete document")
      );
    }
  }
);

export const downloadDocument = createAsyncThunk(
  "documents/downloadDocument",
  async ({ id, fileName }, { rejectWithValue }) => {
    try {
      const response = await documentApi.downloadDocument(id);
      return { blob: response.data, fileName };
    } catch (error) {
      return rejectWithValue(
        await getBlobApiErrorMessage(error, "Failed to download document")
      );
    }
  }
);

export const viewDocument = createAsyncThunk(
  "documents/viewDocument",
  async ({ id, mimeType }, { rejectWithValue }) => {
    try {
      const response = await documentApi.viewDocument(id);
      const headerType = response.headers?.["content-type"]
        ?.split(";")[0]
        ?.trim();
      return toPreviewBlob(response.data, headerType || mimeType);
    } catch (error) {
      return rejectWithValue(
        await getBlobApiErrorMessage(error, "Failed to preview document")
      );
    }
  }
);

const initialState = {
  documents: [],
  documentDetail: null,
  stats: null,
  pagination: { total: 0, page: 1, limit: 15, totalPages: 1 },
  loading: false,
  statsLoading: false,
  uploading: false,
  deleting: false,
  downloading: false,
  viewing: false,
  error: null,
};
const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    clearDocumentDetail: (state) => {
      state.documentDetail = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload.documents;
        state.pagination = {
          ...initialState.pagination,
          ...action.payload.pagination,
        };
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        state.documentDetail = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDocumentStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchDocumentStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDocumentStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })

      .addCase(uploadDocument.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })

      .addCase(deleteDocument.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.deleting = false;
        state.documents = state.documents.filter((doc) => doc.id !== action.payload);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      .addCase(downloadDocument.pending, (state) => {
        state.downloading = true;
        state.error = null;
      })
      .addCase(downloadDocument.fulfilled, (state) => {
        state.downloading = false;
      })
      .addCase(downloadDocument.rejected, (state, action) => {
        state.downloading = false;
        state.error = action.payload;
      })

      .addCase(viewDocument.pending, (state) => {
        state.viewing = true;
        state.error = null;
      })
      .addCase(viewDocument.fulfilled, (state) => {
        state.viewing = false;
      })
      .addCase(viewDocument.rejected, (state, action) => {
        state.viewing = false;
        state.error = action.payload;
      });  },
});

export const { clearDocumentDetail, clearError } = documentSlice.actions;
export default documentSlice.reducer;
