import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRequestWithToken, postRequestWithToken } from "@/app/api/auth";

const API_ENDPOINTS = {
  GET_ALL_WALLET_TRANS_TYPE: "/WalletReport/getAllWalletTransType",
  GET_DEPOSIT_WALLET_REPORT: "/WalletReport/getDepositWalletReport",
  GET_INCOME_WALLET_REPORT: "/WalletReport/getIncomeWalletReport",
  GET_ROI_WALLET_REPORT: "/WalletReport/getROIWalletWallerReport",
  GET_WITHDRAWAL_HISTORY: "/WalletReport/getWithdrawalHistory",
  GET_TRANSACTION_HISTORY: "/WalletReport/getTransactionHistory",
  GET_REFERALINK: "/WalletReport/getReferalink",
  GET_NETWORK_TREE: "/WalletReport/getNetworkTree",
  GET_NETWORK_TREE_ADMIN: '/Community/getNetworkTreeAdmin',
  GET_DIRECT_MEMBER: "/Community/getdirectMember",
  GET_DIRECT_MEMBER_ADMIN: "/Community/getdirectMemberAdmin",
  GET_PERSONAL_TEAM_LIST: "/Community/getPersonalTeam",
  GET_PERSONAL_TEAM_LIST_ADMIN: '/Community/getPersonalTeamAdmin',
  GET_REWARDS: "/WalletReport/getPerformanceRewardListByURID",
  GET_RANK_ACHIEVEMENT: "/WalletReport/getRankAchievementbyURID"
};

export const getAllWalletTransType = createAsyncThunk(
  "wallet/getAllWalletTransType",
  async (urid, { rejectWithValue }) => {
    try {
      const response = await getRequestWithToken(
        `${API_ENDPOINTS.GET_ALL_WALLET_TRANS_TYPE}`
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

export const getTransactionHistory = createAsyncThunk(
  "wallet/getTransactionHistory ",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.GET_TRANSACTION_HISTORY,
        data
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to add withdrawal request"
      );
    }
  }
);

export const getRechargeTransactBYTId = createAsyncThunk(
  "wallet/getRechargeTransactBYTId",
  async (urid, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        `${API_ENDPOINTS.GET_RECHRGE_TRANSACT_BY_ID}?URID=${urid}`
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

export const getIncomeWalletReport = createAsyncThunk(
  "wallet/getIncomeWalletReport",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.GET_INCOME_WALLET_REPORT,
        data
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to add withdrawal request"
      );
    }
  }
);
export const getHarvestWalletReport = createAsyncThunk(
  "wallet/getHarvestWalletReport",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.GET_HARVESTWALLET_REPORT,
        data
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to add withdrawal request"
      );
    }
  }
);
export const getRoiWalletReport = createAsyncThunk(
  "wallet/ getRoiWalletReport",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.GET_ROI_WALLET_REPORT,
        data
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to add withdrawal request"
      );
    }
  }
);

export const getRentWalletByURID = createAsyncThunk(
  "wallet/getRentWalletByURID",
  async (urid, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        `${API_ENDPOINTS.GET_RENTWALLET_BY_URID}?URID=${urid}`
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

export const getDepositWalletReport = createAsyncThunk(
  "wallet/getDepositWalletReport",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.GET_DEPOSIT_WALLET_REPORT,
        data
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to add withdrawal request"
      );
    }
  }
);

export const getWithdrawalHistory = createAsyncThunk(
  "wallet/getWithdrawalHistory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.GET_WITHDRAWAL_HISTORY,
        data
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to add withdrawal request"
      );
    }
  }
);
export const getUserReffrellLink = createAsyncThunk(
  "wallet/getUserReffrellLink",
  async (Authlogin, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        `${API_ENDPOINTS.GET_REFERALINK}?Authlogin=${Authlogin}`
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

export const getNetworkTree = createAsyncThunk(
  "wallet/getNetworkTree",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(`${API_ENDPOINTS.GET_NETWORK_TREE}?authlogin=${data}`
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch community data");
    }
  }
);
export const getNetworkTreeAdmin = createAsyncThunk(
  "wallet/getNetworkTreeAdmin",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(`${API_ENDPOINTS.GET_NETWORK_TREE_ADMIN}?authlogin=${data}`
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch community data");
    }
  }
);
export const getdirectMember = createAsyncThunk(
  "wallet/getdirectMember",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.GET_DIRECT_MEMBER,
        data
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch community data");
    }
  }
);
export const GetDirectMemberAdmin = createAsyncThunk(
  "wallet/GetDirectMemberAdmin",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.GET_DIRECT_MEMBER_ADMIN,
        data
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch community data");
    }
  }
);

export const getPersonalTeamList = createAsyncThunk(
  "wallet/getPersonalTeamList",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.GET_PERSONAL_TEAM_LIST,
        data
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch community data");
    }
  }
);
export const getPersonalTeamListAdmin = createAsyncThunk(
  "wallet/getPersonalTeamListAdmin",
  async (data, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        API_ENDPOINTS.GET_PERSONAL_TEAM_LIST_ADMIN,
        data
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch community data");
    }
  }
);
export const getPerformanceRewardListByURID = createAsyncThunk(
  "wallet/getPerformanceRewardListByURID",
  async (urid, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        `${API_ENDPOINTS.GET_REWARDS}?URID=${urid}`
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

export const getrankAchivement = createAsyncThunk(
  "wallet/getrankAchivement",
  async (urid, { rejectWithValue }) => {
    try {
      const response = await postRequestWithToken(
        `${API_ENDPOINTS.GET_RANK_ACHIEVEMENT}?URID=${urid}`
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

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    loading: false,
    error: null,
    walletData: null,
    DepositWalletReportData: null,
    getIncomeWalletReportdata: null,
    WithdrawalHistoryData: null,
    getRentWalletByURIDdata: null,
    harvestWalletData: null,
    roiWalletData: null,
    getLeaderShipData: null,
    PerformanceRewardListData: null,
    transactionhistorydata: null,
    PackageData: null,
    addRechargeTransactionUserdata: null,
    TransactionHistoryIncomedata: null,
    getAlluserWalletData: null,
    generateRoiData: null,
    checkRoiData: null,
    searchBindBuyPackageData: null,
    rankData: null,
    transactionhistorydata: null,
    Botdata: null,
    refrelData: null,
    getNetworkTreeData: null,
    directMemberData: null,
    personalTeamList: null,
    PerformanceRewardListData: null,
    AchivementListData: null,
    GetDirectMemberAdminData: null,
    getPersonalTeamListAdminData: null,
    getNetworkTreeAdminData: null
  },
  reducers: {
    resetSearchBindBuyPackage: (state) => {
      state.searchBindBuyPackageData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionhistorydata = action.payload;
        state.error = null;
      })
      .addCase(getTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllWalletTransType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllWalletTransType.fulfilled, (state, action) => {
        state.loading = false;
        state.walletData = action.payload;
        state.error = null;
      })
      .addCase(getAllWalletTransType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDepositWalletReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDepositWalletReport.fulfilled, (state, action) => {
        state.loading = false;
        state.DepositWalletReportData = action.payload;
        state.error = null;
      })
      .addCase(getDepositWalletReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getIncomeWalletReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIncomeWalletReport.fulfilled, (state, action) => {
        state.loading = false;
        state.getIncomeWalletReportdata = action.payload;
        state.error = null;
      })
      .addCase(getIncomeWalletReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getRoiWalletReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoiWalletReport.fulfilled, (state, action) => {
        state.loading = false;
        state.roiWalletData = action.payload;
        state.error = null;
      })
      .addCase(getRoiWalletReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getWithdrawalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWithdrawalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.WithdrawalHistoryData = action.payload;
        state.error = null;
      })
      .addCase(getWithdrawalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUserReffrellLink.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserReffrellLink.fulfilled, (state, action) => {
        state.loading = false;
        state.refrelData = action.payload;
        state.error = null;
      })
      .addCase(getUserReffrellLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getNetworkTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNetworkTree.fulfilled, (state, action) => {
        state.loading = false;
        state.getNetworkTreeData = action.payload;
        state.error = null;
      })
      .addCase(getNetworkTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getdirectMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getdirectMember.fulfilled, (state, action) => {
        state.loading = false;
        state.directMemberData = action.payload;
        state.error = null;
      })
      .addCase(getdirectMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getPersonalTeamList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPersonalTeamList.fulfilled, (state, action) => {
        state.loading = false;
        state.personalTeamList = action.payload;
        state.error = null;
      })
      .addCase(getPersonalTeamList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getPerformanceRewardListByURID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPerformanceRewardListByURID.fulfilled, (state, action) => {
        state.loading = false;
        state.PerformanceRewardListData = action.payload;
        state.error = null;
      })
      .addCase(getPerformanceRewardListByURID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getrankAchivement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getrankAchivement.fulfilled, (state, action) => {
        state.loading = false;
        state.AchivementListData = action.payload;
        state.error = null;
      })
      .addCase(getrankAchivement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(GetDirectMemberAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetDirectMemberAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.GetDirectMemberAdminData = action.payload;
      })
      .addCase(GetDirectMemberAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPersonalTeamListAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPersonalTeamListAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.getPersonalTeamListAdminData = action.payload;
      })
      .addCase(getPersonalTeamListAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getNetworkTreeAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNetworkTreeAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.getNetworkTreeAdminData = action.payload;
      })
      .addCase(getNetworkTreeAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

  },
});

export const { resetSearchBindBuyPackage } = walletSlice.actions;
export default walletSlice.reducer;