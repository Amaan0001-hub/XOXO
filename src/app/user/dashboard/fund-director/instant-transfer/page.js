"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { getFundRequestReport } from "@/app/redux/slices/fundManagerSlice";
import { useDispatch } from "react-redux";
import { sendOtpFundRequest, sendOtpFundRequestIncome, validateOtp } from "@/app/redux/slices/authSlice";
import {
  addTransferIncomeToDepositWallet,
  getTransferIncomeToDepositWalletReport,
} from "@/app/redux/slices/fundManagerSlice";
import toast from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { getUserId, getEmailId } from "@/app/api/auth";

export default function InstantTransfer() {
  const dispatch = useDispatch();
  const [walletBalance, setWalletBalance] = useState(0.0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [email, setEmail] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const { getTransferIncomeToDepositWalletReportData } = useSelector(
    (state) => state.fund
  );
  const hasFetchedReport = useRef(false);

  useEffect(() => {
    if (hasFetchedReport.current) return;
    hasFetchedReport.current = true;
    const urid = getUserId();
    const emailId = getEmailId();
    setEmail(emailId);
    dispatch(getTransferIncomeToDepositWalletReport());
  }, [dispatch]);

  useEffect(() => {
    if (
      getTransferIncomeToDepositWalletReportData &&
      getTransferIncomeToDepositWalletReportData.walletBalance &&
      getTransferIncomeToDepositWalletReportData.walletBalance.length > 0
    ) {
      setWalletBalance(
        getTransferIncomeToDepositWalletReportData.walletBalance[0].incomeWallet || 0
      );
    }
  }, [getTransferIncomeToDepositWalletReportData]);

  const [otpError, setOtpError] = useState("");
  const [walletType, setWalletType] = useState("");
  const performanceWalletBalance = getTransferIncomeToDepositWalletReportData?.walletBalance?.[0]?.incomeWallet || 0;

  const yieldWalletBalance = getTransferIncomeToDepositWalletReportData?.walletBalance?.[0]?.roiWallet || 0;

  const selectedWalletBalance =
    walletType === "income"
      ? performanceWalletBalance
      : walletType === "trade"
        ? yieldWalletBalance
        : 0;

  const selectedWalletName =
    walletType === "income"
      ? "Income Wallet Balance"
      : walletType === "trade"
        ? "Trade Wallet Balance"
        : "Selected Wallet";

  const handleSendOTP = async (formik) => {
    setOtpError("");
    formik.setTouched({ amount: true });
    const errors = await formik.validateForm();
    if (errors.amount) {
      return;
    }
    if (isOtpSent) return;

    // const emailId = getEmailId();
    // if (!emailId) {
    //   setOtpError("Email not found. Please try again.");
    //   setIsOtpSent(false);
    //   return;
    // }

    // const data = { emailId };
    try {
      const result = await dispatch(sendOtpFundRequestIncome()).unwrap();
      if (result.statusCode === 200) {
        setIsOtpSent(true);
        toast.success(result.data.message || "success!");
      }
    } catch (e) {
      setOtpError("Failed to send OTP. Please try again.");
      setIsOtpSent(false);
    }
  };

  // const fnValidateOtp = async (otp) => {
  //   const data = {
  //     urid: getUserId(),
  //     otp: String(otp)
  //   };
  //   try {
  //     const result = await dispatch(validateOtp(data)).unwrap();
  //     if (result.statusCode === 200) {
  //       return true;
  //     } else {
  //       toast.error(result.message || "Invalid OTP");
  //       return false;
  //     }
  //   } catch (e) {
  //     toast.error(e?.message || "OTP validation failed");
  //     return false;
  //   }
  // };

  const handleTransfer = async (values, { setStatus, resetForm, setSubmitting }) => {
    setOtpError("");
    // const isOtpValid = await fnValidateOtp(values.otp);
    // if (!isOtpValid) {
    //   setSubmitting(false);
    //   return;
    // }
    const walletTypeValue = walletType === "income" ? 1 : walletType === "trade" ? 2 : null;
    if (walletTypeValue === null) {
      setStatus({ transferSuccess: false, error: "Please select a wallet first" });
      setSubmitting(false);
      return;
    }

    const data = {
      otp: values.otp,
      trnsamount: values.amount,
      walletType: walletTypeValue,
    };
    try {
      const result = await dispatch(
        addTransferIncomeToDepositWallet(data)
      ).unwrap();
      if (result.statusCode === 200) {
        toast.success(result.message);
        resetForm();
        setStatus({ transferSuccess: true, error: null });
        setIsOtpSent(false);
      } else{
        toast.error(result.message);
      }
    } catch (error) {
      setStatus({ transferSuccess: false, error: "Transfer failed" });
    }
    await dispatch(getTransferIncomeToDepositWalletReport());
    setSubmitting(false);
  };

  const apiRows =
    getTransferIncomeToDepositWalletReportData?.depositWalletReport || [];

  const data = useMemo(
    () =>
      apiRows.map((row, idx) => ({
        id: idx + 1,
        date: row.createdDate,
        credit: row.Credit,
        debit: row.Debit,
        remark: row.Remark,
      })),
    [apiRows]
  );

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "#",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor("credit", {
        header: "Credit",
        cell: (info) => (
          <span className="credit-badge">
            ${info.getValue()}
          </span>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("debit", {
        header: "Debit",
        cell: (info) => (
          <span className="debit-badge">
            ${info.getValue()}
          </span>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("remark", {
        header: "Remark",
        cell: (info) => info.getValue(),
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const validationSchema = Yup.object({
    amount: Yup.string()
      .required("Amount is required")
      .matches(
        /^(?:\d{1,7})(?:\.\d{1,4})?$/,
        "Please enter a valid amount. Only up to 7 digits before and 4 digits after decimal are allowed."
      )
      .test(
        'min-amount',
        'Amount must be at least 1',
        function (value) {
          if (!value) return true;
          const amountNum = parseFloat(value);
          return !isNaN(amountNum) && amountNum >= 1;
        }
      )
      .test(
        'wallet-selected',
        'Please select a wallet first',
        function (value) {
          return walletType !== "";
        }
      ),
    otp: Yup.string()
      .length(6, "OTP must be 6 digits")
      .required("OTP is required"),
  });

  return (
    <>
      <div className="instant-transfer-wrapper">
        <div className="instant-transfer-card">
          <div className="instant-transfer-card-body">
            <div className="transfer-header">
            <h2 className="transfer-title">
              Transfer To Deposit Wallet
            </h2>
             {walletType === 'income' && (
                    <h2 className="wallet-balance">
                      Balance: ${(performanceWalletBalance || 0).toFixed(2)}
                    </h2>
                  )}
                  {walletType === 'trade' && (
                    <h2 className="wallet-balance">
                      Balance: ${(yieldWalletBalance || 0).toFixed(2)}
                    </h2>
                  )}
            </div>
            <div className="transfer-form-container">
              <div className="otp-row">
                <div className="otp-col">
                  <div className="form-group">
                      <label className="form-label">
                                Wallet Type
                              </label>
                    <select
                      id="wallet-type"
                      name="walletType"
                      className="wallet-select"
                      value={walletType}
                      onChange={e => setWalletType(e.target.value)}
                    >
                      <option value="">Select Wallet</option>
                      <option value="income">Income Wallet</option>
                      <option value="trade">Trade Wallet</option>
                    </select>
                  </div>
                 
                </div>
                <div className="custom-col">
                  <Formik
                    initialValues={{ amount: "", otp: "" }}
                    validationSchema={validationSchema}
                    validate={values => {
                      const errors = {};
                      if (walletType === "" && values.amount) {
                        errors.amount = "Please select a wallet first";
                      }
                      if (walletType !== "" && values.amount) {
                        const amountNum = parseFloat(values.amount);
                        if (amountNum < 1) {
                          errors.amount = "Amount must be at least 1";
                        } else if (amountNum > selectedWalletBalance) {
                          errors.amount = `Amount Cannot Exceed ${selectedWalletName}`;
                        }
                      }
                      return errors;
                    }}
                    onSubmit={handleTransfer}
                  >
                    {(formik) => (
                      <Form onSubmit={formik.handleSubmit}>
                        <div className="custom-row">
                          <div className="custom-col">
                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">
                                Amount
                              </label>
                              <input
                                type="text"
                                name="amount"
                                value={formik.values.amount}
                                min={1}
                                step="0.0001"
                                onChange={(e) => {
                                  const input = e.target.value;
                                  formik.setFieldTouched("amount", true);
                                  const regex = /^\d{0,7}(\.\d{0,4})?$/;
                                  if (input === "") {
                                    formik.setFieldValue("amount", "");
                                    formik.setFieldError("amount", undefined);
                                    return;
                                  }
                                  if (regex.test(input)) {
                                    if (walletType !== "") {
                                      const amountNum = parseFloat(input);
                                      if (!isNaN(amountNum)) {
                                        if (amountNum < 1) {
                                          formik.setFieldError("amount", "Amount must be at least 1");
                                        } else if (amountNum > selectedWalletBalance) {
                                          formik.setFieldError("amount", `Amount Cannot Exceed ${selectedWalletName}`);
                                        } else {
                                          formik.setFieldError("amount", undefined);
                                        }
                                      }
                                    }
                                    formik.setFieldValue("amount", input);
                                  }
                                }}
                                onBlur={formik.handleBlur}
                                placeholder={walletType === "" ? "Select Wallet First" : "Enter the amount"}
                                className="form-input"
                                disabled={walletType === ""}
                              />
                              {formik.errors.amount && formik.touched.amount && (
                                <div className="error-message">
                                  {formik.errors.amount}
                                </div>
                              )}
                            </div>
                            <div className="send-otp-wrapper">
                              <button
                                type="button"
                                onClick={() => handleSendOTP(formik)}
                                className={`send-otp-btn ${(isOtpSent || walletType === "") ? "disabled" : ""}`}
                                disabled={isOtpSent || walletType === ""}
                              >
                                {walletType === "" ? "Select Wallet First" : "Send OTP"}
                              </button>
                            </div>
                          </div>
                          </div>
                                <div className="col-md-6">
                          {otpError && (
                            <div className="otp-error">
                              {otpError}
                            </div>
                          )}
                          {isOtpSent && (
                            <div className="otp-section">
                              <div className="form-field">
                                <label className="form-label">
                                  OTP
                                </label>
                                <Field
                                  type="text"
                                  name="otp"
                                  maxLength={6}
                                  inputMode="numeric"
                                  pattern="[0-9]{6}"
                                  placeholder="Enter OTP"
                                  className="otp-input"
                                  onInput={e => {
                                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                  }}
                                  onKeyDown={e => {
                                    if (
                                      e.key === '-' ||
                                      e.key === 'e' ||
                                      (e.key.length === 1 && !/[0-9]/.test(e.key))
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                />
                                <ErrorMessage
                                  name="otp"
                                  component="div"
                                  className="error-message"
                                />
                              </div>
                              <div className="send-trn-wrapper">
                              <button
                                type="submit"
                                className="send-otp-btn"
                                disabled={formik.isSubmitting}
                              >
                                Transfer
                              </button>
                            </div>
                            </div>
                          )}
                        </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="transfer-summary-wrapper">
        <h1 className="summary-title">
          Funds Transfer Summary
        </h1>
        <div className="summary-table-container">
          <div className="table-controls">
            <div className="page-size-selector">
              <select
                className="page-size-select"
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
              >
                {[10, 25, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-control">
              <label className="search-label">
                Search:
              </label>
              <input
                type="search"
                className="search-input"
                value={globalFilter ?? ""}
                onChange={e => setGlobalFilter(String(e.target.value))}
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
                    <td colSpan={columns.length} className="no-data-cell">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}