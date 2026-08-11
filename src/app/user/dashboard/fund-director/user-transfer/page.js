"use client";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { usernameByLoginId } from "@/app/redux/slices/fundManagerSlice";
import Cookies from "js-cookie";
import { getProfileDetails, sendOtpFundRequest, validateOtp } from "@/app/redux/slices/authSlice";
import { fundTransferDepositToDeposit } from "@/app/redux/slices/fundManagerSlice";
import { getfundTransferDepositToDepositReport } from "@/app/redux/slices/fundManagerSlice";
import toast from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { getUserId, getEmailId, AuthLogin } from "@/app/api/auth";

const UserTransfer = () => {
  const dispatch = useDispatch();
  const { usernameData } = useSelector((state) => state.fund);
  const [name, setName] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [tableData, setTableData] = useState([]);
  const [email, setEmail] = useState("");
  const [urid, setUrid] = useState("");
  const { getIncomeToDepositWalletReportData } = useSelector(
    (state) => state.fund
  );
  const depositWallet =
    getIncomeToDepositWalletReportData?.walletBalance[0]?.DepositWallet;
  const [otpError, setOtpError] = useState("");

  const profileDataLoading = async () => {
    try {
      const result = await dispatch(getProfileDetails()).unwrap();
      if (result) {
        const user = result?.[0] || result.payload;
        setEmail(user?.Email);
      }
    } catch (e) {
      console.log("err =>", e);
    }
  };

  useEffect(() => {
    profileDataLoading();
  }, []);
  useEffect(() => {
    if (usernameData) {
      setName(usernameData?.data?.name);
    }
    const urid = getUserId();
    const emailId = getEmailId();
    setUrid(urid);
  }, [usernameData]);

  useEffect(() => {
    (async () => {
      try {
        const result = await dispatch(
          getfundTransferDepositToDepositReport(getUserId())
        ).unwrap();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (
      getIncomeToDepositWalletReportData?.depositWalletReport &&
      Array.isArray(getIncomeToDepositWalletReportData.depositWalletReport)
    ) {
      const mappedData =
        getIncomeToDepositWalletReportData?.depositWalletReport?.map(
          (item, idx) => ({
            id: idx + 1,
            transDate: item.CreatedDate,
            credit: item.Credit,
            debit: item.Debit,
            status: item.TrStatus,
            remark: item.Remark,
          })
        );
      setTableData(mappedData);
    }
  }, [getIncomeToDepositWalletReportData]);

  const data = useMemo(() => tableData, [tableData]);

  const columns = useMemo(
    () => [
      { header: "#", accessorKey: "id" },
      { header: "Date", accessorKey: "transDate" },
      {
        header: "Credit",
        accessorKey: "credit",
        cell: (info) => (
          <span className="credit-cell">
            ${info.getValue()}
          </span>
        ),
      },
      {
        header: "Debit",
        accessorKey: "debit",
        cell: (info) => (
          <span className="debit-cell">
            ${info.getValue()}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const value = info.getValue();
          const isApproved = value === "Approve";
          return (
            <span className={`status-cell ${isApproved ? "status-approved" : "status-rejected"}`}>
              {value}
            </span>
          );
        },
      },
      { header: "Remark", accessorKey: "remark" },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  const limitInputLength = useCallback((input, maxLength) => {
    if (input.value.length > maxLength) {
      input.value = input.value.slice(0, maxLength);
    }
  }, []);

  const validatenumerics = useCallback((event) => {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
    return true;
  }, []);

  const fnSendOTP = async (formik) => {
    formik.setTouched({
      userId: true,
      amount: true,
    });
    const errors = await formik.validateForm();
    if (errors.userId || errors.amount) {
      return;
    }
    if (isOtpSent) return;
    // const data = { emailId: email };
    try {
      const result = await dispatch(sendOtpFundRequest()).unwrap();
      if (result.statusCode === 200) {
        setIsOtpSent(true);
        toast.success(result?.data?.message);
      }
    } catch (e) {
      setOtpError("Failed to send OTP. Please try again.");
      console.error(e);
    }
  };


  const validationSchema = Yup.object({
    userId: Yup.string()
      .required("Username is required")
      .test("not-self-transfer", "Cannot transfer to your own account", function (value) {
        const authLogin = AuthLogin();
        return value !== authLogin;
      }),
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
      ),
    otp: Yup.string()
      .length(6, "OTP must be 6 digits")
      .required("OTP is required"),
  });

  const initialValues = {
    userId: "",
    amount: "",
    otp: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setOtpError("");
   
    const data = {
      email: email || "",
      authLoginReciver: values.userId,
      trnsamount: parseInt(values.amount),
      p2potp: values.otp || ""
    };
    try {
      const result = await dispatch(
        fundTransferDepositToDeposit(data)
      ).unwrap();
      if (result.statusCode === 200) {
        console.log("result====>", result)
        toast.success(result.message);
        await dispatch(getfundTransferDepositToDepositReport());
        resetForm();
        setName("");
        setIsOtpSent(false);
      } else {
        toast.error(result.message);
      }
    } catch (e) {

      console.error("Transfer failed:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="user-transfer-container">
      <div className="user-transfer-wrapper">
        <div className="user-transfer-card">
          <div className="user-transfer-card-body">
            <div className="transfer-header">
              <h2 className="transfer-title">
                Deposit Wallet Transfer
              </h2>
              <h2 className="transfer-balance">
                Balance: ${(depositWallet || 0).toFixed(2)}
              </h2>
            </div>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              validate={(values) => {
                const errors = {};
                if (values.amount) {
                  const amountNum = parseFloat(values.amount);
                  if (amountNum < 1) {
                    errors.amount = `Amount must be at least 1`;
                  } else if (amountNum > depositWallet) {
                    errors.amount = `Amount Cannot Exceed Deposit Wallet Balance`;
                  }
                }
                return errors;
              }}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {(formik) => {
                const { values, handleChange, setFieldValue, handleBlur } = formik;
                return (
                  <Form className="transfer-form">
                    <div className="form-fields-container">
                      <div className="form-grid">
                        <div className="form-field">
                          <label className="form-label">
                            Username
                          </label>
                          <Field
                            name="userId"
                            className="form-input"
                            placeholder="Enter Username"
                            type="text"
                            value={values.userId}
                            onChange={async (e) => {
                              handleChange(e);
                              const newUserId = e.target.value;
                              setFieldValue("userId", newUserId);
                              const result = await dispatch(
                                usernameByLoginId(newUserId)
                              ).unwrap();
                              if (
                                result &&
                                result.statusCode === 200 &&
                                result.data
                              ) {
                                setName(result.data.name);
                              } else if (result.statusCode === 409) {
                                setName(result.message);
                              }
                            }}
                            onBlur={handleBlur}
                          />
                          <ErrorMessage
                            name="userId"
                            component="div"
                            className="error-message"
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label-name">
                            Name
                          </label>
                          <input
                            name="Name"
                            placeholder="Name"
                            type="text"
                            readOnly
                            className="readonly-input"
                            value={name || ""}
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            Amount
                          </label>
                          <input
                            type="text"
                            name="amount"
                            value={values.amount}
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
                                if (depositWallet !== "Select Wallet") {
                                  const amountNum = parseFloat(input);
                                  if (
                                    !isNaN(amountNum) &&
                                    amountNum > depositWallet
                                  ) {
                                    formik.setFieldError(
                                      "amount",
                                      `Amount Cannot Exceed Deposit Wallet Balance ($${depositWallet})`
                                    );
                                  } else {
                                    formik.setFieldError("amount", undefined);
                                  }
                                }
                                formik.setFieldValue("amount", input);
                              }
                            }}
                            placeholder="Enter Amount"
                            className="form-input"
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
                            onClick={() => fnSendOTP(formik)}
                            className={`send-otp-btn needmt ${isOtpSent ? "disabled" : ""}`}
                            disabled={isOtpSent}
                          >
                            Send OTP
                          </button>
                        </div>
                      </div>
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
                              onInput={(e) => {
                                e.target.value = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 6);
                              }}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "-" ||
                                  e.key === "e" ||
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
                          <button
                            type="submit"
                            className="transfer-submit-btn"
                            disabled={formik.isSubmitting}
                          >
                            Transfer
                          </button>
                        </div>
                      )}
                    </div>
                    {otpError && (
                      <div className="otp-error-message">
                        {otpError}
                      </div>
                    )}
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>

      <div className="p2p-report-container">
        <div className="p2p-report-wrapper">
          <h1 className="report-title">
            P2P Transfer Report
          </h1>
          <div className="report-table-container">
            <div className="table-controls">
              <div className="page-size-selector">
                <select
                  className="page-size-select"
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
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
                  onChange={(e) => setGlobalFilter(String(e.target.value))}
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
                    table.getRowModel().rows.map((row, idx) => (
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
      </div>
    </div>
  );
};

export default UserTransfer;