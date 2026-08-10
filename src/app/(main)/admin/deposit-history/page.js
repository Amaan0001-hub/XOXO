'use client'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllFundRequestReportAdmin } from '@/app/redux/slices/fundManagerSlice'
import { usernameLoginId } from '@/app/redux/slices/adminMasterSlice'
import { FaCopy } from 'react-icons/fa'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver';
import { FaCalendarAlt, FaUser, FaIdBadge } from "react-icons/fa";
import { FaSearch, FaFileExcel, FaSyncAlt,FaFilter } from "react-icons/fa";

const DepositHistory = () => {
  const dispatch = useDispatch()
  const { fundRequestData, loading, error } = useSelector(
    (state) => state.fundManager,
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(500)
  const [searchTerm, setSearchTerm] = useState('')
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [userError, setUserError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    return `${day}-${month}-${year}`
  }

  const totalRelease =
    fundRequestData?.approvedFundRequest?.reduce(
      (sum, txn) => sum + (Number(txn.Amount) || 0),
      0,
    ) || 0

  useEffect(() => {
    const fetchUsername = async () => {
      if (!userId.trim()) {
        setUsername('')
        setUserError('')
        return
      }
      const result = await dispatch(usernameLoginId(userId))
      if (result?.payload && result.payload.name) {
        setUsername(result.payload.name)
        setUserError('')
      } else {
        setUsername('')
        setUserError('Invalid User ID')
      }
    }
    fetchUsername()
  }, [userId, dispatch])

  const handleSearch = () => {
    const payload = {
      authLogin: userId || '',
      fromDate: formatDate(fromDate) || '',
      toDate: formatDate(toDate) || '',
    }
    dispatch(getAllFundRequestReportAdmin(payload))
    setHasSearched(true)
  }

  const handleExport = () => {
    if (
      !fundRequestData?.approvedFundRequest ||
      fundRequestData?.approvedFundRequest?.length === 0
    ) {
      alert('No data available to export')
      return
    }
    const worksheet = XLSX.utils.json_to_sheet(
      fundRequestData?.approvedFundRequest?.map((txn, index) => ({
        'Sr.No.': index + 1,
        Username: txn.AuthLogin,
        Name: txn.Name,
        Email: txn.Email,
        Amount: `$${txn.Amount}`,
        TransactionHash: txn.RefrenceNo,
        PaymentMode: txn.PaymentMode,
        PaymentDate: txn.PaymentDate,
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(data, 'Transactions.xlsx')
  }

  const handleRefresh = () => {
    setFromDate('')
    setToDate('')
    setUserId('')
    setUsername('')
    setUserError('')
    setSearchTerm('')
    setStatusFilter('')
    setCurrentPage(1)
    setHasSearched(false)
  }
   const allRows = fundRequestData?.approvedFundRequest || [];

  const filteredByStatus = statusFilter
    ? allRows.filter(row => row.Rf_Status === statusFilter)
    : allRows;

  const filteredRows = filteredByStatus.filter(row =>
  (row.AuthLogin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.Amount?.toString().includes(searchTerm)) ||
    (row.PaymentMode?.toString().includes(searchTerm)) ||
    row.RefrenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.PaymentDate?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const rowsToDisplay = filteredRows
  const paginatedRows = rowsToDisplay.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  )
  const totalPages = Math.ceil(rowsToDisplay.length / rowsPerPage)
  const startItem = (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, rowsToDisplay.length)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!', {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  const truncateRefNo = (refNo) => {
    if (!refNo) return '-'
    return refNo.length > 15 ? `${refNo.substring(0, 15)}...` : refNo
  }

  return (
    <div className="p-8 mx-auto mt-2 border border-gray-200 shadow-2xl max-w-7xl bg-gradient-to-br from-blue-50 to-white rounded-3xl">
      {/* Header */}
      <h6 className="heading">
        Fund History:{' '}
        <span className="font-bold text-green-600">
          ${Number(totalRelease.toFixed(2))}
        </span>
      </h6>


{/* Filters Section */}
<div className="grid grid-cols-1 gap-6 mt-0 md:grid-cols-2 lg:grid-cols-5">
  {/* From Date */}
  <div>
    <label className="block mb-1 text-sm font-semibold text-black">
      From Date
    </label>
    <div className="relative">
      <FaCalendarAlt className="absolute text-blue-500 -translate-y-1/2 left-3 top-1/2" />
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="w-full py-2 pl-10 pr-3 border border-gray-300 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none"
      />
    </div>
  </div>

  {/* To Date */}
  <div>
    <label className="block mb-1 text-sm font-semibold text-black">
      To Date
    </label>
    <div className="relative">
      <FaCalendarAlt className="absolute text-blue-500 -translate-y-1/2 left-3 top-1/2" />
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="w-full py-2 pl-10 pr-3 border border-gray-300 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none"
      />
    </div>
  </div>

  {/* User ID */}
  <div>
    <label className="block mb-1 text-sm font-semibold text-black">
      User ID
    </label>
    <div className="relative">
      <FaIdBadge className="absolute text-blue-500 -translate-y-1/2 left-3 top-1/2" />
      <input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="w-full py-2 pl-10 pr-3 border border-gray-300 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none"
      />
    </div>
    {userError && (
      <p className="mt-1 text-sm text-red-600">{userError}</p>
    )}
  </div>

  {/* Username */}
  <div>
    <label className="block mb-1 text-sm font-semibold text-black">
      Username
    </label>
    <div className="relative">
      <FaUser className="absolute text-blue-500 -translate-y-1/2 left-3 top-1/2" />
      <input
        type="text"
        value={username}
        readOnly
        className="w-full py-2 pl-10 pr-3 bg-gray-100 border border-gray-200 shadow-inner cursor-not-allowed rounded-xl"
      />
    </div>
  </div>

  <div>
            <label className="block mb-1 text-sm font-semibold text-black">
              Status
            </label>
            <div className="relative">
              <FaFilter className="absolute text-blue-500 -translate-y-1/2 left-3 top-1/2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 pl-10 pr-3 border border-gray-300 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
</div>

{/* Buttons */}
<div className="flex flex-wrap gap-3 mt-6 mb-6 btn-flex">
  {/* Search Button */}
  <button
    onClick={handleSearch}
    className="flex items-center gap-2 px-5 py-2 text-white transition bg-blue-600 shadow rounded-xl hover:bg-blue-700"
  >
    <FaSearch className="w-4 h-4" /> Search
  </button>

  {/* Export Button */}
  <button
    onClick={handleExport}
    className="flex items-center gap-2 px-5 py-2 text-white transition bg-green-600 shadow rounded-xl hover:bg-green-700"
  >
    <FaFileExcel className="w-4 h-4" /> Export Excel
  </button>

  {/* Refresh Button */}
  <button
    onClick={handleRefresh}
    className="flex items-center gap-2 px-5 py-2 text-white transition bg-gray-600 shadow rounded-xl hover:bg-gray-700"
  >
    <FaSyncAlt className="w-4 h-4 animate-spin-on-hover" /> Refresh
  </button>
</div>


      {/* Table Section */}
    {/* Table Section */}
{hasSearched && (
  <>
    {loading ? (
      <div className="py-10 mt-10 font-semibold text-center text-blue-600 bg-white border border-gray-200 shadow-xl rounded-2xl">
        Loading...
      </div>
    ) : error ? (
      <div className="py-10 font-semibold text-center text-red-500">
        {error}
      </div>
    ) : (
      <div className="overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-center border-collapse">
            {/* Table Header */}
            <thead className="text-white bg-blue-600">
              <tr>
                {[
                  'Sr.No.',
                  'User ID',
                  'Username',
                  'Email',
                  'Amount ($)',
                  'Request Type',
                  'Payment Method',
                  'Transaction Hash',
                  'Payment Date',
                  'Remark',
                  'Status',
                ].map((heading, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-xs font-semibold tracking-wide uppercase border border-b border-blue-500 th-wrap-text"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-10 text-lg text-center text-gray-400"
                  >
                    No Data Found
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="transition-colors border-b hover:bg-blue-50 last:border-none td-wrap-text"
                  >
                    <td className="px-4 py-3 font-medium td-wrap-text">{startItem + idx}</td>
                    <td className="px-4 py-3 border td-wrap-text">{row.AuthLogin || '-'}</td>
                    <td className="px-4 py-3 border td-wrap-text">{row.Name || '-'}</td>
                    <td className="px-4 py-3 border td-wrap-text">{row.Email || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700 td-wrap-text">
                      {row.Amount}
                    </td>
                    <td className="px-4 py-3 border td-wrap-text">{row.RequestType || '-'}</td>
                    <td className="px-4 py-3 border td-wrap-text">{row.PaymentMode}</td>
                    <td className="px-4 py-3 border td-wrap-text">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className="truncate max-w-[100px]"
                          title={row.RefrenceNo}
                        >
                          {truncateRefNo(row.RefrenceNo)}
                        </span>
                        {row.RefrenceNo && (
                          <button
                            onClick={() => copyToClipboard(row.RefrenceNo)}
                            className="px-3 py-1 text-xs font-semibold text-blue-500 rounded-full hover:text-blue-700 bg-blue"
                          >
                            <FaCopy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border td-wrap-text">{row.PaymentDate}</td>
                    <td className="px-4 py-3 border td-wrap-text">{row.Remark}</td>
                    <td className="px-4 py-3 border td-wrap-text">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          row.Rf_Status === 'Approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {row.Rf_Status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {rowsToDisplay.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="p-1 mr-3 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                  <option value="1500">1500</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {startItem}-{endItem} of {rowsToDisplay.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
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
  </>
)}

    </div>
  )
}

export default DepositHistory