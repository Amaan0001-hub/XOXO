import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRequestWithToken, postRequestWithToken } from '@/app/api/auth';

export const API_ENDPOINTS = {
    GET_PRODUCTS: '/Product/getAllProduct',
    ADD_PRODUCT: '/Product/addProduct',
    UPDATE_PRODUCT: '/Product/updateProduct',
    DELETE_PRODUCT: '/Product/deleteProduct',
    GET_PRODUCT_BY_ID: '/Product/getProductById',
    GET_ACTIVE_PRODUCTS: '/Product/getAllProductForUser',
    GET_AGENT_ANALYTICS_USER: "/Authentication/getAgentAnalyticsUser",
};
''
// GET Products (with token)
export const getProducts = createAsyncThunk(
  'product/getProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(API_ENDPOINTS.GET_PRODUCTS);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch products'
      );
    }
  }
);

// GET Active Products (without token)
export const getActiveProducts = createAsyncThunk(
  'product/getActiveProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(API_ENDPOINTS.GET_ACTIVE_PRODUCTS);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch active products'
      );
    }
  }
);

// GET Product By ID
export const getProductById = createAsyncThunk(
  'product/getProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(`${API_ENDPOINTS.GET_PRODUCT_BY_ID}/${productId}`);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch product details'
      );
    }
  }
);

// ADD Product - JSON payload
export const addProduct = createAsyncThunk(
  'product/addProduct',
  async (payload, { rejectWithValue }) => {
    try {
      // payload should be { name, description, price, categoryId, createdBy, etc. }
      const response = await postRequestWithToken(API_ENDPOINTS.ADD_PRODUCT, payload);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Something went wrong'
      );
    }
  }
);

// UPDATE Product - JSON payload
export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async (payload, { rejectWithValue }) => {
    try {
      // payload should be { productId, name, description, price, categoryId, active, updatedBy, etc. }
      const response = await postRequestWithToken(API_ENDPOINTS.UPDATE_PRODUCT, payload);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// DELETE Product - JSON payload
export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (payload, { rejectWithValue }) => {
    try {
      // payload should be { productId, updatedBy }
      const response = await postRequestWithToken(API_ENDPOINTS.DELETE_PRODUCT, payload);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete product'
      );
    }
  }
);
export const getAllAnalyticsDataByURID = createAsyncThunk(
    "product/getAllAnalyticsDataByURID",
    async (urid, { rejectWithValue }) => {
        try {
            const response = await getRequestWithToken(
                `${API_ENDPOINTS.GET_AGENT_ANALYTICS_USER}?URID=${urid}`
            );
            return response;
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch auto deposit data"
            );
        }
    }
);

const productSlice = createSlice({
  name: 'product',
  initialState: {
    loading: false,
    error: null,
    success: null,
    data: [], // All products
    activeProducts: [], // Active products only
    selectedProduct: null, // Single product details
    analyticsData:null
  },
  reducers: {
    setProducts: (state, action) => {
      state.data = action.payload;
    },
    setActiveProducts: (state, action) => {
      state.activeProducts = action.payload;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    }
  },
  extraReducers: (builder) => {
    // GET PRODUCTS
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.data = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.data = action.payload;
        } else {
          state.data = [];
        }
        state.error = null;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
      });

    // GET ACTIVE PRODUCTS
    builder
      .addCase(getActiveProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.activeProducts = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.activeProducts = action.payload;
        } else {
          state.activeProducts = [];
        }
        state.error = null;
      })
      .addCase(getActiveProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.activeProducts = [];
      });

    // GET PRODUCT BY ID
    builder
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.selectedProduct = action.payload.data;
        } else {
          state.selectedProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedProduct = null;
      });

    // ADD PRODUCT
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload?.message || 'Product added successfully';
        state.error = null;
        if (action.payload?.data) {
          state.data.push(action.payload.data);
        }
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      });

    // UPDATE PRODUCT
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload?.message || 'Product updated successfully';
        state.error = null;
        if (action.payload?.data && action.payload.data.productId) {
          const index = state.data.findIndex(
            (item) => item.productId === action.payload.data.productId
          );
          if (index !== -1) {
            state.data[index] = { ...state.data[index], ...action.payload.data };
          }
          // Also update in activeProducts if present
          const activeIndex = state.activeProducts.findIndex(
            (item) => item.productId === action.payload.data.productId
          );
          if (activeIndex !== -1) {
            state.activeProducts[activeIndex] = { ...state.activeProducts[activeIndex], ...action.payload.data };
          }
          // Update selected product if it's the same
          if (state.selectedProduct?.productId === action.payload.data.productId) {
            state.selectedProduct = { ...state.selectedProduct, ...action.payload.data };
          }
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      });

    // DELETE PRODUCT
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload?.message || 'Product deleted successfully';
        state.error = null;
        if (action.meta.arg?.productId) {
          // Remove from all products
          state.data = state.data.filter(
            (item) => item.productId !== action.meta.arg.productId
          );
          // Remove from active products
          state.activeProducts = state.activeProducts.filter(
            (item) => item.productId !== action.meta.arg.productId
          );
          // Clear selected product if it's the deleted one
          if (state.selectedProduct?.productId === action.meta.arg.productId) {
            state.selectedProduct = null;
          }
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })

          .addCase(getAllAnalyticsDataByURID.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllAnalyticsDataByURID.fulfilled, (state, action) => {
                state.analyticsData = action.payload;
                state.loading = false;
            })
            .addCase(getAllAnalyticsDataByURID.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            });
  },
});

export const { 
  setProducts, 
  setActiveProducts, 
  setSelectedProduct, 
  clearError, 
  clearSuccess,
  clearSelectedProduct 
} = productSlice.actions;

export default productSlice.reducer;