import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {postRequestWithToken,getRequestWithToken} from "@/app/api/auth.js";

const API_ENDPOINTS = {
  USDT_BALNACE: "/Self/USDTBalance",
  GET_SELF_DEPSITE_DETAILS_BY_URID: "/Self/getSelfDepsiteDetailsByURID",
  SEND_USDT_DEPOSIT_REQUEST: "/Self/SendUSDTDepositRequest",
};

export const getUsdtBalance = createAsyncThunk(
  "self/getUsdtBalance",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.USDT_BALNACE,
        data
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  }
);

export const getSelfDepsiteDetailsByURID = createAsyncThunk(
  "self/getSelfDepsiteDetailsByURID",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(
        `${API_ENDPOINTS.GET_SELF_DEPSITE_DETAILS_BY_URID}`
      );
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Something went wrong";
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(errorMessage);
    }
  }
);

export const sendUSDTDepositRequest = createAsyncThunk(
  "self/sendUSDTDepositRequest",
  async (_, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.SEND_USDT_DEPOSIT_REQUEST
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  }
);

const selfSlice = createSlice({
  name: "self",
  initialState: {
    usdtBalanceData: [],
    selfDepsiteDetailsData: null,
    sendUSDTDepositdata:null,
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getUsdtBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUsdtBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.usdtBalanceData = action.payload;
      })
      .addCase(getUsdtBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSelfDepsiteDetailsByURID.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSelfDepsiteDetailsByURID.fulfilled, (state, action) => {
        state.loading = false;
        state.selfDepsiteDetailsData = action.payload;
      })
      .addCase(getSelfDepsiteDetailsByURID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       .addCase(sendUSDTDepositRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendUSDTDepositRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.sendUSDTDepositdata = action.payload;
      })
      .addCase(sendUSDTDepositRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default selfSlice.reducer;