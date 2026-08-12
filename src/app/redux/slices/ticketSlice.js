'use client'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {  postformRequest, postRequestWithToken,getRequestWithToken } from '@/app/api/auth'

export const API_ENDPOINTS = {
    GET_ALL_TICKETS: "/Ticket/getAllTicketAdmin",
    TICKET_REPLY: "/Ticket/addTicketReplyAdmin",
    GET_TICKET_REPLY_BY_TICKET_ID: "/Ticket/getTicketBYTicketIdAdmin",
    DELETE_TICKET: "/Ticket/closeTicket",
    GET_ALL_CLOSED_TICKET:"/Ticket/getAllclosedTicket",
    SEND_NOTIFICATION:"/Ticket/sendNotification",
    SEND_EMAIL:"/Event/sendEmailsAllUser",
    USER_REPLY_COUNT: "/Ticket/userReplyCount",
    UPDATE_USER_REPLY_COUNT: "/Ticket/updateUserReplyCountAdmin",
    GET_USER_NOTIFICATIONS: "/Ticket/getUserNotificationListbyURID",
   UPDATE_NOTIFICATIONS_COUNT: "/Ticket/updateUserNotification",
   GET_ALL_USER_NOTIFICATIONS: "/Ticket/getAllUserNotificationList"


};

export const Columns = [
    { id: 'sno', label: 'S.No' },
    { id: 'UserID', label: 'User ID' },
    { id: 'UserName', label: 'Name' },
    { id: 'Subject', label: 'Subject' },
    { id: 'StatusType', label: 'Status' },
    { id: 'action', label: 'Action' },
];

export const fetchAllTickets = createAsyncThunk(
  'ticket/fetchAllTickets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(API_ENDPOINTS.GET_ALL_TICKETS)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching tickets')
    }
  }
)

export const fetchClosedTickets = createAsyncThunk(
  'ticket/fetchClosedTickets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(API_ENDPOINTS.GET_ALL_CLOSED_TICKET)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching closed tickets')
    }
  }
)

export const addTicketReply = createAsyncThunk(
  'ticket/addTicketReply',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(API_ENDPOINTS.TICKET_REPLY, formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error replying to ticket');
    }
  }
)

export const getAllTicketByTicketId = createAsyncThunk(
  'ticket/getAllTicketByTicketId',
  async (ticketId, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(`${API_ENDPOINTS.GET_TICKET_REPLY_BY_TICKET_ID}?TicketId=${ticketId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching ticket');
    }
  }
)


export const deleteTicket = createAsyncThunk(
  'ticket/deleteTicket',
  async (ticketId, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(`${API_ENDPOINTS.DELETE_TICKET}?TicketId=${ticketId}`)
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error deleting ticket')
    }
  }
)
export const sendNotification = createAsyncThunk(
  "ticket/addNotification",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.SEND_NOTIFICATION,
        data
      );
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(errorMessage);
    }
  }
);

// Send Email to all users
export const sendEmail = createAsyncThunk(
  "ticket/sendEmailsAllUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequest(
        API_ENDPOINTS.SEND_EMAIL,
        data
      );
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error sending email';
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserReplyCount = createAsyncThunk(
  'ticket/fetchUserReplyCount',
  async ( TicketId, { rejectWithValue }) => {
    try {
     
      const response = await postRequestWithToken(`${API_ENDPOINTS.USER_REPLY_COUNT}?TicketId=${TicketId}`);
      
      return response.data;
    } catch (error) {
      console.error("fetchUserReplyCount error:", error)
      return rejectWithValue(error.response?.data || 'Error fetching user reply count');
    }
  }
);

export const updateUserReplyCount = createAsyncThunk(
  'ticket/updateUserReplyCount',
  async ({TicketId}, { rejectWithValue }) => {
    try {

      const response = await postRequestWithToken(`${API_ENDPOINTS.UPDATE_USER_REPLY_COUNT}?TicketId=${TicketId}`);
    
      return response.data;
    } catch (error) {
      console.error("updateUserReplyCount error:", error)
      return rejectWithValue(error.response?.data || 'Error updating user reply count');
    }
  }
);

export const Getusernotification = createAsyncThunk(
  'ticket/Getusernotification',
  async (_, { rejectWithValue }) => {
    try {

      const response = await postRequestWithToken(`${API_ENDPOINTS.GET_USER_NOTIFICATIONS}`);
      return response.data;
    } catch (error) {
      console.error("Getusernotification error:", error)
      return rejectWithValue(error.response?.data || 'Error fetching user notifications');
    }
  }
);

export const updateNotificationsCount = createAsyncThunk(
  "notifications/updateNotificationsCount",
  async ({ URID }, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        `${API_ENDPOINTS.UPDATE_NOTIFICATIONS_COUNT}?URID=${URID}`
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to Upate Notification data"
      );
    }
  }
);

export const getallusernotification = createAsyncThunk(
  "notifications/getallusernotification",
  async (_, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        `${API_ENDPOINTS.GET_ALL_USER_NOTIFICATIONS}`
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to Upate Notification data"
      );
    }
  }
);
const ticketSlice = createSlice({
  name: 'ticket',
  initialState: {
    tickets:null,
    closedTickets:null,
    ticketDetails: null,
    sendNotification: null,
    userReplyCount: {},
    loading: false,
    error: null,
    userNotifications:null,
    notificationData:null
  },
  reducers: {
    clearTicketDetails: (state) => {
      state.ticketDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch All Tickets
      .addCase(fetchAllTickets.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.tickets = action.payload
        state.loading = false
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })

      // Fetch Closed Tickets
      .addCase(fetchClosedTickets.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchClosedTickets.fulfilled, (state, action) => {
        state.closedTickets = action.payload
        state.loading = false
      })
      .addCase(fetchClosedTickets.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })

      .addCase(addTicketReply.pending, (state) => {
        state.loading = true
      })
      .addCase(addTicketReply.fulfilled, (state, action) => {
        state.tickets = state.tickets.map(ticket =>
          ticket.id === action.payload.id ? action.payload : ticket
        )
        state.loading = false
      })
      .addCase(addTicketReply.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })

      .addCase(getAllTicketByTicketId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTicketByTicketId.fulfilled, (state, action) => {
        state.ticketDetails = action.payload;
        state.loading = false;
      })
      .addCase(getAllTicketByTicketId.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        if (state.tickets) {
          state.tickets = state.tickets.filter(ticket => ticket.TicketId !== action.meta.arg.ticketId);
        }
        state.loading = false;
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
       .addCase(sendNotification.pending, (state) => {
        state.loading = true
      })
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.closedTickets = action.payload
        state.loading = false
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })

      // Fetch User Reply Count
      .addCase(fetchUserReplyCount.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserReplyCount.fulfilled, (state, action) => {
        const ticketId = action.meta.arg.TicketId
        const replyCount = action.payload?.userReplyCount && action.payload.userReplyCount.length > 0 ? action.payload.userReplyCount[0]?.ReplyCount || 0 : 0
        state.userReplyCount[ticketId] = replyCount
    
        state.loading = false
      })
      .addCase(fetchUserReplyCount.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })

      // Update User Reply Count
      .addCase(updateUserReplyCount.pending, (state) => {
        state.loading = true
      })
      .addCase(updateUserReplyCount.fulfilled, (state, action) => {
        // Optionally, reset or update the userReplyCount after update
        // For example, set to 0 or refetch
        const ticketId = action.meta.arg.TicketId
        state.userReplyCount[ticketId] = 0 // Assuming update resets the count
        state.loading = false
      })
      .addCase(updateUserReplyCount.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })

      .addCase(Getusernotification.pending, (state) => {
        state.loading = true
      })
      .addCase(Getusernotification.fulfilled, (state, action) => {
        state.userNotifications = action.payload
        state.loading = false
      })
      .addCase(Getusernotification.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(updateNotificationsCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotificationsCount.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateNotificationsCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getallusernotification.pending, (state) => {
        state.loading = true
      })
      .addCase(getallusernotification.fulfilled, (state, action) => {
        state.notificationData = action.payload
        state.loading = false
      })
      .addCase(getallusernotification.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
  },
})

export const { clearTicketDetails } = ticketSlice.actions;
export default ticketSlice.reducer