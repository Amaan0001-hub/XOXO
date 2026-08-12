"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPersonalTeamListAdmin } from "@/app/redux/slices/walletSlice";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaSearch, FaFileExcel, FaSyncAlt } from "react-icons/fa";
import Spinner from "@/app/common/spinner";

const DownlineAffiliates = () => {
  const dispatch = useDispatch();
  const [authLogin, setAuthLogin] = useState("");
  const [searched, setSearched] = useState(false);
  const [lastSearched, setLastSearched] = useState("");
  const { getPersonalTeamListAdminData, loading, error } = useSelector(
    (state) => state.wallet
  );
  const [errors, setErrors] = useState({});
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(500);

  // 🔍 Search
  const handleSearch = () => {
    const newErrors = {};
    if (!authLogin.trim()) {
      newErrors.title = "UserID is required";
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const payload = {
      authLogin: authLogin,
      lvl: "",
      statusId: ""
    }
    dispatch(getPersonalTeamListAdmin(payload));
    setSearched(true);
    setLastSearched(authLogin);
    setCurrentPage(1); 
  };

  // 📊 Export Excel
  const handleExport = () => {
    const data = Array.isArray(getPersonalTeamListAdminData)
      ? getPersonalTeamListAdminData
      : getPersonalTeamListAdminData?.data || [];

    if (!data || data.length === 0) {
      alert("No data available to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((member, idx) => ({
        "Sr.No.": idx + 1,
        "Login ID": member.loginid,
        "Sponsor ID": member.sponsorId,
        Name: member.name,
        Email: member.email,
        Mobile: member.mobile,
        "Team Business": `$${member.teamBusiness}`,
        Rank: member.urank,
        "Register Date": member.regDate,
        "Topup Value": `$${member.topupValue}`,
        Level: member.uLvl,
        Status: member.status,
        "Topup Status": member.topupDate,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Downline Members");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "DownlineMembers.xlsx");
  };

  // 🔄 Refresh
  const handleRefresh = () => {
    setRefreshLoading(true);
    setTimeout(() => {
      setAuthLogin("");
      setSearched(false);
      setCurrentPage(1);
      setRefreshLoading(false);
    }, 1000); // Simulate loading time
  };

  const data = Array.isArray(getPersonalTeamListAdminData)
    ? getPersonalTeamListAdminData
    : getPersonalTeamListAdminData?.data || [];

  // Pagination calculation
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

 return (
  <div>
    {/* Header */}
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 transition-transform duration-300 transform shadow-lg rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-105">
          <FaSearch className="text-2xl text-white" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Downline Affiliates
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage your complete downline affiliate network
          </p>
        </div>
      </div>
    </div>

    {/* Search Card */}
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <FaSearch className="text-lg" />
          Search Downline
        </h2>

        <p className="mt-1 text-sm text-emerald-100">
          Enter user ID to view downline affiliates
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Input */}
          <div className="md:col-span-1">
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              User ID <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={authLogin}
              onChange={(e) => {
                setAuthLogin(e.target.value);
                if (e.target.value === "") setSearched(false);
              }}
              placeholder="Enter user ID"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />

            {errors.title && (
              <div className="mt-2 text-sm text-red-500">
                {errors.title}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="md:col-span-3">
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Actions
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-white font-medium transition-all duration-200 transform shadow-md group rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Spinner size={4} color="text-white" />
                ) : (
                  <FaSearch className="text-sm transition-transform group-hover:scale-110" />
                )}

                {loading ? "Searching..." : "Search"}
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-2.5 text-white font-medium transition-all duration-200 transform shadow-md group rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105"
              >
                <FaFileExcel className="text-sm transition-transform group-hover:scale-110" />
                Export Excel
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshLoading}
                className="flex items-center gap-2 px-6 py-2.5 text-white font-medium transition-all duration-200 transform shadow-md group rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSyncAlt
                  className={`text-sm ${
                    refreshLoading
                      ? "animate-spin"
                      : "group-hover:rotate-180 transition-transform duration-500"
                  }`}
                />

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
          <div className="flex flex-col items-center justify-center py-20 bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>

            <p className="mt-4 font-medium text-gray-500 dark:text-gray-400">
              Loading downline data...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
            <p className="font-medium text-red-500">
              {error.message || "Something went wrong"}
            </p>
          </div>
        ) : data && data.length > 0 ? (
          <div className="overflow-hidden bg-white border border-gray-200 shadow-xl dark:bg-gray-800 rounded-2xl dark:border-gray-700">
            {/* Results Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FaSearch className="text-blue-500" />

                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Found{" "}
                  <span className="font-bold text-blue-600">
                    {data.length}
                  </span>{" "}
                  affiliates
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <tr>
                    {[
                      "Sr.No.",
                      "Login ID",
                      "Sponsor ID",
                      "Name",
                      "Email",
                      "Mobile",
                      "Team Business ($)",
                      "Rank",
                      "Register Date",
                      "Topup Date",
                      "Total Team",
                      "Active Team",
                      "Monthly Self",
                      "Monthly Team",
                      "Level",
                      "Status",
                    ].map((heading, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-white uppercase whitespace-nowrap"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {paginatedData?.map((member, idx) => (
                    <tr
                      key={idx}
                      className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                        {startIndex + idx + 1}
                      </td>

                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {member.loginid}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap dark:text-gray-300">
                        {member.sponsorId}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap dark:text-gray-300">
                        {member.name}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap dark:text-gray-400">
                        {member.email}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap dark:text-gray-400">
                        {member.mobile}
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-blue-600 whitespace-nowrap dark:text-blue-400">
                        ${member.teamBusiness}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 border border-orange-200">
                          {member.urank || "Null"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap dark:text-gray-400">
                        {member.regDate}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap dark:text-gray-400">
                        {member.topupDate || "-"}
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-center text-gray-900 whitespace-nowrap dark:text-white">
                        {member.totTeam}
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-center text-green-600 whitespace-nowrap dark:text-green-400">
                        {member.activeTeam}
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                        {member.monthlySelf}
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                        {member.monthlyTeam}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap dark:text-gray-300">
                        {member.uLvl}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                          ${
                            member.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 sm:flex-row bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Rows per page:
                  </span>

                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg cursor-pointer dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                    <option value="1500">1500</option>
                  </select>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-semibold">{startIndex + 1}</span> to{" "}
                  <span className="font-semibold">
                    {Math.min(endIndex, data.length)}
                  </span>{" "}
                  of <span className="font-semibold">{data.length}</span>{" "}
                  entries
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 text-sm transition-all duration-200 border border-gray-300 rounded-lg dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700"
                  >
                    ‹
                  </button>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 text-sm transition-all duration-200 border border-gray-300 rounded-lg dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
            <p className="font-medium text-gray-500 dark:text-gray-400">
              No affiliates found for this user
            </p>
          </div>
        )}
      </>
    )}
  </div>
);
};

export default DownlineAffiliates;