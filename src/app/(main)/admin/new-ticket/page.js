'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllTickets,
  addTicketReply,
  getAllTicketByTicketId,
  deleteTicket,
  clearTicketDetails,
  fetchUserReplyCount,
  updateUserReplyCount,
} from '@/app/redux/slices/ticketSlice'
import Table from '@/app/common/datatable'
import { Columns } from '@/app/redux/slices/ticketSlice'
import { toast } from 'react-toastify'
import { FaReply, FaTimes, FaPaperPlane, FaCheckCircle, FaExclamationCircle, FaUser, FaCalendarAlt, FaTag, FaHeading } from 'react-icons/fa'
import { RiTicketLine, RiMessageLine, RiCloseCircleLine } from "react-icons/ri"

const NewTicket = () => {
  const dispatch = useDispatch()
  const { tickets, error, ticketDetails, userReplyCount } = useSelector((state) => state.ticket)

  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyImage, setReplyImage] = useState(null)
  const [replyLoading, setReplyLoading] = useState(false)
  const [replySuccess, setReplySuccess] = useState('')
  const [replyError, setReplyError] = useState('')
  const [lastReply, setLastReply] = useState(null)
  const [closeLoading, setCloseLoading] = useState(false)
  const [closeError, setCloseError] = useState('')
  const [closeSuccess, setCloseSuccess] = useState('')
  const [showPopup, setShowPopup] = useState(false)

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

  useEffect(() => {
    const didFetch = window.__didFetchTickets
    if (didFetch) return
    window.__didFetchTickets = true
    dispatch(fetchAllTickets()).unwrap()
  }, [dispatch])

  useEffect(() => {
    if (tickets && tickets.length > 0) {
      const openTickets = tickets.filter(ticket => ticket.Status === 1)
      openTickets.forEach(ticket => {
        dispatch(fetchUserReplyCount({ URID: ticket.URID, TicketId: ticket.TicketId }))
      })
    }
  }, [tickets, dispatch])

  useEffect(() => {
    setShowReplyBox(false)
    setLastReply(null)
    setReplyMessage('')
    setReplyImage(null)
    setReplySuccess('')
    setReplyError('')
  }, [ticketDetails])

  const tableColumns = Columns.map((col) => {
    if (col.id === 'Status') {
      return {
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
    } else if (col.id === 'action') {
      return {
        key: col.id,
        label: col.label,
        render: (value, row) =>
          row.Status === 1 ? (
            <div className="relative">
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation() 
                  dispatch(updateUserReplyCount({ TicketId: row.TicketId }))
                  dispatch(getAllTicketByTicketId(row.TicketId))
                  setShowPopup(true)
                }}
              >
                <FaReply className="text-xs" />
                Reply
              </button>
              {userReplyCount[row.TicketId] > 0 && (
                <span className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-2 -right-2 ring-2 ring-white dark:ring-gray-800">
                  {userReplyCount[row.TicketId]}
                </span>
              )}
            </div>
          ) : null,
      }
    } else {
      return {
        key: col.id,
        label: col.label,
        render: (value) => (
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            {value || '-'}
          </span>
        ),
      }
    }
  })

  const handleRowClick = (row) => {
    dispatch(getAllTicketByTicketId(row.TicketId)).unwrap()
  }

  const replies = ticketDetails?.replies || []

  const handleReplySubmit = async (ticket) => {
    if (!replyMessage.trim()) {
      setReplyError('Message is required')
      toast.error('Message is required')
      return
    }
    setReplyError('')
    setReplySuccess('')
    setReplyLoading(true)
    try {
      const formData = new FormData()
      formData.append('TicketId', ticket.TicketId)
      formData.append('Message', replyMessage)
      formData.append('CreatedBy', ticket.TicketId)
      formData.append('Status', 0) 
      formData.append('Seen', 0)
      formData.append('ImagePath', ticket.ImagePath)

      const result = await dispatch(addTicketReply(formData)).unwrap()
      if (result?.statusCode === 200) {
        await dispatch(getAllTicketByTicketId(ticket.TicketId))
        await dispatch(fetchAllTickets())
        setReplyMessage('')
        setReplyImage(null)
        setShowReplyBox(false)
        toast.success('Reply sent successfully!')
      } else {
        toast.error('Failed to send reply')
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to send reply')
    } finally {
      setReplyLoading(false)
    }
  }

  const handleCloseTicket = async (ticket) => {
    if (!ticket) return
    setCloseLoading(true)
    setCloseError('')
    setCloseSuccess('')
    try {
      const result = await dispatch(deleteTicket(ticket.TicketId)).unwrap()
      if (result && result.statusCode === 200) {
        setCloseSuccess('Ticket closed successfully!')
        await dispatch(fetchAllTickets())
        toast.success('Ticket closed successfully!')
        setShowPopup(false)
        dispatch(clearTicketDetails())
      } else {
        setCloseError('Failed to close ticket.')
        toast.error('Failed to close ticket.')
      }
    } catch (err) {
      setCloseError(err?.message || 'Failed to close ticket.')
      toast.error(err?.message || 'Failed to close ticket.')
    } finally {
      setCloseLoading(false)
    }
  }

  const allMessages = [
    ...(ticketDetails?.replies?.length
      ? ticketDetails?.replies.map((item, index) => ({
          id: index,
          message: item.Message,
          timestamp: formatDate(item.ReplyDate),
          Name: item.Name,
          Status: item.Status,
          user: item.appUserId ? 'User' : 'Admin',
        }))
      : []),
    ...replies,
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

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
                Ticket Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Manage and respond to customer support tickets
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RiMessageLine className="text-xl" />
              Open Tickets
            </h2>
            <p className="text-emerald-100 text-sm mt-1">View and respond to customer support requests</p>
          </div>

          <div className="p-6">
            <Table
              columns={tableColumns}
              data={tickets
                ?.filter((ticket) => ticket.Status === 1)
                .map((ticket, index) => ({
                  ...ticket,
                  sno: index + 1,
                  image: ticket.ImagePath,
                }))}
              title="Tickets List"
              onRowClick={handleRowClick}
            />
          </div>
        </div>

        {/* Ticket Details Popup */}
  {showPopup &&
  ticketDetails?.ticket &&
  ticketDetails.ticket.map((ticket, index) => (
   
    <div
      key={index}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col h-[95vh] max-h-[95vh] animate-in zoom-in-95 duration-200 overflow-hidden"
      >

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <RiTicketLine className="text-xl" />
            Ticket Details
          </h2>

          <button
            onClick={() => {
              dispatch(clearTicketDetails())
              setShowPopup(false)
            }}
            className="text-white/80 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Ticket Info - Reduced Height */}
        <div className="flex-shrink-0 p-3 space-y-3 max-h-[25vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FaUser className="text-emerald-500"/>
                User ID
              </p>
              <p className="text-sm font-semibold mt-0.5 text-gray-400">
                {ticket.UserID || "-"}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FaCalendarAlt className="text-emerald-500"/>
                Date
              </p>
              <p className="text-sm font-semibold mt-0.5 text-gray-400">
                {formatDate(ticket.CreatedDate)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
              <p className="text-xs text-gray-500">
                Name
              </p>
              <p className="text-sm font-semibold mt-0.5 text-gray-400">
                {ticket.UserName || "-"}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
              <p className="text-xs text-gray-500">
                Type
              </p>
              <p className="text-sm font-semibold mt-0.5 text-gray-400">
                {ticket.TicketType || "-"}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
              <p className="text-xs text-gray-500">
                Subject
              </p>
              <p className="text-sm font-semibold mt-0.5 text-gray-400">
                {ticket.Subject || "-"}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
              <p className="text-xs text-gray-500">
                Status
              </p>
              <p className="text-sm font-semibold mt-0.5 text-gray-400">
                {ticket.StatusType || "-"}
              </p>
            </div>

            <div className="col-span-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
              <p className="text-xs text-gray-500">
                Image
              </p>
              {ticket.ImagePath ? (
                <img
                  src={ticket.ImagePath}
                  alt="Ticket"
                  className="
                    mt-1.5
                    w-14
                    h-14
                    object-cover
                    rounded-md
                    border
                    cursor-pointer
                  "
                  onClick={() =>
                    window.open(ticket.ImagePath,"_blank")
                  }
                />
              ) : (
                <p className="text-sm font-semibold">
                  -
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Conversation - Maximum Height */}
        <div className="flex flex-col flex-1 min-h-[300px] px-5 pb-2 overflow-hidden">
          <h3 className="text-sm font-semibold mb-2 flex items-center text-gray-700 gap-2 flex-shrink-0">
            <RiMessageLine className="text-emerald-500"/>
            Conversation
          </h3>

          <div
            className="
              flex-1
              min-h-[250px]
              max-h-[500px]
              overflow-y-auto
              space-y-3
              p-3
              bg-gray-100
              dark:bg-gray-900/50
              rounded-xl
              scrollbar-thin
              scrollbar-thumb-gray-400
            "
          >
            {allMessages
              ?.filter(
                msg =>
                msg &&
                msg.message &&
                msg.message.trim() !== ''
              )
              .map((message, index) => {
                const admin = message.Status === 0;

                return (
                  <div
                    key={message.id || index}
                    className={`flex w-full ${
                      admin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                        max-w-[85%]
                        p-3
                        rounded-xl
                        text-sm
                        ${
                          admin
                          ?
                          "bg-emerald-500 text-white rounded-br-none"
                          :
                          "bg-white dark:bg-gray-800 rounded-bl-none shadow border"
                        }
                      `}
                    >
                      {!admin && (
                        <p className="text-xs font-semibold text-emerald-600 mb-1">
                          {message.Name || "User"}
                        </p>
                      )}

                      <div
                        dangerouslySetInnerHTML={{
                          __html: message.message
                        }}
                      />

                      {message.ImagePath && (
                        <img
                          src={message.ImagePath}
                          className="mt-2 w-28 h-28 object-cover rounded-lg border"
                          alt="Message attachment"
                        />
                      )}

                      <span className="text-xs  opacity-70 block mt-2">
                        {message.timestamp || ""}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Reply Section - Always Visible */}
        <div
          className="
            flex-shrink-0
            p-3
            bg-white
            dark:bg-gray-900/50
            border-t
            border-gray-200
            dark:border-gray-700
            mt-auto
          "
        >
          <textarea
            value={replyMessage}
            onChange={(e) =>
              setReplyMessage(e.target.value)
            }
            rows={2}
            placeholder="Type your reply..."
            className="
              w-full
              p-3
              rounded-xl
              resize-none
              outline-none
              border-0
              bg-gray-100
              dark:bg-gray-800
              text-sm
              text-gray-900
              dark:text-white
              placeholder-gray-400
              focus:ring-2
              focus:ring-emerald-500/40
              transition-all
            "
          />

          <div className="flex justify-end gap-2 mt-3">
            {/* Send Reply */}
            <button
              onClick={() => handleReplySubmit(ticket)}
              disabled={replyLoading}
              className="
                inline-flex
                items-center
                gap-1.5
                px-4
                py-2
                text-sm
                font-medium
                rounded-lg
                text-white
                bg-gradient-to-r
                from-emerald-600
                to-teal-600
                hover:from-emerald-700
                hover:to-teal-700
                transition-all
                shadow-sm
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {
                replyLoading
                ?
                "Sending..."
                :
                <>
                  <FaPaperPlane className="text-xs"/>
                  Send Reply
                </>
              }
            </button>

            {/* Close Ticket */}
            <button
              onClick={() => handleCloseTicket(ticket)}
              disabled={closeLoading}
              className="
                inline-flex
                items-center
                gap-1.5
                px-4
                py-2
                text-sm
                font-medium
                rounded-lg
                text-white
                bg-gradient-to-r
                from-red-600
                to-rose-600
                hover:from-red-700
                hover:to-rose-700
                transition-all
                shadow-sm
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {
                closeLoading
                ?
                "Closing..."
                :
                <>
                  <RiCloseCircleLine className="text-sm"/>
                  Close Ticket
                </>
              }
            </button>
          </div>

          {closeError && (
            <div className="flex items-center gap-1 text-xs text-red-500 mt-2">
              <FaExclamationCircle/>
              {closeError}
            </div>
          )}

          {closeSuccess && (
            <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
              <FaCheckCircle/>
              {closeSuccess}
            </div>
          )}
        </div>

      </div>
    </div>
  ))
}
      </div>
    </div>
  )
}

export default NewTicket