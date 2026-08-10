'use client'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllFundRequestReportAdmin,
  updateFundRequestStatusAdmin,
} from '@/app/redux/slices/fundManagerSlice'
import { usernameLoginId } from '@/app/redux/slices/adminMasterSlice'
import { toast } from 'react-toastify'
import { FaCopy } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Search, FileSpreadsheet, RefreshCcw } from 'lucide-react'
import { Calendar, User, UserCircle2,Wallet } from 'lucide-react'
import { FaSearch, FaFileExcel, FaSyncAlt } from 'react-icons/fa'

const DepositRequest = () => {
  const dispatch = useDispatch()
  const { fundRequestData, loading, error } = useSelector(
    (state) => state.fundManager,
  )
  const [approvePopupOpen, setApprovePopupOpen] = useState(false)
  const [rejectPopupOpen, setRejectPopupOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState({ authLoginId: null, id: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(500)
  const [remark, setRemark] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [userError, setUserError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [walletType, setWalletType] = useState('') 


  const formatDate = (dateString) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    return `${day}-${month}-${year}`
  }

  const totalRelease =
    hasSearched && fundRequestData?.unApproveFundRequest ? fundRequestData.unApproveFundRequest.reduce(
      (sum, txn) => sum + (Number(txn.Amount) || 0),
      0,
    )
      : 0

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

  const handleSearch = async () => {
    setSearchLoading(true)
    const payload = {
      authLogin: userId || '',
      fromDate: formatDate(fromDate) || '',
      toDate: formatDate(toDate) || '',
      walletType: walletType || ''
    }

    await dispatch(getAllFundRequestReportAdmin(payload))

    setHasSearched(true)
    setSearchLoading(false)
  }


  const handleExport = () => {
    if (
      !fundRequestData?.unApproveFundRequest ||
      fundRequestData?.unApproveFundRequest?.length === 0
    ) {
      alert('No data available to export')
      return
    }
    const worksheet = XLSX.utils.json_to_sheet(
      fundRequestData?.unApproveFundRequest?.map((txn, index) => ({
        'Sr.No.': index + 1,
        Username: txn.AuthLogin,
        Name: txn.Name,
        Email: txn.Email,
        Amount: `$${txn.Amount}`,
        PaymentMode: txn.PaymentMode,
        TransactionHash: txn.RefrenceNo,
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

  const handleRefresh = async () => {
    setRefreshLoading(true)

    setFromDate('')
    setToDate('')
    setUserId('')
    setUsername('')
    setUserError('')
     setWalletType('')
    setCurrentPage(1)
    setHasSearched(false)

    await dispatch(getAllFundRequestReportAdmin({
      authLogin: '',
      fromDate: '',
      toDate: '',
      walletType:''
    }))

    setRefreshLoading(false)
  }


  const unApprovedRows = fundRequestData?.unApproveFundRequest || []

  const filteredRows = unApprovedRows.filter(
    (row) =>
      row.AuthLogin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.Amount?.toString().includes(searchTerm) ||
      row.PaymentMode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.RefrenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.PaymentDate?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const rowsToDisplay = searchTerm ? filteredRows : unApprovedRows
  const paginatedRows = rowsToDisplay.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  )
  const totalPages = Math.ceil(rowsToDisplay.length / rowsPerPage)
  const startItem = (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, rowsToDisplay.length)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Fixed: Properly set selected request with both authLoginId and id
  const handleApproveClick = (authLoginId, id) => {
    setSelectedRequest({ authLoginId, id })
    setApprovePopupOpen(true)
  }

  // Fixed: Properly set selected request with both authLoginId and id
  const handleRejectClick = (authLoginId, id) => {
    setSelectedRequest({ authLoginId, id })
    setRejectPopupOpen(true)
  }

  // Fixed: Include id in the approve request
  const handleApprove = async () => {
    if (selectedRequest.authLoginId && selectedRequest.id) {
      try {
        await dispatch(
          updateFundRequestStatusAdmin({
            authLoginId: selectedRequest.authLoginId,
            id: selectedRequest.id, // Include the id
            rfstatus: 1,
            remark: 'Approved by admin',
          }),
        )
        setApprovePopupOpen(false)
        setSelectedRequest({ authLoginId: null, id: null })
        toast.success('Approved Successfully!', {
          position: 'top-right',
          autoClose: 3000,
        })
        dispatch(
          getAllFundRequestReportAdmin({
            authLogin: userId || '',
            fromDate: formatDate(fromDate) || '',
            toDate: formatDate(toDate) || '',
          }),
        )
      } catch (error) {
        toast.error('Failed to approve request', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    }
  }

  // Fixed: Include id in the reject request
  const handleReject = async () => {
    if (selectedRequest.authLoginId && selectedRequest.id && remark.trim()) {
      try {
        await dispatch(
          updateFundRequestStatusAdmin({
            authLoginId: selectedRequest.authLoginId,
            id: selectedRequest.id, // Include the id
            rfstatus: 2,
            remark: remark,
          }),
        )
        setRejectPopupOpen(false)
        setSelectedRequest({ authLoginId: null, id: null })
        setRemark('')
        toast.success('Rejected Successfully!', {
          position: 'top-right',
          autoClose: 3000,
        })
        dispatch(
          getAllFundRequestReportAdmin({
            authLogin: userId || '',
            fromDate: formatDate(fromDate) || '',
            toDate: formatDate(toDate) || '',
          }),
        )
      } catch (error) {
        toast.error('Failed to reject request', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } else {
      toast.error('Please enter a remark for rejection')
    }
  }

  const handleCancel = () => {
    setApprovePopupOpen(false)
    setRejectPopupOpen(false)
    setSelectedRequest({ authLoginId: null, id: null })
    setRemark('')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to Clipboard!', {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  return (
    <div className="p-8 mx-auto mt-0 mb-12 border border-blue-100 shadow-2xl max-w-7xl bg-gradient-to-b from-white via-blue-50 to-white rounded-3xl">
      <h6 className="heading">
        Fund Request:{' '}
        <span className="text-green-600">
          ${Number(totalRelease.toFixed(2))}
        </span>
      </h6>

      {/* Filters */}

      <div className="grid grid-cols-1 gap-6 mt-0 md:grid-cols-2 lg:grid-cols-4">
        {/* From Date */}
        <div className="relative">
          <label
            htmlFor="fromDate"
            className="block mb-1 text-sm font-semibold text-black"
          >
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute w-5 h-5 text-blue-500 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full py-3 pl-12 pr-4 transition bg-white border border-gray-300 rounded-lg shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* To Date */}
        <div className="relative">
          <label
            htmlFor="toDate"
            className="block mb-1 text-sm font-semibold text-black"
          >
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute w-5 h-5 text-blue-500 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full py-3 pl-12 pr-4 transition bg-white border border-gray-300 rounded-lg shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="relative">
          <label
            htmlFor="userId"
            className="block mb-1 text-sm font-semibold text-black"
          >
            User ID
          </label>
          <div className="relative">
            <User className="absolute w-5 h-5 text-blue-500 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              id="userId"
              className={`w-full pl-12 pr-4 py-3 rounded-lg border shadow-sm outline-none transition
        ${userError
                  ? 'border-red-500 focus:ring-red-400 focus:border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400'
                }`}
            />
          </div>
          {userError && (
            <p className="mt-1 text-sm text-red-500">{userError}</p>
          )}
        </div>

        {/* Username (read-only) */}
        <div className="relative">
          <label
            htmlFor="username"
            className="block mb-1 text-sm font-semibold text-black"
          >
            Username
          </label>
          <div className="relative">
            <UserCircle2 className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={username}
              readOnly
              id="username"
              className="w-full py-3 pl-12 pr-4 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg shadow-sm cursor-not-allowed"
            />
          </div>
        </div>

      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-start mt-3 space-x-4 col-span-full">
        <button
          onClick={handleSearch}
          disabled={searchLoading}
          className="flex items-center gap-2 px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 disabled:bg-blue-400"
        >
          {searchLoading ? (
            <FaSyncAlt className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          {searchLoading ? 'Searching...' : 'Search'}
        </button>


        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition bg-green-600 rounded-lg shadow hover:bg-green-700"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export Excel
        </button>

        <button
          onClick={handleRefresh}
          disabled={refreshLoading}
          className="flex items-center gap-2 px-5 py-2 text-white bg-gray-600 shadow rounded-xl hover:bg-gray-700 disabled:bg-gray-400"
        >
          {refreshLoading ? (
            <FaSyncAlt className="w-4 h-4 animate-spin" />
          ) : (
            <FaSyncAlt className="w-4 h-4" />
          )}
          {refreshLoading ? 'Refreshing...' : 'Refresh'}
        </button>

      </div>

      {/* Table */}
      {hasSearched && (
        <div className="mt-6 overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-2xl">
          {loading ? (
            <div className="py-10 text-center text-blue-600 animate-pulse">
              Loading...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-center text-gray-700 border-collapse">
                {/* Table Header */}
                <thead className="text-white bg-gradient-to-r from-blue-700 to-blue-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold tracking-wide uppercase border th-wrap-text">
                      #
                    </th>
                    <th className="px-4 py-3 font-semibold tracking-wide uppercase border th-wrap-text">
                      Approve
                    </th>
                    <th className="px-4 py-3 font-semibold tracking-wide uppercase border th-wrap-text">
                      User ID
                    </th>
                    <th className="px-4 py-3 font-semibold tracking-wide uppercase border th-wrap-text">
                      Name
                    </th>
                    <th className="px-4 py-3 font-semibold tracking-wide uppercase border th-wrap-text">
                      Email
                    </th>
                    <th className="px-4 py-3 font-semibold tracking-wide uppercase border th-wrap-text">
                      Amount ($)
                    </th>
                    <th className="px-4 py-3 font-semibold tracking-wide uppercase border th-wrap-text">
                      Request Type
                    </th>
                    <th className="px-4 py-3 font-semibold tracking-wide uppercase border th-wrap-text">
                      Payment Method
                    </th>
                    <th className="px-4 py-3 font-semibold tracking-wide uppercase border th-wrap-text">
                      Transaction Hash
                    </th>
                    <th className="px-4 py-3 font-semibold tracking-wide uppercase border th-wrap-text">
                      Date
                    </th>
                    <th className="px-4 py-3 font-semibold tracking-wide uppercase border th-wrap-text">
                      Reject
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-lg text-gray-400">
                        {searchTerm
                          ? 'No matching requests found'
                          : 'No Unapproved Requests Found'}
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors duration-200 ${idx % 2 === 0 ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-blue-50'}`}
                      >
                        <td className="px-4 py-3 font-semibold">
                          {startItem + idx}
                        </td>
                        <td>
                          <button
                            onClick={() => handleApproveClick(row.AuthLogin, row.Id || row.ID || row.id)}
                            className="px-3 py-1 text-xs font-semibold text-white transition-transform bg-green-500 rounded-lg shadow hover:bg-green-600 hover:scale-105"
                          >
                            Approve
                          </button>
                        </td>
                        <td className="px-2 py-2 border td-wrap-text">
                          {row.AuthLogin || '-'}
                        </td>
                        <td className="px-2 py-2 border td-wrap-text">
                          {row.Name || '-'}
                        </td>
                        <td className="px-2 py-2 border td-wrap-text">
                          {row.Email || '-'}
                        </td>
                        <td className="px-2 py-2 font-semibold text-green-600 border td-wrap-text">
                          ${row.Amount}
                        </td>
                        <td className="px-2 py-2 font-semibold border td-wrap-text">
                          {row.RequestType}
                        </td>
                        <td className="px-2 py-2 border td-wrap-text">
                          {row.PaymentMode}
                        </td>
                        <td className="px-2 py-2 border td-wrap-text">
                          <div className="flex items-center justify-center gap-1 ">
                            <span title={row.RefrenceNo || '-'}>
                              {row.RefrenceNo
                                ? `${row.RefrenceNo.substring(0, 10)}...`
                                : '-'}
                            </span>
                            {row.RefrenceNo && (
                              <button
                                onClick={() => copyToClipboard(row.RefrenceNo)}
                                className="p-1 text-blue-600 transition-transform hover:text-blue-800 hover:scale-110"
                              >
                                <FaCopy className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 border td-wrap-text">
                          {row.PaymentDate}
                        </td>
                        <td>
                          <button
                            onClick={() => handleRejectClick(row.AuthLogin, row.Id || row.ID || row.id)}
                            className="px-3 py-1 text-xs font-semibold text-white transition-transform bg-red-500 rounded-lg shadow hover:bg-red-600 hover:scale-105"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {rowsToDisplay.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="p-1 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400"
                >
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                  <option value="1500">1500</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {startItem}-{endItem} of {rowsToDisplay.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg border transition-colors ${currentPage === 1 ? 'text-gray-400 border-gray-200' : 'text-blue-600 border-gray-300 hover:bg-blue-50'}`}
                >
                  ‹
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg border transition-colors ${currentPage === totalPages ? 'text-gray-400 border-gray-200' : 'text-blue-600 border-gray-300 hover:bg-blue-50'}`}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approve Modal */}
      {approvePopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl animate-fadeIn">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Approve request for{' '}
              <span className="text-blue-600">{selectedRequest.authLoginId}</span>?
            </h2>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleApprove}
                className="px-4 py-2 text-white transition-transform bg-green-600 rounded-lg hover:bg-green-700 hover:scale-105"
              >
                Yes
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl animate-fadeIn">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Reject request for{' '}
              <span className="text-blue-600">{selectedRequest.authLoginId}</span>?
            </h2>
            <textarea
              className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-red-400"
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={handleReject}
                disabled={!remark.trim()}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${!remark.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:scale-105 transition-transform'}`}
              >
                Submit
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepositRequest