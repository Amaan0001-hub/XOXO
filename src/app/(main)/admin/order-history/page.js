"use client";
import { useState, useEffect } from "react";
import { getLeaseStatemtnt, usernameLoginId } from "@/app/redux/slices/adminMasterSlice";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Search, FileSpreadsheet, Calendar, User, UserCircle2 } from "lucide-react";
import { FaSyncAlt, FaShoppingBag, FaDollarSign, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import { RiUserSearchLine, RiRefreshLine, RiFileExcel2Line, RiShoppingCartLine } from "react-icons/ri";
import Spinner from "@/app/common/spinner";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const LeaseStatementData = useSelector(
    (state) => state.adminMaster?.LeaseStatementData?.data || []
  );
  const loading = useSelector((state) => state.adminMaster?.loading || false);
  const productList = useSelector((state) => state.product?.data ?? []);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(500);
  const [currentPage, setCurrentPage] = useState(1);
  const [userError, setUserError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentData = LeaseStatementData?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(LeaseStatementData?.length / entriesPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const totalPrice =
    hasSearched && LeaseStatementData ? LeaseStatementData.reduce((sum, txn) => sum + (txn.Rkprice || 0), 0) : 0

  useEffect(() => {
    const fetchUsername = async () => {
      if (!userId.trim()) {
        setUsername("");
        setUserError("");
        return;
      }
      const result = await dispatch(usernameLoginId(userId));
      if (result?.payload && result.payload.name) {
        setUsername(result.payload.name);
        setUserError("");
      } else {
        setUsername("");
        setUserError("Invalid User ID");
      }
    };
    fetchUsername();
  }, [userId, dispatch]);

  const handleSearch = async () => {
    setSearchLoading(true);
    const payload = {
      authLogin: userId || "",
      productName: selectedProductName || "",
      fromDate: formatDate(fromDate) || "",
      toDate: formatDate(toDate) || "",
    };

    try {
      await dispatch(getLeaseStatemtnt(payload));
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearchLoading(false);
    }

    setHasSearched(true);
  };

  const handleExport = () => {
    if (!LeaseStatementData || LeaseStatementData.length === 0) {
      alert("No data available to export");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(
      LeaseStatementData.map((txn, index) => ({
        "Sr.No.": index + 1,
        Username: txn.AuthLogin,
        Name: txn.FullName,
        Price: `$${txn.Rkprice}`,
        DurationMonth: txn.DurationOnMonth,
        WeeklyROI: txn.WeeklyReturn,
        TotalReturn: txn.TotalReturn,
        Credit: `$${txn.CreditAmt}`,
        MaxLimit: `$${txn.MaxLimit}`,
        OrderDate: txn.RDate ? txn.RDate.split("T")[0] : "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Transactions.xlsx");
  };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    const payload = {
      authLogin: "",
      productName: "",
      fromDate: "",
      toDate: "",
    };

    try {
      await dispatch(getLeaseStatemtnt(payload));
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshLoading(false);
      setFromDate("");
      setToDate("");
      setSelectedProductName("");
      setUserId("");
      setUsername("");
      setUserError("");
      setCurrentPage(1);
      setHasSearched(false);
    }
  };

  return (
    <div>
      <div>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
                <RiShoppingCartLine className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Order History
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  View and manage all customer orders
                </p>
              </div>
            </div>
            
            <button
              onClick={handleExport}
              className="group px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-md"
            >
              <RiFileExcel2Line className="text-lg group-hover:scale-110 transition-transform" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {hasSearched && LeaseStatementData?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{LeaseStatementData.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <FaShoppingBag className="text-white text-xl" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">${Number(totalPrice).toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <FaDollarSign className="text-white text-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Form Card */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RiUserSearchLine className="text-xl" />
              Search Filters
            </h2>
            <p className="text-emerald-100 text-sm mt-1">Filter orders by date, product, or user</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* From Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline mr-2 text-emerald-500 w-4 h-4" />
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline mr-2 text-emerald-500 w-4 h-4" />
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>

              {/* User ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline mr-2 text-emerald-500 w-4 h-4" />
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200
                    ${userError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                    }`}
                  placeholder="Enter user ID"
                />
                {userError && (
                  <p className="mt-2 text-sm text-red-500">{userError}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <UserCircle2 className="inline mr-2 text-emerald-500 w-4 h-4" />
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  placeholder="Username will appear here"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="group px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-md"
              >
                {searchLoading ? (
                  <>
                    <Spinner size={4} color="text-white" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Search Orders
                  </>
                )}
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshLoading}
                className="group px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
              >
                <RiRefreshLine className={`text-lg ${refreshLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                {refreshLoading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {hasSearched && LeaseStatementData?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FaShoppingBag className="text-emerald-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Found <span className="text-emerald-600 font-bold">{LeaseStatementData.length}</span> orders
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total Amount: ${Number(totalPrice).toFixed(2)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Price ($)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Duration (Months)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Weekly APR ($)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Total Return</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Credit ($)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Order Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {currentData.map((txn, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-medium text-gray-900 dark:text-white">
                        {txn.AuthLogin}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {txn.FullName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        ${txn.Rkprice}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {txn.DurationOnMonth}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-400">
                        ${txn.WeeklyReturn}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-purple-600 dark:text-purple-400">
                        ${txn.TotalReturn}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        ${txn.CreditAmt}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {txn.RDate ? txn.RDate.split("T")[0] : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {LeaseStatementData.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value={500}>500</option>
                      <option value={1000}>1000</option>
                      <option value={1500}>1500</option>
                    </select>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min(indexOfLastItem, LeaseStatementData.length)}</span> of{' '}
                    <span className="font-semibold">{LeaseStatementData.length}</span> entries
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200
                              ${currentPage === pageNum
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Data State */}
        {hasSearched && (!LeaseStatementData || LeaseStatementData.length === 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <FaShoppingBag className="text-3xl text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;