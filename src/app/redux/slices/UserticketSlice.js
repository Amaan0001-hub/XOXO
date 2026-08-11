import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  postRequestWithToken,
  postRequestURId,
  addTicketReplyApi,
  getRequestURId,
  getRequestWithToken,
} from "@/app/api/auth";

const API_ENDPOINTS = {
  GET_TICKET_BY_URID: "/Ticket/getAllTicketByURID",
  UPDATE_TICKET_STATUS: "/Ticket/updateStatus",
  GET_TICKET_REPLY_BY_TICKET_ID: "/Ticket/getTicketByTicketId",
  ADD_TICKET: "/Ticket/addTicket",
  ADD_TICKET_REPLY_NEW:"/Ticket/addTicketReply",
  ADMIN_REPLY_COUNT: "/Ticket/adminReplyCount",
  UPDATE_ADMIN_REPLY_COUNT: "/Ticket/updateAdminReplyCount"
};

export const getAllTicketBYURID = createAsyncThunk(
  "userticket/getAllTicketBYURID",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequestURId(
        API_ENDPOINTS.GET_TICKET_BY_URID
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getAdminReplyCount = createAsyncThunk(
  "userticket/getAdminReplyCount",
  async ({  ticketId }, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        `${API_ENDPOINTS.ADMIN_REPLY_COUNT}?TicketId=${ticketId}`
      );
      return { ticketId, data: response.data };
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin reply count"
      );
    }
  }
);

export const updateAdminReplyCount = createAsyncThunk(
  "userticket/updateAdminReplyCount",
  async ({ ticketId }, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        `${API_ENDPOINTS.UPDATE_ADMIN_REPLY_COUNT}?TicketId=${ticketId}`
      );
      return { ticketId, data: response.data };
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update admin reply count"
      );
    }
  }
);

export const addTicket = createAsyncThunk(
  "support/addTicket",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.ADD_TICKET,
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

export const addTicketReplytest = createAsyncThunk(
  "userticket/addTicketReplytest",
  async (data, { rejectWithValue }) => {
    try {
      const response = await addTicketReplyApi(
        API_ENDPOINTS.ADD_TICKET_REPLY_NEW,
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
export const getTicketReplyByTicketId = createAsyncThunk(
  "userticket/getTicketReplyByTicketId",
  async (ticketId, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(
        `${API_ENDPOINTS.GET_TICKET_REPLY_BY_TICKET_ID}?ticketId=${ticketId}`
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch auto deposit data"
      );
    }
  }
);
const UserticketSlice = createSlice({
  name: "userticket",
  initialState: {
    getAllTicketData: null,
    loading: false,
    error: null,
    getTicketByTicketIdData: null,
    ticketData: null,
    ticketDataNew: null,
    getAllTicketDataNew: null,
    getTicketByTicketIdDataTest: null,
    replyApiResponce: null,
    adminReplyCounts: {},
  },
  reducers: {
    addTicketToList: (state, action) => {
      if (state.getAllTicketDataNew) {
        state.getAllTicketDataNew = [action.payload, ...state.getAllTicketDataNew];
      } else {
        state.getAllTicketDataNew = [action.payload];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTicketReplyByTicketId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTicketReplyByTicketId.fulfilled, (state, action) => {
        state.loading = false;
        state.getTicketByTicketIdData = action.payload;
      })
      .addCase(getTicketReplyByTicketId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.ticketData = action.payload;
      })
      .addCase(addTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTicketReplytest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTicketReplytest.fulfilled, (state, action) => {
        state.loading = false;
        state.replyApiResponce = action.payload;
      })
      .addCase(addTicketReplytest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllTicketBYURID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTicketBYURID.fulfilled, (state, action) => {
        state.loading = false;
        state.getAllTicketDataNew = action.payload;
      })
      .addCase(getAllTicketBYURID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAdminReplyCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminReplyCount.fulfilled, (state, action) => {
        state.loading = false;
        const { ticketId, data } = action.payload;
        state.adminReplyCounts[ticketId] = data;
      })
      .addCase(getAdminReplyCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminReplyCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminReplyCount.fulfilled, (state, action) => {
        state.loading = false;
        const { ticketId, data } = action.payload;
        // Optionally update the count in state if needed
        if (state.adminReplyCounts[ticketId]) {
          state.adminReplyCounts[ticketId] = data;
        }
      })
      .addCase(updateAdminReplyCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addTicketToList } = UserticketSlice.actions;
export default UserticketSlice.reducer;