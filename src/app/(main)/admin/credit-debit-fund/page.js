"use client";
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getUserWalletDetails, addFund } from '@/app/redux/slices/adminMasterSlice';
import { FaUser, FaWallet, FaDollarSign, FaStickyNote, FaCheckCircle, FaArrowRight, FaBalanceScale, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { RiUserSearchLine, RiBankCardLine, RiWalletLine, RiMoneyDollarCircleLine } from "react-icons/ri";

const CreditDebitFund = () => {
  const [form, setForm] = useState({
    loginId: '',
    name: '',
    wallet: '',
    type: '',
    amount: '',
    remark: '',
  });
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const dispatch = useDispatch();
  const { data: walletData, loading, error } = useSelector((state) => state.adminMaster);

  useEffect(() => {
    resetFormAndStates();
    resetFormFields();
  }, [])
  // Effect to populate user name when wallet data is fetched
  useEffect(() => {
    if (walletData?.walletDetails) {
      setForm((prev) => ({
        ...prev,
        name: walletData.walletDetails.fullName || walletData.walletDetails.name || '',
      }));
      setUserNotFound(false);
      setIsSearching(false);
    }
  }, [walletData]);

  // Effect to filter types based on selected wallet
  useEffect(() => {
    if (walletData?.fundTypeWiseCrDrList && form.wallet) {
      setFilteredTypes(walletData.fundTypeWiseCrDrList);
    } else {
      setFilteredTypes([]);
    }
  }, [form.wallet, walletData]);

  // Reset all form fields and states
  const resetFormAndStates = () => {
    setForm({
      loginId: '',
      name: '',
      wallet: '',
      type: '',
      amount: '',
      remark: '',
    });
    setFilteredTypes([]);
    setErrors({});
    setUserNotFound(false);
    setIsSearching(false);
    setSubmitting(false);
  };

  // Reset form fields except loginId (useful for search)
  const resetFormFields = () => {
    setForm((prev) => ({
      ...prev,
      name: '',
      wallet: '',
      type: '',
      amount: '',
      remark: '',
    }));
    setFilteredTypes([]);
    setErrors({});
    setUserNotFound(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'wallet') {
      setForm((prev) => ({ ...prev, type: '' }));
    }
  };

  const handleSearchUser = async () => {
    if (!form.loginId || !form.loginId.trim()) {
      toast.error('Please enter a User ID');
      return;
    }

    setIsSearching(true);
    setUserNotFound(false);
    setErrors({});

    try {
      const result = await dispatch(getUserWalletDetails(form.loginId));

      if (!result.payload || result.payload === null) {
        setUserNotFound(true);
        setErrors({ authLogin: "User not found" });
        resetFormFields(); // Reset fields except loginId
        setIsSearching(false);
      } else {
        setUserNotFound(false);
        setErrors({});
        // Data will be populated by the useEffect
        toast.success('User found successfully!');
      }
    } catch (error) {
      setUserNotFound(true);
      setErrors({ authLogin: "User not found" });
      resetFormFields();
      setIsSearching(false);
    }
  };

  const handleLoginIdChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      loginId: value,
      name: '',
      wallet: '',
      type: '',
      amount: '',
      remark: '',
    }));
    setUserNotFound(false);
    setErrors({});
    // Clear wallet data when typing new ID
    // The existing wallet data will be cleared from Redux state if needed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let newErrors = {};

    if (!form.loginId.trim()) newErrors.loginId = 'UserId is required';
    if (!form.wallet) newErrors.wallet = 'Select Wallet is required';
    if (!form.type) newErrors.type = 'Select Type is required';
    if (!form.amount) newErrors.amount = 'Enter Amount is required';
    if (!form.remark) newErrors.remark = 'Description is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setSubmitting(false);
      return;
    }

    if (!form.wallet || !form.type || !form.amount || !form.remark) {
      setSubmitting(false);
      return;
    }

    const selectedType = filteredTypes.find((t) => String(t.id) === String(form.type));
    const crDr = selectedType ? selectedType.crDr : null;
    const amount = parseFloat(form.amount);

    if (crDr === '2' || selectedType?.type === 'Debit') {
      let currentBalance = 0;
      switch (form.wallet) {
        case '1':
          currentBalance = parseFloat(walletData?.walletDetails?.incomeWallet || 0);
          break;
        case '2':
          currentBalance = parseFloat(walletData?.walletDetails?.depositWallet || 0);
          break;
        case '3':
          currentBalance = parseFloat(walletData?.walletDetails?.roiWallet || 0);
          break;
        default:
          currentBalance = 0;
      }

      if (currentBalance - amount < 0) {
        toast.error(`Debit would not be less than 0`);
        setSubmitting(false);
        return;
      }
    }

    const payload = {
      wallettype: form.wallet,
      crDr: crDr,
      authlogin: form.loginId,
      amt: form.amount,
      remark: form.remark,
    };

    try {
      const response = await dispatch(addFund(payload)).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message || 'Fund added successfully!');

        // Reset all form fields and states after successful submission
        resetFormAndStates();
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to add fund.');
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Determine if form should be disabled
  const isFormDisabled = !form.name || userNotFound

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg transform transition-transform hover:scale-105 duration-300 mb-4">
            <FaBalanceScale className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Credit / Debit Fund
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Manage user wallet transactions efficiently
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RiWalletLine className="text-xl" />
              Transaction Details
            </h2>
            <p className="text-emerald-100 text-sm mt-1">Fill in the details to credit or debit funds</p>
          </div>

          <form className="p-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* User ID with Search Button */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaUser className="inline mr-2 text-emerald-500" />
                  User ID <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="loginId"
                    name="loginId"
                    value={form.loginId}
                    onChange={handleLoginIdChange}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    placeholder="Enter user ID"
                    autoComplete="off"
                    disabled={isSearching}
                  />
                  <button
                    type="button"
                    onClick={handleSearchUser}
                    disabled={isSearching || !form.loginId.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                  >
                    {isSearching ? (
                      <>
                        <svg className="animate-spin h-5 w-5 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </>
                    ) : (
                      <>
                        <RiUserSearchLine className="inline mr-2" />
                        Search
                      </>
                    )}
                  </button>
                </div>
                {errors.authLogin && (
                  <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <FaCheckCircle className="text-xs" />
                    {errors.authLogin}
                  </div>
                )}
                {errors.loginId && (
                  <div className="mt-2 text-sm text-red-500">{errors.loginId}</div>
                )}
              </div>

              {/* User Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaUser className="inline mr-2 text-emerald-500" />
                  User Name
                </label>
                <input
                  type="text"
                  id="user"
                  name="name"
                  value={form.name}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  placeholder={isSearching ? "Searching..." : "User name will appear here"}
                />
              </div>
            </div>

            {/* Wallet Details Section - Only show when user exists */}
            {!isFormDisabled && (
              <>
                {/* Wallet Balances */}
                <div className="mt-5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiBankCardLine className="inline mr-2 text-emerald-500" />
                    Current Wallet Balances
                  </label>
                  {walletData?.walletDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <FaMoneyBillWave className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Income Wallet</p>
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            ${walletData.walletDetails.incomeWallet}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <FaCreditCard className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Deposit Wallet</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ${walletData.walletDetails.depositWallet}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <FaDollarSign className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Trading Wallet</p>
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            ${walletData.walletDetails.roiWallet}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                  {/* Wallet Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FaWallet className="inline mr-2 text-emerald-500" />
                      Select Wallet <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="wallet"
                      name="wallet"
                      value={form.wallet}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 cursor-pointer"
                      disabled={isFormDisabled}
                    >
                      <option value="">- Select Wallet -</option>
                      {walletData?.fundTypes?.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.type}
                        </option>
                      ))}
                    </select>
                    {errors.wallet && (
                      <div className="mt-2 text-sm text-red-500">{errors.wallet}</div>
                    )}
                  </div>

                  {/* Type Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FaBalanceScale className="inline mr-2 text-emerald-500" />
                      Transaction Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 cursor-pointer"
                      disabled={!form.wallet || isFormDisabled}
                    >
                      <option value="">- Select Type -</option>
                      {filteredTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.type}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <div className="mt-2 text-sm text-red-500">{errors.type}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 mt-5">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <RiMoneyDollarCircleLine className="inline mr-2 text-emerald-500" />
                      Enter Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      min="1"
                      step="0.01"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                      placeholder="Enter amount"
                      disabled={isFormDisabled}
                    />
                    {errors.amount && (
                      <div className="mt-2 text-sm text-red-500">{errors.amount}</div>
                    )}
                  </div>

                  {/* Remark */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FaStickyNote className="inline mr-2 text-emerald-500" />
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="remark"
                      name="remark"
                      value={form.remark}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                      placeholder="Enter transaction description"
                      disabled={isFormDisabled}
                    />
                    {errors.remark && (
                      <div className="mt-2 text-sm text-red-500">{errors.remark}</div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Loading and Error Messages */}
            {loading && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-blue-600 dark:text-blue-400">Loading wallet details...</span>
                </div>
              </div>
            )}
            {error && !userNotFound && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                <p className="text-sm text-red-600 dark:text-red-400">{typeof error === 'string' ? error : 'Failed to fetch wallet details.'}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!form.name || userNotFound || submitting || !walletData?.walletDetails?.urid}
              className="group relative w-full mt-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden shadow-md"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Transaction...
                  </>
                ) : (
                  <>
                    <FaArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                    Submit Transaction
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Important Information</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                • Please ensure the user ID is valid before proceeding<br />
                • Debit transactions cannot exceed the current wallet balance<br />
                • All transactions are recorded for audit purposes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditDebitFund;