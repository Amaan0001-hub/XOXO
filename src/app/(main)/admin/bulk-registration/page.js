"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usernameLoginId, bulkRegistration } from "@/app/redux/slices/adminMasterSlice";
import { getAllCountry } from "@/app/redux/slices/authSlice";
import { toast } from "react-toastify";
import Spinner from "@/app/common/spinner";

const initialForm = {
  fName: "",
  lName: "",
  mobile: "",
  email: "",
  password: "",
  noOfId: "",
  countryId: "",
  position: "",
};

const BulkRegistration = () => {
  const dispatch = useDispatch();
  const { usernameData, loading: userLoading, error: userError } = useSelector((state) => state.adminMaster);
  const { getAllCountryData, loading: countryLoading } = useSelector((state) => state.auth);
  const { bulkRegistrationData, loading: regLoading, error: regError } = useSelector((state) => state.auth);
  const [userId, setUserId] = useState("");
  const [touched, setTouched] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [introURID, setIntroURID] = useState("");
  const [noOfIdError, setNoOfIdError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!getAllCountryData || getAllCountryData.length === 0) {
      dispatch(getAllCountry());
    }
  }, [dispatch, getAllCountryData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userId && userId.trim()) {
        dispatch(usernameLoginId(userId)).then((res) => {
          // setIntroURID(res.payload?.urid || "");
          if (!res.payload) {
            setErrors({ authLogin: "User not found" });
          } else {
            setErrors({});
          }
        });
        setTouched(true);
      } else {
        setIntroURID("");
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [userId, dispatch]);

  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
  };

  const handleBlurOrFetch = () => {
    if (userId && userId.trim()) {
      dispatch(usernameLoginId(userId)).then((res) => {
        // setIntroURID(res.payload?.urid || "");
      });
      setTouched(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "noOfId") {
      let val = value;
      if (Number(val) > 50) {
        setNoOfIdError("Number not greater than 50");
      } else if (Number(val) < 0) {
        setNoOfIdError("Number must not be negative");
      } else {
        setNoOfIdError("");
      }
      if (Number(val) > 50) {
        val = "50";
      } else if (Number(val) < 0) {
        val = "0";
      }
      setForm((prev) => ({ ...prev, [name]: val }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userId.trim()) newErrors.userId = "UserId is required";
    if (!form.fName.trim()) newErrors.fName = "First Name is required";
    if (!form.lName.trim()) newErrors.lName = "Last Name is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile is required";
    else if (!/^\d{10,15}$/.test(form.mobile.trim())) newErrors.mobile = "Enter a valid mobile number";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) newErrors.email = "Enter a valid email address";
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (!form.noOfId || isNaN(Number(form.noOfId))) newErrors.noOfId = "No Of Id is required";
    else if (Number(form.noOfId) > 50) newErrors.noOfId = "Number not greater than 50";
    else if (Number(form.noOfId) < 0) newErrors.noOfId = "Number must not be negative";
    if (!form.countryId) newErrors.countryId = "Country is required";
    if (!form.position) newErrors.position = "Position is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    for (const key of Object.keys(initialForm)) {
      if (!form[key] || (key === "noOfId" && (isNaN(Number(form[key])) || Number(form[key]) > 50))) {
        toast.error("Please fill all fields correctly. No Of Id should not be more than 50.");
        return;
      }
    }

    // Map position to introSide: 'Left' -> 'L', 'Right' -> 'R'
    let introSideValue = null;
    if (form.position === "Left") introSideValue = "L";
    else if (form.position === "Right") introSideValue = "R";

    // Build request body exactly as API expects
    const reqBody = {
      introAuthlogin: userId || "",
      introSide: introSideValue,
      fName: form.fName,
      lName: form.lName,
      mobile: form.mobile,
      email: form.email,
      password: form.password,
      noOfId: Number(form.noOfId),
      countryId: form.countryId,
    };

    try {
      const result = await dispatch(bulkRegistration(reqBody)).unwrap();
      toast.success("Bulk registration successful!");
      setForm(initialForm);
      setUserId("");
      setIntroURID("");
      setTouched(false);
    } catch (err) {
      toast.error(regError || err?.message || "Bulk registration failed.");
    }
  };
  return (
    <div>
      <div className="max-w-3xl mx-auto">
        {/* Header Section - Smaller */}
        <div className="mb-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg transform transition-transform hover:scale-105 duration-300 mb-2">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Bulk Registration
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            Register multiple users efficiently in one go
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
            <h2 className="text-lg font-bold text-white">Registration Details</h2>
            <p className="text-emerald-100 text-xs mt-0.5">Fill in the information below to register users in bulk</p>
          </div>

          <form className="p-4 space-y-4" onSubmit={handleSubmit}>
            {/* User ID Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Referral User Information</h3>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Referral User ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                    value={userId}
                    onChange={handleUserIdChange}
                    onBlur={handleBlurOrFetch}
                    placeholder="Enter referral user ID"
                  />
                  {errors.authLogin && <div className="mt-1 text-xs text-red-500">{errors.authLogin}</div>}
                  {errors.userId && <div className="mt-1 text-xs text-red-500">{errors.userId}</div>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Referral Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed text-sm"
                    value={touched && usernameData ? usernameData.name || usernameData.userName || "" : ""}
                    readOnly
                    placeholder="Referral name will appear here"
                  />
                </div>
              </div>
            </div>

            {/* Main Registration Fields */}
            {touched && usernameData && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">User Registration Details</h3>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fName"
                      value={form.fName}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                      placeholder="First name"
                    />
                    {errors.fName && <div className="mt-1 text-xs text-red-500">{errors.fName}</div>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lName"
                      value={form.lName}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                      placeholder="Last name"
                    />
                    {errors.lName && <div className="mt-1 text-xs text-red-500">{errors.lName}</div>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                      placeholder="Mobile number"
                    />
                    {errors.mobile && <div className="mt-1 text-xs text-red-500">{errors.mobile}</div>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                      placeholder="Email address"
                    />
                    {errors.email && <div className="mt-1 text-xs text-red-500">{errors.email}</div>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                      placeholder="Password"
                    />
                    {errors.password && <div className="mt-1 text-xs text-red-500">{errors.password}</div>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Number of IDs <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="noOfId"
                      value={form.noOfId}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                      placeholder="Max 50"
                      max={50}
                      min={0}
                    />
                    {noOfIdError && <div className="mt-1 text-xs text-red-500">{noOfIdError}</div>}
                    {errors.noOfId && <div className="mt-1 text-xs text-red-500">{errors.noOfId}</div>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="countryId"
                      value={form.countryId}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm cursor-pointer"
                    >
                      <option value="">Select Country</option>
                      {getAllCountryData &&
                        getAllCountryData?.data?.map((country) => (
                          <option key={country.country_Id} value={country.country_Id}>
                            {country.country_Name}
                          </option>
                        ))}
                    </select>
                    {errors.countryId && <div className="mt-1 text-xs text-red-500">{errors.countryId}</div>}
                  </div>

                  {/* Position Dropdown Field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Position <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm cursor-pointer"
                    >
                      <option value="">Select Position</option>
                      <option value="Left">Left</option>
                      <option value="Right">Right</option>
                    </select>
                    {errors.position && <div className="mt-1 text-xs text-red-500">{errors.position}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="group relative w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md text-sm"
              disabled={userLoading || regLoading || countryLoading || !!errors.authLogin}
            >
              <span className="flex items-center justify-center gap-2">
                {userLoading || regLoading || countryLoading ? (
                  <>
                    <Spinner size={4} color="text-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  "Submit"
                )}
              </span>
            </button>

            {/* Error Messages */}
            {(userError || regError) && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-xs text-center">{userError || regError}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkRegistration;