'use client'
import React, { useState, useEffect } from 'react'
import ImagePopup from '../(main)/admin/image-popup/page'
import Link from 'next/link'
import Loading from '@/app/common/loading'
import { MdEdit, MdDelete } from 'react-icons/md'
import { FiSearch } from 'react-icons/fi'

const Table = ({
  columns,
  data,
  onEdit,
  onDelete,
  onAddImage,
  loading,
  title,
  isUserNameClickable,
  onRowClick,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, order: 'asc' })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortedData, setSortedData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  useEffect(() => {
    setSortedData(Array.isArray(data) ? data : [])
  }, [data])

  const sortData = (key) => {
    const order =
      sortConfig.key === key && sortConfig.order === 'asc' ? 'desc' : 'asc'
    const sorted = [...data].sort((a, b) => {
      const aValue = a[key]?.toString().toLowerCase() || ''
      const bValue = b[key]?.toString().toLowerCase() || ''
      return order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })
    setSortedData(sorted)
    setSortConfig({ key, order })
  }

  const filteredData =
    sortedData?.filter((row) =>
      columns?.some((col) =>
        row[col.key]
          ?.toString()
          .toLowerCase()
          .includes(searchTerm?.toLowerCase() || '')
      )
    ) || []

  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow)
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)

  if (loading) return <Loading />

  return (
    <div className="p-4 rounded-md shadow-custom-1">
      <div className="flex flex-col items-center justify-between mb-4 sm:flex-row">
        <div className="w-full mb-2 sm:w-auto sm:mb-0">
          {title && (
            <h2 className="text-xl font-semibold text-center text-gray-800 sm:text-left">
              {title}
            </h2>
          )}
        </div>
        <div className="flex">
          <div className="relative">
            <FiSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border rounded-l-md sm:w-64 border-customBlue focus:outline-none focus:border-customBlue"
            />
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
   <div className="hidden overflow-x-auto sm:block tabel">
  {!filteredData.length ? (
    <div className="py-10 text-lg text-center text-black border rounded-md">
      No Data found!
    </div>
  ) : (
    <>
      <table className="min-w-full overflow-hidden border border-gray-200 shadow-lg rounded-xl">
        <thead>
          <tr className="bg-blue-600">
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-center text-white border border-gray-200">
                Actions
              </th>
            )}
            {columns?.map((col) => (
              <th
                key={col.key}
                onClick={() => sortData(col.key)}
                className="px-6 py-3 text-sm font-semibold tracking-wide text-center text-white uppercase border border-gray-200 cursor-pointer hover:bg-blue-700"
              >
                <div className="flex items-center justify-center">
                  {col.label}
                  {sortConfig.key === col.key && (
                    <span className="ml-2">
                      {sortConfig.order === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row, idx) => (
            <tr
              key={row.id || row.ticketId || idx}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`${
                onRowClick ? 'cursor-pointer hover:bg-blue-50' : ''
              } odd:bg-white even:bg-gray-50`}
            >
              {(onEdit || onDelete || onAddImage) && (
                <td className="px-6 py-4 text-center border border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full hover:bg-green-600"
                        title="Edit"
                      >
                        <MdEdit size={18} className="text-white" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => row.active && onDelete(row)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          row.active
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                        disabled={!row.active}
                        title="Delete"
                      >
                        <MdDelete size={18} className="text-white" />
                      </button>
                    )}
                    {onAddImage && (
                      <button
                        onClick={() => onAddImage(row)}
                        className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                      >
                        Add Image
                      </button>
                    )}
                  </div>
                </td>
              )}
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-6 py-4 text-sm text-center border border-gray-200"
                >
                  {renderCell(col, row, idx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalRows={filteredData.length}
          setRowsPerPage={setRowsPerPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  )}
</div>


      {/* Mobile Card View */}
      <div className="space-y-4 sm:hidden">
        {currentRows.length === 0 ? (
          <div className="py-10 text-lg text-center text-black border rounded-md">
            No Data found!
          </div>
        ) : (
          currentRows.map((row, index) => (
            <div
              key={index}
              className="p-4 bg-white border rounded-md shadow-md"
            >
              {columns.map((col) => (
                <div key={col.key} className="mb-2">
                  <span className="font-semibold text-gray-600">
                    {col.label}:
                  </span>{' '}
                  <span className="text-gray-800">{renderCell(col, row, index)}</span>
                </div>
              ))}
              {(onEdit || onDelete || onAddImage) && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="flex items-center justify-center p-2 text-white rounded-md bg-edit-btn hover:bg-yellow-600"
                      title="Edit"
                    >
                      <MdEdit size={20} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => row.active && onDelete(row)}
                      className={`p-2 ml-2 rounded-md ${row.active ? 'bg-red-500 hover:bg-delete-btn text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} flex items-center justify-center`}
                      disabled={!row.active}
                      title="Delete"
                    >
                      <MdDelete size={20} />
                    </button>
                  )}
                  {onAddImage && (
                    <button
                      onClick={() => onAddImage(row)}
                      className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                    >
                      Add Image
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <Pagination
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalRows={filteredData.length}
          setRowsPerPage={setRowsPerPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  )
}

const renderCell = (col, row, idx) => {
  const renderCategoryName = (value) => {
    if (!value) return '';
    return (
      <div className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap" title={value}>
        {value}
      </div>
    );
  };

  const value = row[col.key];
  
  if (col.key === 'S No') {
    return idx + 1;
  }
  if (col.key === 'name') {
    return renderCategoryName(value);
  }
  if (col.key === 'image') {
    if (value) {
      return <ImagePopup src={value} alt="Image" />
    } else {
      return <span className="text-gray-400">No Image</span>
    }
  }
  if (col.key === 'username') {
    return (
      <Link
        href={`/pages/customer-management/customer-order-activity?username=${value}`}
        className="text-blue-500 hover:underline"
      >
        {value}
      </Link>
    )
  }
  if (col.key === 'orderNo') {
    return (
      <Link
        href={`/pages/order-management/order-details?orderId=${value}`}
        className="text-green-500 hover:underline"
      >
        {value}
      </Link>
    )
  }
  if (col.key === 'password') {
    const passValue = value || '';
    const passString = typeof passValue === 'string' ? passValue : String(passValue);
    
    return (
      <div className="relative flex items-center justify-center w-full h-full group">
        <span className="absolute transition-opacity duration-200 opacity-0 group-hover:opacity-100">
          {passString}
        </span>
        <span className="transition-opacity duration-200 opacity-100 group-hover:opacity-0">
          {'*'.repeat(passString.length)}
        </span>
      </div>
    )
  }
  if (col.key === 'Status') {
    const statusValue = value || '';
    const statusString = typeof statusValue === 'string' ? statusValue : String(statusValue);
    
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          statusString.toLowerCase() === 'closed'
            ? 'bg-red-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        {statusString}
      </span>
    ) 
  }
  if (col.render) return col.render(value, row)
  
  return value !== null && value !== undefined ? String(value) : '';
}

const Pagination = ({
  currentPage,
  rowsPerPage,
  totalRows,
  setRowsPerPage,
  setCurrentPage,
}) => {
  const totalPages = Math.ceil(totalRows / rowsPerPage)
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage + 1
  const indexOfLastRow =
    currentPage * rowsPerPage > totalRows
      ? totalRows
      : currentPage * rowsPerPage

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
      <div className="flex items-center space-x-2">
        <span>Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value))
            setCurrentPage(1)
          }}
          className="p-1 border rounded-md focus:outline-none"
        >
          {[5, 10, 25].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div>
        <span>
          {indexOfFirstRow} - {indexOfLastRow} of {totalRows}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 border rounded-md ${
            currentPage === 1
              ? 'text-gray-400 border-gray-300'
              : 'hover:bg-gray-200'
          }`}
        >
          ◄
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 border rounded-md ${
            currentPage === totalPages
              ? 'text-gray-400 border-gray-300'
              : 'hover:bg-gray-200'
          }`}
        >
          ►
        </button>
      </div>
    </div>
  )
}

export default Table