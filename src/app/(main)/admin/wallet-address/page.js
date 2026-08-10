'use client'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  generateWalletAddress,
  getAllWalletAddress,
} from '@/app/redux/slices/adminMasterSlice'
import Spinner from '@/app/common/spinner'

const WalletAddress = () => {
  const [quantity, setQuantity] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const dispatch = useDispatch()
  const { walletAddressData, allWalletData, loading, error } = useSelector(
    (state) => state.adminMaster,
  )

  useEffect(() => {
    dispatch(getAllWalletAddress())
  }, [dispatch])

  const handleGenerate = async () => {
    const result = await dispatch(
      generateWalletAddress({ quantity: Number(quantity) }),
    )
    if (result?.payload?.status === 'Succeed') {
      toast.success('Generate Wallet Address Successful')
      setQuantity(0)
      dispatch(getAllWalletAddress())
    } else {
      toast.error(result?.payload?.message || 'Failed to add wallet address')
    }
  }

  // Table data
  const tableData = Array.isArray(allWalletData?.data)
    ? allWalletData.data.map((item, idx) => ({
        srNo: idx + 1,
        walletAddress: item.walletAddress,
        status: item.status,
        usedByLoginId: item.authlogin || '',
        usedByName: item.name || '',
      }))
    : []

  const paginatedData = tableData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  )
  const totalPages = Math.ceil(tableData.length / rowsPerPage)
  const startItem = (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, tableData.length)

  return (
    <div className="max-w-6xl p-5 mx-auto mt-0mb-10 bg-white border border-blue-100 shadow-2xl rounded-2xl">
      <h6 class="heading">Manage User Wallet Address</h6>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          handleGenerate()
        }}
      >
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => {
              const val = e.target.value
              if (val === '' || (/^\d+$/.test(val) && Number(val) > 0)) {
                setQuantity(val)
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Enter Quantity"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 font-semibold text-white transition-all duration-200 rounded-lg shadow bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? <div className="flex items-center justify-center">
              <Spinner />
              <span className="ml-2">Generating...</span>
            </div>: 'Generate Address'}
        </button>
      </form>
      {error && (
         <div className="mt-4 text-center text-red-600">{error.toString()}</div>
      )}

       <div className="mt-6 overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-center text-gray-700 border-collapse">
              {/* Table Header */}
              <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
              <tr>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase th-wrap-text border">S. No.</th>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase th-wrap-text border">Wallet Address</th>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase th-wrap-text border">Status</th>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase th-wrap-text border">
                  UsedBy(LoginId)
                </th>
                <th className="px-4 py-3 font-semibold tracking-wide uppercase th-wrap-text border">UsedBy(Name)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-lg text-center text-gray-400"
                  >
                    No Data Found
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={row.srNo}
                    className={
                      idx % 2 === 0
                        ? 'bg-blue-50 hover:bg-blue-100 transition'
                        : 'bg-white hover:bg-blue-50 transition'
                    }
                  >
                    <td className="px-2 py-2 td-wrap-text border">
                      {startItem + idx}
                    </td>
                    <td className="px-2 py-2 td-wrap-text border">
                      {row.walletAddress}
                    </td>
                    <td className="px-2 py-2 td-wrap-text border">
                      {row.status}
                    </td>
                    <td className="px-2 py-2 td-wrap-text border">
                      {row.usedByLoginId}
                    </td>
                    <td className="px-2 py-2 td-wrap-text border">
                      {row.usedByName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {tableData.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="p-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {startItem}-{endItem} of {tableData.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`p-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
export default WalletAddress