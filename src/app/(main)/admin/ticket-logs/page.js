'use client'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchClosedTickets,
  getAllTicketByTicketId,
  clearTicketDetails,
} from '@/app/redux/slices/ticketSlice'
import Table from '@/app/common/datatable'
import { Columns } from '@/app/redux/slices/ticketSlice'
import { FaTimes, FaEye, FaUser, FaCalendarAlt, FaTag, FaHeading, FaImage } from 'react-icons/fa'
import { RiTicketLine, RiMessageLine, RiCloseCircleLine } from "react-icons/ri"

const TicketLogs = () => {
  const dispatch = useDispatch()
  const { closedTickets, ticketDetails } = useSelector((state) => state.ticket)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    const didFetch = window.__didFetchTicketsLogs
    if (didFetch) return
    window.__didFetchTicketsLogs = true
    dispatch(fetchClosedTickets())
  }, [dispatch])

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return dateString
    }
  }

  const tableColumns = Columns?.map((col) =>
    col.id === 'Status'
      ? {
          key: col.id,
          label: col.label,
          render: (value) => (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                value === 1
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${value === 1 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {value === 1 ? 'Open' : 'Closed'}
            </span>
          ),
        }
      : col.id === 'CreatedDate'
        ? {
            key: col.id,
            label: col.label,
            render: (value) => (
              <span className="text-gray-700 dark:text-gray-300">
                {formatDate(value)}
              </span>
            ),
          }
        : col.id === 'action'
          ? {
              key: col.id,
              label: col.label,
              render: (value, row) => (
                <button
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    dispatch(getAllTicketByTicketId(row.TicketId))
                    setShowPopup(true)
                  }}
                >
                  <FaEye className="text-xs" />
                  Details
                </button>
              ),
            }
          : { 
              key: col.id, 
              label: col.label,
              render: (value) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {value || '-'}
                </span>
              ),
            },
  )

  const handleRowClick = (row) => {
    dispatch(getAllTicketByTicketId(row.TicketId))
  }

  const replies = ticketDetails?.replies || []

  return (
    <div>
      <div>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
              <RiTicketLine className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Ticket Logs
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                View closed and completed support tickets
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RiMessageLine className="text-xl" />
              Closed Tickets
            </h2>
            <p className="text-emerald-100 text-sm mt-1">View history of resolved and closed tickets</p>
          </div>

          <div className="p-6">
            <Table
              columns={tableColumns}
              data={closedTickets?.map((ticket, index) => ({
                ...ticket,
                sno: index + 1,
              }))}
              title="Closed Tickets List"
              onRowClick={handleRowClick}
            />
          </div>
        </div>

        {/* Ticket Details Popup */}
        {showPopup &&
          ticketDetails?.ticket &&
          ticketDetails?.ticket?.map((ticket, index) => (
            <div
              key={index}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            >
              <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <RiTicketLine className="text-xl" />
                    Ticket Details
                  </h2>
                  <button
                    className="text-white/80 hover:text-white transition-colors"
                    onClick={() => {
                      dispatch(clearTicketDetails())
                      setShowPopup(false)
                    }}
                    aria-label="Close Ticket Details"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-5 py-4 overflow-y-auto flex-1">
                  {/* Ticket Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaUser className="text-emerald-500" />
                        User ID
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 break-all">
                        {ticket.UserID || '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaUser className="text-emerald-500" />
                        Name
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 break-all">
                        {ticket.UserName || '-'}
                      </p>
                    </div>
                    <div className="col-span-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaHeading className="text-emerald-500" />
                        Subject
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 break-all">
                        {ticket.Subject || '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaTag className="text-emerald-500" />
                        Type
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {ticket.TicketType || 'General'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaCalendarAlt className="text-emerald-500" />
                        Date
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {formatDate(ticket.CreatedDate)}
                      </p>
                    </div>
                    <div className="col-span-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <p className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${
                        ticket.StatusType?.toLowerCase() === 'open'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          ticket.StatusType?.toLowerCase() === 'open'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}></span>
                        {ticket.StatusType || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Image */}
                  {ticket.ImagePath && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                        <FaImage className="text-emerald-500" />
                        Attachment
                      </p>
                      <img
                        src={ticket.ImagePath}
                        alt="Ticket"
                        className="object-cover w-20 h-20 rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}

                  {/* Conversation */}
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <RiMessageLine className="text-emerald-500" />
                      Conversation
                    </h3>
                    <div className="bg-gray-100 dark:bg-gray-900/50 rounded-xl p-3 max-h-60 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                      {replies?.length > 0 ? (
                        replies.map((reply, idx) =>
                          reply.Status === 1 ? (
                            // User Reply
                            <div key={idx} className="flex justify-start">
                              <div className="max-w-[85%] bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-md shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                                  User
                                </div>
                                <div
                                  className="text-sm text-gray-800 dark:text-gray-200"
                                  dangerouslySetInnerHTML={{
                                    __html: reply.Message,
                                  }}
                                />
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                  {formatDate(reply.ReplyDate)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Admin Reply
                            <div key={idx} className="flex justify-end">
                              <div className="max-w-[85%] bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-2xl rounded-tr-md shadow-sm">
                                <div
                                  className="text-sm text-white"
                                  dangerouslySetInnerHTML={{
                                    __html: reply.Message,
                                  }}
                                />
                                <div className="text-[10px] text-emerald-100 mt-1 text-right">
                                  {formatDate(reply.ReplyDate)}
                                </div>
                              </div>
                            </div>
                          ),
                        )
                      ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                          No conversation found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default TicketLogs