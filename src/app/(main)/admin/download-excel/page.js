"use client"
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { downloadExcel } from '@/app/redux/slices/adminMasterSlice';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaFileExcel, FaDownload, FaChartBar, FaUsers, FaWallet, FaMoneyBillWave, FaHistory, FaArrowRight } from 'react-icons/fa';
import { RiFileExcel2Line, RiDownloadLine, RiBarChartBoxLine } from "react-icons/ri";

const DownloadExcel = () => {
  const dispatch = useDispatch();
  const [selectedReport, setSelectedReport] = useState('');
  const { loading, error, excelData } = useSelector((state) => state.adminMaster);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(500);
  const [showTable, setShowTable] = useState(false);

  const reportTypes = [
    { value: 'AllMember', label: 'All Member', icon: FaUsers, color: 'emerald' },
    { value: 'ActiveIds', label: 'Active IDs', icon: FaChartBar, color: 'blue' },
    { value: 'WalletReport', label: 'Wallet Report', icon: FaWallet, color: 'purple' },
    { value: 'IncomeWallet', label: 'Income Wallet', icon: FaMoneyBillWave, color: 'green' },
    { value: 'DepositWallet', label: 'Deposit Wallet', icon: FaWallet, color: 'orange' },
    { value: 'Withdrawal', label: 'Withdrawal', icon: FaHistory, color: 'red' },
    { value: 'Deposit', label: 'Deposit', icon: FaMoneyBillWave, color: 'teal' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedReport) {
      const action = await dispatch(downloadExcel({ transType: selectedReport }));
      if (action.payload && Array.isArray(action.payload.data) && action.payload.data.length > 0) {
        setShowTable(true);
        const ws = XLSX.utils.json_to_sheet(action.payload.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = `${selectedReport}_Report.xlsx`;
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), fileName);
      } else {
        setShowTable(false);
      }
      if (action.payload && action.payload.statusCode === 200) {
        toast.success(action.payload.message || 'Report downloaded successfully!');
      }
    }
  };
  
  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
    setShowTable(false);
    setCurrentPage(1);
  };

  const getSelectedReportDetails = () => {
    return reportTypes.find(r => r.value === selectedReport);
  };

  const tableData = excelData && Array.isArray(excelData.data)
    ? excelData.data.map((item, idx) => ({ srNo: idx + 1, ...item }))
    : [];
  
  const paginatedData = tableData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, tableData.length);

  const selectedReportDetails = getSelectedReportDetails();

  return ( 
    <div>
      <div>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
              <RiFileExcel2Line className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Download Excel Reports
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                <RiBarChartBoxLine className="text-emerald-500" />
                Generate and download various system reports
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Form Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaDownload className="text-xl" />
              Report Generator
            </h2>
            <p className="text-emerald-100 text-sm mt-1">Select a report type to download data</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="max-w-md space-y-5">
              <div>
                <label htmlFor="reportType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaFileExcel className="inline mr-2 text-emerald-500" />
                  Select Report Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RiFileExcel2Line className="h-5 w-5 text-emerald-500" />
                  </div>
                  <select
                    id="reportType"
                    value={selectedReport}
                    onChange={handleReportChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 cursor-pointer"
                    required
                  >
                    <option value="">Select a Report Type</option>
                    {reportTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedReport || loading}
                className="group relative w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden shadow-md"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <RiDownloadLine className="text-lg group-hover:translate-y-0.5 transition-transform" />
                      Download Report
                      <FaArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                </div>
              )}
            </form>

            {/* Selected Report Info */}
            {selectedReport && !showTable && !loading && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  {selectedReportDetails && (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <selectedReportDetails.icon className="text-blue-600 dark:text-blue-400 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Ready to generate</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Click "Download Report" to export {selectedReportDetails.label} data
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Table Section */}
        {showTable && excelData && Array.isArray(excelData.data) && excelData.data.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedReportDetails && (
                    <>
                      <selectedReportDetails.icon className="text-white text-lg" />
                      <h3 className="text-lg font-semibold text-white">
                        {selectedReportDetails.label} Report
                      </h3>
                    </>
                  )}
                </div>
                <div className="text-xs text-emerald-100">
                  Total Records: {tableData.length}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">#</th>
                    {tableData[0] && Object.keys(tableData[0]).filter(key => key !== 'srNo' && key !== 'WalletAddress').map((key) => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={tableData[0] ? Object.keys(tableData[0]).length : 1} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <FaFileExcel className="text-3xl text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">No data found</p>
                        </div>
                       </td>
                    </tr>
                  ) : (
                    paginatedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                          {startItem + idx}
                        </td>
                        {Object.keys(row).filter(key => key !== 'srNo' && key !== 'WalletAddress').map((key, i) => (
                          <td key={i} className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 break-words max-w-[250px]">
                            {row[key]}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {tableData.length > 0 && (
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
                  Showing <span className="font-semibold">{startItem}</span> to <span className="font-semibold">{endItem}</span> of <span className="font-semibold">{tableData.length}</span> entries
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
        )}

        {/* No Data State */}
        {showTable && excelData && Array.isArray(excelData.data) && excelData.data.length === 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <FaFileExcel className="text-3xl text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No data found for this report</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try selecting a different report type</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadExcel;