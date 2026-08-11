"use client";
import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  getAllTicketBYURID,
  getAdminReplyCount,
  updateAdminReplyCount,
} from "@/app/redux/slices/UserticketSlice";
import { getEncryptedLocalData } from "@/app/api/auth";
import TicketDetailModal from "./TicketDetailModal";
import ViewTicketModal from "../view-detail-modal/ViewTicketModal";

export default function TicketTable() {
  const dispatch = useDispatch();
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

 
  const { getAllTicketDataNew, adminReplyCounts } =
    useSelector((state) => state.userticket) || {};

  const ticketData = useMemo(
    () => getAllTicketDataNew || [],
    [getAllTicketDataNew]
  );

  useEffect(() => {
    if (!isLoaded ) {
      dispatch(getAllTicketBYURID());
      setIsLoaded(true);
    }
  }, [dispatch, isLoaded]);

  useEffect(() => {
    if ( ticketData.length > 0) {
      ticketData.forEach((ticket) => {
        if (ticket.StatusType === "Open") {
          dispatch(
            getAdminReplyCount({  ticketId: ticket.TicketId })
          );
        }
      });
    }
  }, [dispatch, ticketData]);

  useEffect(() => {
    if (adminReplyCounts) {
      const existingCounts = JSON.parse(
        localStorage.getItem("replyCounts") || "{}"
      );
      const updatedCounts = { ...existingCounts, ...adminReplyCounts };
      localStorage.setItem("replyCounts", JSON.stringify(updatedCounts));
    }
  }, [adminReplyCounts]);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row, idx) => idx + 1, {
        id: "sno",
        header: "S.No.",
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell: (info) => {
          const row = info.row.original;
          const storedCounts = JSON.parse(
            localStorage.getItem("replyCounts") || "{}"
          );
          const replyCount =
            storedCounts[row.TicketId]?.adminReplyCount?.[0]?.ReplyCount || 0;

          return (
            <div className="bt-action-cell">
              {row.StatusType === "Open" && (
                <div className="reply-wrapper">

                  <button
                    className="bt-btn-reply"
                    onClick={async () => {
                      setSelectedTicket(row);
                      setModalOpen(true);

                      await dispatch(
                        updateAdminReplyCount({
                          // urid: row.URID,
                          ticketId: row.TicketId,
                        })
                      );

                      const updatedCounts = JSON.parse(
                        localStorage.getItem("replyCounts") || "{}"
                      );

                      updatedCounts[row.TicketId] = {
                        adminReplyCount: [{ ReplyCount: 0 }],
                      };

                      localStorage.setItem(
                        "replyCounts",
                        JSON.stringify(updatedCounts)
                      );

                      dispatch(getAllTicketBYURID());
                    }}
                  >
                    Reply
                  </button>


                  {replyCount > 0 && (
                    <span className="bt-notification-badge">
                      {replyCount}
                    </span>
                  )}

                </div>
              )}
              {row.StatusType === "Closed" && (
                <button
                  className="bt-btn-view"
                  onClick={() => {
                    setSelectedTicket(row);
                    setViewModalOpen(true);
                  }}
                >
                  View Detail
                </button>
              )}

            </div>
          );
        },
      }),
      columnHelper.accessor("TicketType", {
        header: "Ticket Type",
        cell: (info) =>
          info.getValue() === "Payment" ? "User Transfer" : info.getValue(),
      }),
      columnHelper.accessor("StatusType", {
        header: "Status",
        cell: (info) => (
          <span className={info.getValue() === "Open" ? "bt-status-open" : "bt-status-closed"}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("Subject", {
        header: "Subject",
      }),
      columnHelper.accessor("CreatedDate", {
        header: "Time",
        cell: (info) => info.getValue() || "",
      }),
    ],
    []
  );

  const table = useReactTable({
    data: ticketData,
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <>
      <div className=" ">
        <div className="bt-ticket-card">
          <div className="bt-ticket-header">
            <div className="bt-ticket-header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                <line x1="8" y1="10" x2="16" y2="10" />
                <line x1="8" y1="14" x2="12" y2="14" />
              </svg>
            </div>
            <h1 className="bt-ticket-title">Support Tickets</h1>
          </div>

          <div className="bt-ticket-divider" />

          <div className="bt-ticket-content">
            {/* Controls */}
            <div className="bt-table-controls">
              <div className="bt-controls-left">
                <select
                  className="bt-select"
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size} entries
                    </option>
                  ))}
                </select>
              </div>

              <div className="bt-controls-right">
                <svg className="bt-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  className="bt-search-input"
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search tickets..."
                />
              </div>
            </div>

            {/* Table */}
            <div className="bt-table-wrapper">
              <table className="bt-table">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="bt-table-th">
                          {header.isPlaceholder ? null : (
                            <div className="bt-th-content">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="bt-table-row">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="bt-table-td">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="bt-empty-state">
                        <div className="bt-empty-message">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" />
                          </svg>
                          <p>No tickets found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bt-pagination">
              <div className="bt-pagination-info">
                {table.getFilteredRowModel().rows.length > 0
                  ? `Showing ${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to ${Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )} of ${table.getFilteredRowModel().rows.length} entries`
                  : "No entries"}
              </div>
              <div className="bt-pagination-controls">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="bt-pagination-btn"
                >
                  «
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="bt-pagination-btn"
                >
                  ‹
                </button>
                <span className="bt-pagination-page">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="bt-pagination-btn"
                >
                  ›
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="bt-pagination-btn"
                >
                  »
                </button>
              </div>
            </div>
          </div>
        </div>


        {modalOpen && selectedTicket && (
          <TicketDetailModal
            open={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedTicket(null);
            }}
            ticket={selectedTicket}
          />
        )}
        {viewModalOpen && selectedTicket && (
          <ViewTicketModal
            open={viewModalOpen}
            ticket={selectedTicket}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedTicket(null);
            }}
          />
        )}
      </div>
    </>
  );
}

