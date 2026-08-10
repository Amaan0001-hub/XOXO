"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { postRequestWithToken, getRequestWithToken } from "../../api/auth";

// API Endpoints
const API_ENDPOINTS = {
  ADD_CHAT_MESSAGE: "/ChatMaster/addChatMessage",
  GET_USER_ALL_CHATS: "/ChatMaster/getUserAllChatsbyUserId",
  GET_CHAT_MESSAGES: "/ChatMaster/getChatMessagesChatId",
  USER_DELETE_CHAT:"/ChatMaster/userDeleteChat"
};

// Async thunk for adding chat message
export const sendChatMessage = createAsyncThunk(
  "chat/sendChatMessage",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.ADD_CHAT_MESSAGE,
        data,
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send chat message",
      );
    }
  },
);

// Async thunk for fetching all chats by user ID
export const fetchUserAllChats = createAsyncThunk(
  "chat/fetchUserAllChats",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(
        `${API_ENDPOINTS.GET_USER_ALL_CHATS}?USERID=${userId}`,
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch chats",
      );
    }
  },
);

// Async thunk for fetching chat messages by chat ID
export const fetchChatMessages = createAsyncThunk(
  "chat/fetchChatMessages",
  async ({ chatId, userId }, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.GET_CHAT_MESSAGES,
        { chatId, userId },
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch chat messages",
      );
    }
  },
);

export const deleteChat = createAsyncThunk(
  "chat/deleteChat",
  async ({ chatId, userId }, { rejectWithValue }) => {
    try {
    
      const response = await postRequestWithToken(
         API_ENDPOINTS.USER_DELETE_CHAT,{ chatId, userId }          
      );
      return response;
    } catch (error) {
      console.error("❌ Credit API error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user credit",
      );
    }
  },
);
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    conversations: [],
    currentConversation: null,
    loading: false,
    error: null,
    sendMessageStatus: null,
    allChats: [],
    allChatsLoading: false,
    allChatsError: null,
    chatMessages: [],
    chatMessagesLoading: false,
    chatMessagesError: null,
    DeleteData:null
  },

  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },
    clearChat: (state) => {
      state.messages = [];
      state.currentConversation = null;
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    loadConversation: (state, action) => {
      state.currentConversation = action.payload;
      state.messages = action.payload?.messages || [];
    },
    updateLastConversation: (state, action) => {
      if (state.conversations.length > 0) {
        state.conversations[0] = {
          ...state.conversations[0],
          ...action.payload,
        };
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearChatMessages: (state) => {
      state.chatMessages = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.sendMessageStatus = "pending";
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.sendMessageStatus = "fulfilled";
        state.error = null;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.sendMessageStatus = "rejected";
      })
      // Handle fetchUserAllChats thunk
      .addCase(fetchUserAllChats.pending, (state) => {
        state.allChatsLoading = true;
        state.allChatsError = null;
      })
      .addCase(fetchUserAllChats.fulfilled, (state, action) => {
        state.allChatsLoading = false;
        state.allChats = action.payload?.data || [];
        // Also update conversations for sidebar display
        state.conversations = action.payload?.data || [];
        state.allChatsError = null;
      })
      .addCase(fetchUserAllChats.rejected, (state, action) => {
        state.allChatsLoading = false;
        state.allChatsError = action.payload;
      })
      // Handle fetchChatMessages thunk
      .addCase(fetchChatMessages.pending, (state) => {
        state.chatMessagesLoading = true;
        state.chatMessagesError = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.chatMessagesLoading = false;
        state.chatMessages = action.payload?.data || [];
        state.chatMessagesError = null;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.chatMessagesLoading = false;
        state.chatMessagesError = action.payload;
      })
     
      .addCase(deleteChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
       state.loading = false;
        state.DeleteData = action.payload;
      })
      .addCase(deleteChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const {
  addMessage,
  setMessages,
  clearMessages,
  addConversation,
  setConversations,
  loadConversation,
  updateLastConversation,
  setError,
  clearChat,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
