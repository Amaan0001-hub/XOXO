import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRequestWithToken, postRequestWithToken, getRequest } from '@/app/api/auth';

export const API_ENDPOINTS = {
    CATEGORY: '/Category/getAllCategory',
    ADD_CATEGORY: '/Category/addCategory',
    UPDATE_CATEGORY: '/Category/updateCategory', 
    DELETE_CATEGORY: '/Category/deleteCategory',
    GET_ALL_ACTIVE_CATEGORY:'/Category/getAllActiveCategory'
};

export const Columns = [
  { key: 'id', label: 'S.No.' },
  { key: 'name', label: 'Category Name' },
  { key: 'status', label: 'Status' }
];

// GET Request (with token)
export const getCategory = createAsyncThunk(
  'category/getcategory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(API_ENDPOINTS.CATEGORY);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch categories'
      );
    }
  }
);

// GET Active Categories (without token)
export const fetchActiveCategoryList = createAsyncThunk(
  'category/fetchActiveCategoryList',
  async (_, { rejectWithValue }) => {
    try {
      // Using getRequest without token
      const response = await getRequest(API_ENDPOINTS.GET_ALL_ACTIVE_CATEGORY);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch active categories'
      );
    }
  }
);

// ADD Category - JSON payload
export const addCategory = createAsyncThunk(
  'category/addCategory',
  async (payload, { rejectWithValue }) => {
    try {
      // payload should be { name, createdBy }
      const response = await postRequestWithToken(API_ENDPOINTS.ADD_CATEGORY, payload);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Something went wrong'
      );
    }
  }
);

// UPDATE Category - JSON payload
export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async (payload, { rejectWithValue }) => {
    try {
      // payload should be { categoryId, name, active, updatedBy }
      const response = await postRequestWithToken(API_ENDPOINTS.UPDATE_CATEGORY, payload);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// DELETE Category - JSON payload
export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (payload, { rejectWithValue }) => {
    try {
      // payload should be { categoryId, updatedBy }
      const response = await postRequestWithToken(API_ENDPOINTS.DELETE_CATEGORY, payload);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete category'
      );
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    loading: false,
    error: null,
    success: null,
    data: [],
    categoryData: [],
    activeCategories: [] // New state for active categories
  },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setActiveCategories: (state, action) => {
      state.activeCategories = action.payload;
    }
  },
  extraReducers: (builder) => {
    // FETCH ACTIVE CATEGORIES (without token)
    builder
      .addCase(fetchActiveCategoryList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveCategoryList.fulfilled, (state, action) => {
        state.loading = false;
        // Handle response structure
        if (action.payload?.data) {
          state.activeCategories = action.payload.data;
          state.categoryData = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.activeCategories = action.payload;
          state.categoryData = action.payload;
        } else {
          state.activeCategories = [];
          state.categoryData = [];
        }
        state.error = null;
      })
      .addCase(fetchActiveCategoryList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.activeCategories = [];
        state.categoryData = [];
      });

    // ADD CATEGORY
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload?.message || 'Category added successfully';
        state.error = null;
        // Agar response mein data aa raha hai to add karo
        if (action.payload?.data) {
          state.data.push(action.payload.data);
        }
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      });

    // GET CATEGORY
    builder
      .addCase(getCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategory.fulfilled, (state, action) => {
        state.loading = false;
        // Agar data array mein hai to direct assign karo
        if (action.payload?.data) {
          state.data = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.data = action.payload;
        } else {
          state.data = [];
        }
        state.error = null;
      })
      .addCase(getCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      });

    // UPDATE CATEGORY
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload?.message || 'Category updated successfully';
        state.error = null;
        // Update the category in the data array
        if (action.payload?.data && action.payload.data.categoryId) {
          const index = state.data.findIndex(
            (item) => item.categoryId === action.payload.data.categoryId
          );
          if (index !== -1) {
            state.data[index] = { ...state.data[index], ...action.payload.data };
          }
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      });

    // DELETE CATEGORY
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload?.message || 'Category deleted successfully';
        state.error = null;
        // Remove deleted category from state
        if (action.meta.arg?.categoryId) {
          state.data = state.data.filter(
            (item) => item.categoryId !== action.meta.arg.categoryId
          );
          // Also remove from activeCategories if present
          state.activeCategories = state.activeCategories.filter(
            (item) => item.categoryId !== action.meta.arg.categoryId
          );
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      });
  },
});

export const { setData, clearError, clearSuccess, setActiveCategories } = categorySlice.actions;
export default categorySlice.reducer;