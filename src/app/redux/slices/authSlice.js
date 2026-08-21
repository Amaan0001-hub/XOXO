"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { encryptData } from "../../utils/encryption";
import toast from "react-hot-toast";
import {
  doLogin,
  postRequestWithToken,
  setToken,
  postRequestWithData,
  forgotPasswordRequest,
  getAdminDashboard,
  getSearchAllUsers,
  getAllMenu,
  getToken, getRequest, getRequestWithToken,
  setAdminToken,
} from "../../api/auth";
import cookies from "js-cookie";
import { act } from "react";

const API_ENDPOINTS = {
  APP_LOGIN: "/Authentication/appLogin",
  ADMIN_LOGIN: "/AdminAuthentication/adminLogin",
  USER_REGISTRATION: "/Authentication/userRegistration",
  SEND_OTP: "/Authentication/sendOtp",
  FORGOT_PASSWORD: "/Authentication/forgotPassword",
  SENT_WITHDRAWAL_OTP_REQUEST: "/SMTPServices/sendOtpwithdrawalEmail",
  GET_ADMIN_USER_DETAILS: "/AdminAuthentication/getAdminUserDetails",
  GET_USER_ALL_CHATS_ADMIN: "/ChatMaster/getUserAllChatsAdmin",
  CHAT_MSG_BY_ID_ADMIN: "/ChatMaster/chatMsgByIdAdmin",
  REGISTER: "/AdminAuthentication/addAdminUser",
  GET_BY_REFREAL_ID: "/Authentication/getByReferralId",
  GET_ALL_COUNTRY: "/Geography/getAllCountry",
  VALIDATE_OTP: "/Authentication/validateOtp",
  SEND_OTP_REQUEST: "/SMTPServices/sendOtpptwoptrasferEmail",
  SEND_OTP_REQUEST_INCOME: "/SMTPServices/sendOtpIncomeToDepositWallet",
  SEND_OTP_REQUEST_WITHDRWAL: "/SMTPServices/sendOtpUpdateProfile",
  GET_USER_DASHBOARD_DETAILS: "/Authentication/userDashboardDetails",
  UPDATE_USER_PROFILE: "/Authentication/updateUserProfile",
  UPDATE_USER_PROFILE_ADMIN: "/Authentication/updateUserProfileAdmin",
  UPDATE_PASSWORD:"/Authentication/changePassword",
  GET_PROFILE_DETAILS: '/WalletReport/getProfileDetails'
};

export const appLogin = createAsyncThunk(
  "auth/appLogin",
  async (data, { rejectWithValue }) => {
    try {
      // Transform email to username for API request
      const loginData = {
        username: data.username,
        password: data.password
      };
      const response = await postRequestWithToken(
        API_ENDPOINTS.APP_LOGIN,
        loginData
      );


      const token = response.token || response.data?.token;

      setToken(token);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch auth data"
      );
    }
  }
);

export const adminLogin = createAsyncThunk(
  "auth/adminLogin",
  async (data, { rejectWithValue }) => {
    try {
      const loginData = {
        username: data.username,
        password: data.password
      };
      const response = await postRequestWithToken(
        
        API_ENDPOINTS.ADMIN_LOGIN,
        loginData
        
      );
      console.log("testt",response?.data?.Role)

      if (response.statusCode === 409) {
        toast.error(response.message);
      }

      const token = response.token || response.data?.token;
    cookies.set("Role", String(response?.data?.Role ?? ""), {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
      setToken(token);
      setAdminToken(token);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin auth data"
      );
    }
  }
);

export const userRegistration = createAsyncThunk(
  "auth/userRegistration",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithData(
        API_ENDPOINTS.USER_REGISTRATION,
        data
      );
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || "Registration failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      // data contains { userId: username, email: email }
      const response = await forgotPasswordRequest(data);

      // Check if response is successful
      if (response?.statusCode === 200 || response?.status === 200) {
        return response;
      } else {
        return rejectWithValue(response?.message || "Failed to send reset link");
      }
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(error?.message || "Failed to send reset link");
    }
  }
);
export const getAdminDashboardDetails = createAsyncThunk(
  "auth/getAdminDashboardDetails",
  async (adminUserId, { rejectWithValue }) => {
    try {
      const response = await getAdminDashboard(adminUserId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin dashboard data"
      );
    }
  }
);

export const getSearchAllUsersDetails = createAsyncThunk(
  "auth/getSearchAllUsersDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSearchAllUsers();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch search all users data"
      );
    }
  }
);

export const getAllMenuDetails = createAsyncThunk(
  "auth/getAllMenuDetails",
  async (adminUserId, { rejectWithValue }) => {
    try {
      const response = await getAllMenu(adminUserId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch menu data"
      );
    }
  }
);

export const fetchAdminUserDetails = createAsyncThunk(
  "auth/fetchAdminUserDetails",
  async ({ adminUserId, username }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No token found, please login again");

      const response = await postRequestWithToken(API_ENDPOINTS.GET_ADMIN_USER_DETAILS, { adminUserId, username }, token);

      if (!response) throw new Error("Invalid API response: response is null");
      if (response.statusCode === 400) return rejectWithValue(response.message);

      return response.data || {};
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch admin user details");
    }
  }
);

export const getUserAllChatsAdmin = createAsyncThunk(
  'auth/getUserAllChatsAdmin',
  async (USERID, { rejectWithValue }) => {
    try {
      const response = await getRequest(`${API_ENDPOINTS.GET_USER_ALL_CHATS_ADMIN}?USERID=${USERID}`);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data || 'Error activating admin user');
    }
  }
);
export const chatMsgByIdAdmin = createAsyncThunk(
  'auth/chatMsgByIdAdmin',
  async (ChatId, { rejectWithValue }) => {
    try {
      const response = await getRequest(`${API_ENDPOINTS.CHAT_MSG_BY_ID_ADMIN}?ChatId=${ChatId}`);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data || 'Error activating admin user');
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(API_ENDPOINTS.REGISTER, formData);
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Something went wrong";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getReferralDataByLoginId = createAsyncThunk(
  "auth/getReferralDataByLoginId",
  async (loginId, { rejectWithValue }) => {
    try {
      const response = await getRequest(
        `${API_ENDPOINTS.GET_BY_REFREAL_ID}?loginId=${loginId}`
      );
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Failed to fetch referral data by login ID";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAllCountry = createAsyncThunk(
  "auth/getAllCountry",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequest(API_ENDPOINTS.GET_ALL_COUNTRY);
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

export const sendOtpRequest = createAsyncThunk(
  "auth/sendOtpRequest",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.SEND_OTP,
        data
      );
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

export const sendOtpFundRequest = createAsyncThunk(
  "auth/sendOtpFundRequest",
  async (_, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.SEND_OTP_REQUEST,
      );
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);
export const sendOtpFundRequestIncome = createAsyncThunk(
  "auth/sendOtpFundRequestIncome",
  async (_, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.SEND_OTP_REQUEST_INCOME,
      );
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);
export const sendOtpRequestwalletaddress = createAsyncThunk(
  "auth/sendOtpRequestwalletaddress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.SEND_OTP_REQUEST_WITHDRWAL,
      );
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

export const sendWithdrawalOtpRequest = createAsyncThunk(
  "auth/sendWithdrawalOtpRequest",
  async (_, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.SENT_WITHDRAWAL_OTP_REQUEST,
      );
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);


export const validateOtp = createAsyncThunk(
  "auth/validateOtp",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.VALIDATE_OTP,
        data
      );
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to validate OTP"
      );
    }
  }
);

export const getUserDashboardDetails = createAsyncThunk(
  "auth/getUserDashboardDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(`${API_ENDPOINTS.GET_USER_DASHBOARD_DETAILS}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch auto deposit data");
    }
  }
);
export const getProfileDetails = createAsyncThunk(
  "auth/getProfileDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(`${API_ENDPOINTS.GET_PROFILE_DETAILS}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile data");
    }
  }
);
export const getUserSummaryDetails = createAsyncThunk(
  "auth/getUserSummaryDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(
        `/Authentication/userSummaryDetails`
      );
      return response.data || response;
    } catch (error) {
      console.error("API Error (userSummaryDetails):", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch user summary details"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(API_ENDPOINTS.UPDATE_USER_PROFILE, formData);
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Something went wrong";
      return rejectWithValue(errorMessage);
    }
  }
);
export const updateUserAdmin = createAsyncThunk(
  "auth/updateUserAdmin",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(API_ENDPOINTS.UPDATE_USER_PROFILE_ADMIN, formData);
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Something went wrong";
      return rejectWithValue(errorMessage);
    }
  }
);
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.UPDATE_PASSWORD,
        data
      );
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to UPDATE password"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authData: null,
    status: null,
    loading: false,
    error: null,
    userData: null,
    getUserDashboardData: null,
    getAllCountryData: null,
    getUserNotificationsData: null,
    newsData: null,
    adminDashboardData: null,
    searchAllUsersData: null,
    menuData: null,
    user: null,
    UserchatData: null,
    chatIDData: null,
    adminregister: null,
    referralDataByLoginId: null,
    referralDataByLoginIdLoading: false,
    referralDataByLoginIdError: null,
    UserdashboardData: null,
    UserSummaryData: null,
    updateUserData:null,
    profileData: null,
    sendOtpFundRequestIncomeData: null,
    updateUserAdminData: null
  },

  reducers: {
    setUser: (state, action) => {
      state.userData = action.payload;
    },

    logout: (state) => {
      state.userData = null;
      state.loading = false;
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(appLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(appLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.authData = action.payload;
        doLogin(action.payload, "user");
        state.error = null;
      })

      .addCase(appLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.authData = action.payload;
        doLogin(action.payload, "admin");
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(userRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.error = null;
      })

      .addCase(userRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.authData = action.payload;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAdminDashboardDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminDashboardDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.adminDashboardData = action.payload;
        state.error = null;
      })
      .addCase(getAdminDashboardDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSearchAllUsersDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSearchAllUsersDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.searchAllUsersData = action.payload;
        state.error = null;
      })
      .addCase(getSearchAllUsersDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllMenuDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMenuDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.menuData = action.payload;
        state.error = null;
      })
      .addCase(getAllMenuDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchAdminUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load data";
      })
      .addCase(getUserAllChatsAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserAllChatsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.UserchatData = action.payload;
      })
      .addCase(getUserAllChatsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(chatMsgByIdAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(chatMsgByIdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.chatIDData = action.payload;
      })
      .addCase(chatMsgByIdAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.adminregister = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

      })

      .addCase(getReferralDataByLoginId.pending, (state) => {
        state.referralDataByLoginIdLoading = true;
        state.referralDataByLoginIdError = null;
      })
      .addCase(getReferralDataByLoginId.fulfilled, (state, action) => {
        state.referralDataByLoginIdLoading = false;
        state.referralDataByLoginId = action.payload;
        state.referralDataByLoginIdError = null;
      })
      .addCase(getReferralDataByLoginId.rejected, (state, action) => {
        state.referralDataByLoginIdLoading = false;
        state.referralDataByLoginId = null;
        state.referralDataByLoginIdError = action.payload;
      })

      .addCase(getAllCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.getAllCountryData = action.payload;
        state.error = null;
      })
      .addCase(getAllCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(sendOtpRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtpRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.authData = action.payload;
        state.error = null;
      })
      .addCase(sendOtpRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(sendWithdrawalOtpRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendWithdrawalOtpRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.authData = action.payload;
        state.error = null;
      })
      .addCase(sendWithdrawalOtpRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(validateOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.authData = action.payload;
        state.error = null;
      })
      .addCase(validateOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(sendOtpFundRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtpFundRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.authData = action.payload;
        state.error = null;
      })
      .addCase(sendOtpFundRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserDashboardDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserDashboardDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.UserdashboardData = action.payload;
      })
      .addCase(getUserDashboardDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUserSummaryDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserSummaryDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.UserSummaryData = action.payload;
      })
      .addCase(getUserSummaryDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       .addCase(sendOtpRequestwalletaddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtpRequestwalletaddress.fulfilled, (state, action) => {
        state.loading = false;
        state.authData = action.payload;
        state.error = null;
      })
      .addCase(sendOtpRequestwalletaddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

        .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.updateUserData = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

      })
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.authData = action.payload;
        state.error = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProfileDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfileDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.profileData = action.payload;
        state.error = null;
      })
      .addCase(getProfileDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendOtpFundRequestIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtpFundRequestIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.sendOtpFundRequestIncomeData = action.payload;
        state.error = null;
      })
      .addCase(sendOtpFundRequestIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.updateUserAdminData = action.payload;
        state.error = null;
      })
      .addCase(updateUserAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

