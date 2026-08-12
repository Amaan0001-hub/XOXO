"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetDirectMemberAdmin } from "@/app/redux/slices/walletSlice";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaSearch, FaFileExcel, FaSyncAlt, FaUsers, FaUserFriends, FaTrophy, FaDollarSign } from "react-icons/fa";
import { RiUserSearchLine, RiRefreshLine, RiFileExcel2Line, RiTeamLine } from "react-icons/ri";
import Spinner from "@/app/common/spinner";

export default function Affiliate() {
  const dispatch = useDispatch();
  const { GetDirectMemberAdminData, loading, error } = useSelector(
    (state) => state.wallet
  );

  const [loginId, setLoginId] = useState("");
  const [searched, setSearched] = useState(false);
  const [errors, setErrors] = useState({});
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(500);

  // Fetch direct members when search button clicked
  const handleSearch = () => {
    const newErrors = {};
    if (!loginId.trim()) {
      newErrors.title = "UserID is required";
      setErrors(newErrors);
      return;
    }
    dispatch(GetDirectMemberAdmin({ statusId: "", loginid: loginId }));
    setSearched(true);
    setCurrentPage(1); // reset page
  };

  // Export Excel
  const handleExport = () => {
    if (!GetDirectMemberAdminData || GetDirectMemberAdminData.length === 0) {
      alert("No data available to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      GetDirectMemberAdminData.map((member, idx) => ({
        "Sr.No.": idx + 1,
        Email: member.email,
        Mobile: member.mobile,
        Position: member.position,
        Package: member.package,
        "Left Business": member.leftbusiness,
        "Right Business": member.rightbusiness,
        "Register Date": member.regDate,
        "Topup Date": member.topupDate || "-",
        Topup: member.topup || "-",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Direct Members");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, "DirectMembers.xlsx");
  };

  // Refresh
  const handleRefresh = () => {
    setRefreshLoading(true);
    setTimeout(() => {
      setLoginId("");
      setSearched(false);
      setCurrentPage(1);
      setRefreshLoading(false);
    }, 1000); // Simulate loading time
  };

  // Pagination calculation
  const totalPages = Math.ceil(GetDirectMemberAdminData?.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = GetDirectMemberAdminData?.slice(startIndex, endIndex);

  // Calculate statistics
  const totalTeamBusiness = GetDirectMemberAdminData?.reduce((sum, member) => sum + (parseFloat(member.teamBusiness) || 0), 0) || 0;
  const totalLeaseAmount = GetDirectMemberAdminData?.reduce((sum, member) => sum + (parseFloat(member.leaseAmount) || 0), 0) || 0;

  return (
    <div>
      <div>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
              <FaUserFriends className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Direct Affiliates
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                View and manage your direct affiliate network
              </p>
            </div>
          </div>
        </div>

     

        {/* Search Form Card */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RiUserSearchLine className="text-xl" />
              Search Affiliates
            </h2>
            <p className="text-emerald-100 text-sm mt-1">Enter user ID to view their direct affiliate network</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* User ID Input */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  placeholder="Enter user ID"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                {errors.title && (
                  <div className="mt-2 text-sm text-red-500">{errors.title}</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Actions
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="group px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-md"
                  >
                    {loading ? <Spinner size={4} color="text-white" /> : <FaSearch className="text-sm group-hover:scale-110 transition-transform" />}
                    Search
                  </button>

                  <button
                    onClick={handleExport}
                    className="group px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-md"
                  >
                    <RiFileExcel2Line className="text-lg group-hover:scale-110 transition-transform" />
                    Export Excel
                  </button>

                  <button
                    onClick={handleRefresh}
                    disabled={refreshLoading}
                    className="group px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                  >
                    <RiRefreshLine className={`text-lg ${refreshLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    {refreshLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {searched && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading affiliates data...</p>
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-500 dark:text-red-400 font-medium">{error.message || "Something went wrong"}</p>
              </div>
            ) : GetDirectMemberAdminData && GetDirectMemberAdminData.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Results Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <FaUserFriends className="text-emerald-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Found <span className="text-emerald-600 font-bold">{GetDirectMemberAdminData?.length}</span> affiliates
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date().toLocaleString()}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 sticky top-0">
                      <tr>
                        {[
                          "Sr.No.",
                        "Username",
                        "Name",
                        "Email",
                        "Mobile",
                        "Position",
                        "Package ($)",
                        "Left Bussiness ($)",
                        "Right Bussiness ($)",
                        "Register Date",
                        "Topup Date",
                        "Topup Status",

                        ].map((heading, i) => (
                          <th
                            key={i}
                            className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      {paginatedData?.length === 0 ? (
                        <tr>
                          <td colSpan={16} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <FaUserFriends className="text-3xl text-gray-400" />
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">No affiliates found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                       paginatedData?.map((member, idx) => (
                        <tr
                          key={idx}
                          className="transition-colors border-b h last:border-none"
                        >
                          <td className="px-4 py-3 border td-wrap-text">
                            {startIndex + idx + 1}
                          </td>
                          <td className="px-4 py-3 border td-wrap-text">
                            {member.loginid}
                          </td>
                          <td className="px-4 py-3 border td-wrap-text">
                            {member.name}
                          </td>
                          <td className="px-4 py-3 border td-wrap-text">
                            {member.email}
                          </td>
                          <td className="px-4 py-3 border td-wrap-text">
                            {member.mobile}
                          </td>
                          <td className="px-4 py-3 border td-wrap-text">
                            {member.position}
                          </td>
                          <td className="px-4 py-3 border td-wrap-text">
                            {member.package}
                          </td>
                          <td className="px-4 py-3 border td-wrap-text">
                            {member.leftbusiness}
                          </td>
                          <td className="px-4 py-3 border td-wrap-text">
                            {member.rightbusiness}
                          </td>
                          <td className="px-4 py-3 border td-wrap-text">
                            {member.regDate}
                          </td>
                          <td className="px-4 py-3 border td-wrap-text">
                            {member.topupDate || '-'}
                          </td>
                          <td className="px-4 py-3 border td-wrap-text">
                            {member.topup || '-'}
                          </td>

                        </tr>
                      ))


                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {GetDirectMemberAdminData?.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="500">500</option>
                        <option value="1000">1000</option>
                        <option value="1500">1500</option>
                      </select>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
                      <span className="font-semibold">{Math.min(endIndex, GetDirectMemberAdminData?.length)}</span> of{" "}
                      <span className="font-semibold">{GetDirectMemberAdminData?.length}</span> entries
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
            ) : searched && !loading && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FaUserFriends className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No affiliates found for this user</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try searching with a different user ID</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}