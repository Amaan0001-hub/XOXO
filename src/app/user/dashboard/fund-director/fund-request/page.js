"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { FundRequestColumns, currencies } from "@/app/constants/funddirector.js";
import { Copy } from "lucide-react";
import { IoMdArrowBack } from "react-icons/io";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useDispatch } from "react-redux";
import {
  addFundRequest,
  getFundRequestReport,
} from "@/app/redux/slices/fundManagerSlice";
import toast from "react-hot-toast";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { getUserId } from "@/app/api/auth";
import QRCode from "react-qr-code";

export default function FundRequest() {
  const dispatch = useDispatch();
  const [globalFilter, setGlobalFilter] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [urid, setUrid] = useState("");
  const [formStep, setFormStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const { getFundRequestReportData } = useSelector((state) => state.fund);
  const [copiedRowId, setCopiedRowId] = useState(null);

  const handleCopy = (value, rowId) => {
    try {
      navigator.clipboard
        .writeText(value)
        .then(() => {
          toast.success("Copied to clipboard!");
          setCopiedRowId(rowId);
          setTimeout(() => setCopiedRowId(null), 1000);
        })
        .catch(() => {
          toast.error("Failed to copy!");
        });
    } catch (err) {
      toast.error("Copy not supported!");
    }
  };

  const data = useMemo(() => {
    if (!getFundRequestReportData?.fundRequests) return [];
    return getFundRequestReportData.fundRequests.map((item, idx) => ({
      id: idx + 1,
      rf_Status: item.Rf_Status,
      amount: `$${item.Amount}`,
      date: item.PaymentDate,
      adminRemark: item.AdminRemark,
      transactionHash: item.RefrenceNo,
      mode: currencies.find((c) => c.name === item.PaymentMode)?.name || "",
    }));
  }, [getFundRequestReportData]);

  const columns = useMemo(() => FundRequestColumns, []);

  const initialValues = {
    paymentMode: "",
    amount: "",
    transactionHash: "",
    remark: "",
  };

  const validationSchema = Yup.object({
    paymentMode: Yup.string().required("Payment mode is required"),
    amount: Yup.string()
      .required("Amount is required")
      .matches(
        /^(?:\d{1,7})(?:\.\d{1,4})?$/,
        "Please enter a valid amount. Only up to 7 digits before and 4 digits after decimal are allowed."
      ),
    transactionHash: Yup.string()
      .required("Transaction hash is required")
      .test(
        "hashcode-length",
        "Please Enter a Valid Hash Code",
        function (value) {
          return value && value.length >= 38 && value.length <= 70;
        }
      ),
    remark: Yup.string(),
  });

  useEffect(() => {
    const urid = getUserId();
    setUrid(urid);
    dispatch(getFundRequestReport());
  }, [dispatch]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handlePaymentModeChange = (setFieldValue, value) => {
    setFieldValue("paymentMode", value);
  };

  const handleFormikSubmit = async (
    values,
    { setSubmitting, resetForm, setErrors }
  ) => {
    if (!selectedCurrency) {
      toast.error("Please select a payment mode");
      setSubmitting(false);
      return;
    }

    const data = {
      urid: urid,
      paymentMode: selectedCurrency.name,
      amount: values.amount,
      refrenceNo: values.transactionHash,
      depositDetails: selectedCurrency.walletAddress,
      remark: values.remark,
    };

    try {
      const result = await dispatch(addFundRequest(data)).unwrap();
      if (result.statusCode === 200) {
        toast.success("Fund Request Added Successfully");
        dispatch(getFundRequestReport());
        resetForm();
        setFormStep(1);
        setSelectedCurrency(null);
      } else if (result.statusCode === 417) {
        toast.error(result.message || "Minimum fund request amount is 10 dollar");
      } else {
        setErrors({
          transactionHash: result?.message || "Unexpected error occurred.",
        });
      }
    } catch (error) {
      toast.error("Failed to add fund request");
    }
    setSubmitting(false);
  };

  const fnCopy = () => {
    if (selectedCurrency && selectedCurrency.walletAddress) {
      navigator.clipboard.writeText(selectedCurrency.walletAddress);
      toast.success("Wallet Address Copied to clipboard");
    } else {
      toast.error("No wallet address to copy");
    }
  };

  const handleSearchChange = useCallback((e) => {
    setGlobalFilter(String(e.target.value));
  }, []);

  const handlePageSizeChange = useCallback(
    (e) => {
      table.setPageSize(Number(e.target.value));
    },
    [table]
  );

  const getStatusClasses = (rf_Status) => {
    switch (rf_Status) {
      case "Approved":
        return "status-approved";
      case "Reject":
      case "UnApproved":
        return "status-rejected";
      case "Rejected":
        return "status-pending";
      default:
        return "";
    }
  };

  return (
    <div className="">
      <div className="fund-request-wrapper">
        <div className="fund-request-card">
          <div className="fund-request-card-body">
            {showForm ? (
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleFormikSubmit}
              >
                {({
                  values,
                  setFieldValue,
                  isSubmitting,
                  isValid,
                  handleChange,
                  errors,
                  touched,
                }) => (
                  <Form>
                    {formStep === 1 ? (
                      <div className="form-step-1">
                        {selectedCurrency ? (
                          <div className="selected-currency-container">
                            <div className="selected-currency-content">
                              <div className="qr-code-section">
                                <QRCode
                                  value={selectedCurrency?.walletAddress}
                                  size={120}
                                  className="qr-code"
                                />
                                <p className="qr-code-text">
                                  Scan QR code to get wallet address
                                </p>
                              </div>
                              <div className="wallet-info-section">
                                <div>
                                  <h1 className="wallet-info-label">
                                    Selected Payment Mode
                                  </h1>
                                  <div className="wallet-info-value">
                                    <span className="payment-mode-badge">
                                      {selectedCurrency.name}
                                    </span>
                                  </div>
                                  <div className="mt-3">
                                    <h1 className="wallet-info-label">
                                      Network
                                    </h1>
                                    <div className="wallet-info-value">
                                      <span className="network-badge">
                                        {selectedCurrency.network}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="wallet-address-section">
                                  <p className="wallet-address-label">
                                    Wallet Address
                                  </p>
                                  <div className="wallet-address-box">
                                    <p className="wallet-address-text">
                                      {currencies.find(
                                        (currency) =>
                                          currency.name === selectedCurrency.name
                                      )?.walletAddress ||
                                        "Wallet address not found"}
                                    </p>
                                    <div className="copy-button-wrapper">
                                      <button
                                        type="button"
                                        onClick={fnCopy}
                                        className="copy-address-btn"
                                      >
                                        Copy Address
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="important-notes">
                                  <p className="notes-title">
                                    Important Notes:
                                  </p>
                                  <ul className="notes-list">
                                    <li>Only send USDT to this address</li>
                                    <li>
                                      Make sure you are using the correct
                                      network
                                    </li>
                                    <li>
                                      Minimum deposit: $10 USD equivalent
                                    </li>
                                    <li>
                                      Deposits will be credited after network
                                      confirmation
                                    </li>
                                  </ul>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedCurrency(null)}
                                className="back-button"
                              >
                                <IoMdArrowBack />
                                Back
                              </button>
                            </div>
                            <div className="deposit-button-container">
                              <button
                                type="button"
                                className="deposit-button"
                                onClick={() => {
                                  setFormStep(2);
                                }}
                              >
                                I&apos;ve Made the Transfer
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="payment-mode-selection">
                            <label
                              className="payment-mode-label"
                              htmlFor="PaymentMode"
                            >
                              Payment Mode
                            </label>
                            <div className="currencies-grid">
                              {currencies.map((currency, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setSelectedCurrency(currency);
                                    handlePaymentModeChange(
                                      setFieldValue,
                                      currency.name
                                    );
                                  }}
                                  className={`currency-card ${
                                    selectedCurrency === currency.name
                                      ? "currency-card-selected"
                                      : ""
                                  }`}
                                >
                                  {currency.icon}
                                  <div>
                                    <p className="currency-name">
                                      {currency.name}
                                    </p>
                                    <p className="currency-network">
                                      {currency.network}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="form-step-2">
                        <div className="form-step-2-content">
                          <div className="step-2-header">
                            <div>
                              <label className="step-2-label">
                                Selected Currency
                              </label>
                              <div className="selected-currency-badge">
                                {selectedCurrency?.name}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormStep(1)}
                              className="back-button-step2"
                            >
                              <IoMdArrowBack />
                              Back
                            </button>
                          </div>

                          <div className="form-field">
                            <label className="form-label">
                              Amount Sent *
                            </label>
                            <input
                              type="number"
                              name="amount"
                              value={values.amount}
                              min={0}
                              step="0.0001"
                              onKeyDown={(e) => {
                                if (["e", "E", "+", "-"].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                const input = e.target.value;
                                if (input === "") {
                                  setFieldValue("amount", "");
                                  return;
                                }
                                const regex = /^\d{0,7}(\.\d{0,4})?$/;
                                if (regex.test(input)) {
                                  setFieldValue("amount", input);
                                }
                              }}
                              placeholder="Enter the amount you sent"
                              className="form-input"
                            />
                            {errors.amount && touched.amount && (
                              <div className="error-message">
                                {errors.amount}
                              </div>
                            )}
                          </div>

                          <div className="form-field">
                            <label className="form-label">
                              Transaction Hash *
                            </label>
                            <input
                              type="text"
                              name="transactionHash"
                              value={values.transactionHash}
                              onChange={handleChange}
                              maxLength={70}
                              placeholder="Enter your transaction hash/ID"
                              className="form-input"
                            />
                            {errors.transactionHash &&
                              touched.transactionHash && (
                                <div className="error-message">
                                  {errors.transactionHash}
                                </div>
                              )}
                            <p className="form-hint">
                              You can find the transaction hash in your
                              wallet&apos;s transaction history
                            </p>
                          </div>

                          <div className="next-steps-box">
                            <h1 className="next-steps-title">Next Steps:</h1>
                            <p>• We will verify your transaction on the blockchain</p>
                            <p>• Your funds will be credited within 1–24 hours</p>
                            <p>• You'll receive a confirmation email once processed</p>
                            <p>• Contact support if you need assistance</p>
                          </div>

                          <button
                            className="submit-deposit-btn"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Submitting..." : "Submit Deposit"}
                          </button>
                        </div>
                      </div>
                    )}
                  </Form>
                )}
              </Formik>
            ) : (
              <div className="add-fund-button-container">
                <button
                  type="button"
                  className="add-fund-btn"
                  onClick={() => {
                    setShowForm(true);
                    setFormStep(1);
                  }}
                >
                  Add Fund Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fund-request-table-container">
        <div className="fund-request-table-wrapper">
          <h1 className="table-title">Fund Request List</h1>
          <div className="table-controls">
            <div className="page-size-selector">
              <select
                className="page-size-select"
                value={table.getState().pagination.pageSize}
                onChange={handlePageSizeChange}
              >
                {[10, 25, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-container">
              <label className="search-label">Search:</label>
              <input
                type="search"
                className="search-input"
                value={globalFilter ?? ""}
                onChange={handleSearchChange}
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead className="table-header">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="table-header-cell">
                        {header.isPlaceholder ? null : (
                          <div className="header-content">
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
                    <tr key={row.id} className="table-row">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="table-cell">
                          {cell.column.id === "rf_Status" ? (
                            <span
                              className={`status-badge ${getStatusClasses(
                                cell.getValue()
                              )}`}
                            >
                              {cell.getValue()}
                            </span>
                          ) : cell.column.id === "transactionHash" ? (
                            <span className="hash-container">
                              <span className="hash-text">
                                {cell.getValue()?.slice(0, 10)}...
                              </span>
                              <Copy
                                size={14}
                                className="copy-icon"
                                onClick={() =>
                                  handleCopy(cell.getValue(), row.id)
                                }
                                title={
                                  copiedRowId === row.id ? "Copied!" : "Copy"
                                }
                              />
                              <span className="hash-tooltip">
                                {copiedRowId === row.id
                                  ? "Copied!"
                                  : cell.getValue()}
                              </span>
                            </span>
                          ) : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="no-data-cell">
                      No data available in table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-container">
            <div className="entries-info">
              Showing {table.getRowModel().rows.length} of {data.length} entries
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                «
              </button>
              <button
                className="pagination-btn"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                ‹
              </button>
              <button
                className="pagination-btn"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                ›
              </button>
              <button
                className="pagination-btn"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}