'use client'
import { useState, useEffect } from 'react'
import {
  getAccStatemtnt,
  getTransType,
  usernameLoginId,
} from '@/app/redux/slices/adminMasterSlice'
import { useDispatch, useSelector } from 'react-redux'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Search, FileSpreadsheet, RefreshCcw, Calendar, User, UserCircle2 } from 'lucide-react'
import { FaSearch, FaFileExcel, FaSyncAlt, FaWallet, FaMoneyBillWave, FaChartLine } from 'react-icons/fa'
import { RiUserSearchLine, RiRefreshLine, RiFileExcel2Line, RiWalletLine, RiBankCardLine } from "react-icons/ri"
import { toast } from 'react-toastify'

const Statement = () => {
  const dispatch = useDispatch()
  const accStatementData = useSelector(
    (state) => state.adminMaster?.accStatementData?.data,
  )
  const { usernameData } = useSelector((state) => state.adminMaster)
  const { transTypeError, transTypeLoading, transTypeData } = useSelector(
    (state) => state.adminMaster ?? [],
  )
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [transactionType, setTransactionType] = useState('')
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(500)
  const [currentPage, setCurrentPage] = useState(1)
  const [userError, setUserError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshLoading, setRefreshLoading] = useState(false)

  const indexOfLastItem = currentPage * entriesPerPage
  const indexOfFirstItem = indexOfLastItem - entriesPerPage
  const currentData = accStatementData?.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(accStatementData?.length / entriesPerPage)

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    return `${day}-${month}-${year}`
  }

  const totalCredit =
    hasSearched && accStatementData
      ? accStatementData.reduce((sum, txn) => sum + (txn.Credit || 0), 0)
      : 0

  const totalDebit =
    hasSearched && accStatementData
      ? accStatementData.reduce((sum, txn) => sum + (txn.Debit || 0), 0)
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

  const handleWalletChange = async (e) => {
    const value = e.target.value
    setSelectedWallet(value)
    setTransactionType('')

    if (value) {
      try {
        dispatch(getTransType(value))
      } catch (error) {
        console.log('API Error:', error)
      }
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    
    let wtypeValue = 0
    if (selectedWallet && selectedWallet !== '') {
      wtypeValue = parseInt(selectedWallet, 10)
    }
    
    const payload = {
      authLogin: userId || '',
      transtype: transactionType || '',
      fromDate: formatDate(fromDate) || '',
      toDate: formatDate(toDate) || '',
      wtype: wtypeValue
    }

    try {
      const resultAction = await dispatch(getAccStatemtnt(payload))

      if (getAccStatemtnt.fulfilled.match(resultAction)) {
        const res = resultAction.payload

        if (res?.statusCode !== 200) {
          toast.error(res?.message || 'Something went wrong!')
        } else {
          toast.success('Data fetched successfully!')
        }
      } else if (getAccStatemtnt.rejected.match(resultAction)) {
        toast.error(resultAction.payload || 'API Request Failed!')
      }
    } catch (err) {
      toast.error('Unexpected error occurred!')
    } finally {
      setLoading(false)
    }

    setHasSearched(true)
  }

  const handleExport = () => {
    if (!accStatementData || accStatementData.length === 0) {
      toast.error('No data available to export')
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(
      accStatementData.map((txn, index) => ({
        'Sr.No.': index + 1,
        Username: txn.AuthLogin,
        Name: txn.FullName,
        Credit: `$${txn.Credit}`,
        Debit: `$${txn.Debit}`,
        RequestedDate: txn.CreatedDate ? txn.CreatedDate.split('T')[0] : '',
        ApprovalDate: txn.ApprovalDate ? txn.ApprovalDate.split('T')[0] : '',
        email: txn.email,
        Remark: txn.Remark,
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
    toast.success('Export successful!')
  }

  const handleRefresh = async () => {
    setRefreshLoading(true)
    const payload = {
      authLogin: '',
      transtype: '',
      fromDate: '',
      toDate: '',
      wtype: null,
    }

    try {
      const resultAction = await dispatch(getAccStatemtnt(payload))

      if (getAccStatemtnt.fulfilled.match(resultAction)) {
        const res = resultAction.payload

        if (res?.statusCode !== 200) {
          toast.error(res?.message || 'Something went wrong!')
        } else {
          toast.success('Data refreshed successfully!')
        }
      } else if (getAccStatemtnt.rejected.match(resultAction)) {
        toast.error(resultAction.payload || 'API Request Failed!')
      }
    } catch (err) {
      toast.error('Unexpected error occurred!')
    } finally {
      setRefreshLoading(false)
      setFromDate('')
      setToDate('')
      setUserId('')
      setUsername('')
      setUserError('')
      setCurrentPage(1)
      setHasSearched(false)
      setSelectedWallet('')
      setTransactionType('')
    }
  }

  return (
    <div>
      <div>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
                <RiWalletLine className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Wallet Statement
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  View and manage all wallet transactions
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
        {hasSearched && accStatementData?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Credit</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">${Number(totalCredit).toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <FaMoneyBillWave className="text-white text-xl" />
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Debit</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">${Number(totalDebit).toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <FaChartLine className="text-white text-xl" />
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
            <p className="text-emerald-100 text-sm mt-1">Filter wallet transactions by date, wallet type, or user</p>
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

              {/* Wallet Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaWallet className="inline mr-2 text-emerald-500" />
                  Select Wallet
                </label>
                <select
                  value={selectedWallet}
                  onChange={handleWalletChange}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 cursor-pointer"
                >
                  <option value="">- Select Wallet -</option>
                  <option value="1">Income Wallet</option>
                  <option value="2">Deposit Wallet</option>
                  <option value="3">Trading Wallet</option>
                  <option value="4">Transaction Wallet</option>
                </select>
              </div>

              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <RiBankCardLine className="inline mr-2 text-emerald-500" />
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  disabled={!selectedWallet}
                  className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer
                    ${!selectedWallet
                      ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-500'
                      : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                >
                  <option value="">Select Transaction</option>
                  {transTypeLoading && <option disabled>Loading...</option>}
                  {!transTypeLoading &&
                    transTypeData?.incomeTransTypes?.map((data, index) => (
                      <option key={index} value={data?.transType}>
                        {data?.transType}
                      </option>
                    ))}
                </select>
                {transTypeError && (
                  <p className="text-red-500 text-xs mt-2">{transTypeError}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
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
                disabled={loading}
                className="group px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-md"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <FaSearch className="text-sm group-hover:scale-110 transition-transform" />
                    Search
                  </>
                )}
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

        {/* Transactions Table */}
        {hasSearched && accStatementData?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <RiBankCardLine className="text-emerald-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Found <span className="text-emerald-600 font-bold">{accStatementData?.length || 0}</span> transactions
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Credit: ${Number(totalCredit).toFixed(2)} | Debit: ${Number(totalDebit).toFixed(2)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Credit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Debit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Requested Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Approval Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {currentData?.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-medium text-gray-900 dark:text-white">
                        {transaction.AuthLogin}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {transaction.FullName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {transaction.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                        ${transaction.Credit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-red-600 dark:text-red-400">
                        ${transaction.Debit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {transaction.CreatedDate ? transaction.CreatedDate.split('T')[0] : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {transaction.ApprovalDate ? transaction.ApprovalDate.split('T')[0] : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={transaction.Remark}>
                        {transaction.Remark || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {accStatementData?.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value={10}>500</option>
                      <option value={25}>1000</option>
                      <option value={50}>1500</option>
                    </select>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min(indexOfLastItem, accStatementData.length)}</span> of{' '}
                    <span className="font-semibold">{accStatementData.length}</span> entries
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
        {hasSearched && (!accStatementData || accStatementData.length === 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <RiWalletLine className="text-3xl text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Statement