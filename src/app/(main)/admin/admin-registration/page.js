"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Phone, Lock, UserPlus, Shield, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { clearError, registerUser } from "@/app/redux/slices/authSlice";
import Spinner from "@/app/common/spinner";
import {
  isValidEmail,
  isValidMobile,
  isValidPassword,
  isValidUsername,
  limitToCharacters,
} from "@/app/constants/validationHelpers";
import { FaUserGraduate, FaEnvelope, FaMobileAlt, FaLock, FaUserTag, FaArrowRight } from "react-icons/fa";
import { RiAdminLine, RiUserAddLine, RiShieldKeyholeLine } from "react-icons/ri";

const AdminRegistration = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    fname: "",
    lname: "",
    type: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (isValidUsername(formData.username))
      newErrors.username = isValidUsername(formData.username);
    if (isValidUsername(formData.fname))
      newErrors.fname = isValidUsername(formData.fname);
    if (isValidEmail(formData.email))
      newErrors.email = isValidEmail(formData.email);
    if (isValidMobile(formData.phoneNumber))
      newErrors.phoneNumber = isValidMobile(formData.phoneNumber);
    if (isValidPassword(formData.password))
      newErrors.password = isValidPassword(formData.password);
    if (!formData.type) newErrors.type = "Please select a type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = name === "phoneNumber" ? value.replace(/\D/g, "") : value;
    updatedValue = limitToCharacters(updatedValue);

    setFormData({ ...formData, [name]: updatedValue });
    setErrors({ ...errors, [name]: "" });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validate()) return;

    try {
      const result = await dispatch(registerUser(formData)).unwrap();
      if (result && result.statusCode === 200) {
        setFormData({
          username: "",
          fname: "",
          lname: "",
          type: "",
          email: "",
          phoneNumber: "",
          password: "",
        });

        setRegistrationComplete(true);
        toast.success(result.message || "Registration successful!");
      } else {
        setMessage(result?.message || "Registration failed");
        toast.error(result?.message || "Registration failed");
      }
    } catch (errorMessage) {
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (error) {
      setMessage(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <div>
      <div>
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg transform transition-transform hover:scale-105 duration-300 mb-4">
            <RiUserAddLine className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 flex items-center justify-center gap-2">
            <RiShieldKeyholeLine className="text-emerald-500" />
            Register new admin user for the platform
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RiAdminLine className="text-xl" />
              Registration Form
            </h2>
            <p className="text-emerald-100 text-sm mt-1">Fill in the details to create a new admin account</p>
          </div>

          <form className="p-6 space-y-5" onSubmit={handleSubmit}>
            {/* Error Message */}
            {message && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{message}</p>
              </div>
            )}

            {/* Username + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaUserGraduate className="inline mr-2 text-emerald-500" />
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200
                      ${errors.username 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      }`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaUserTag className="inline mr-2 text-emerald-500" />
                  User Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 cursor-pointer
                      ${errors.type 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      }`}
                  >
                    <option value="">Select Type</option>
                    <option value="SuperAdmin">Super Admin</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                {errors.type && (
                  <p className="mt-2 text-sm text-red-500">{errors.type}</p>
                )}
              </div>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline mr-2 text-emerald-500" />
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fname"
                    placeholder="Enter first name"
                    value={formData.fname}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200
                      ${errors.fname 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      }`}
                  />
                </div>
                {errors.fname && (
                  <p className="mt-2 text-sm text-red-500">{errors.fname}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline mr-2 text-emerald-500" />
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lname"
                    placeholder="Enter last name"
                    value={formData.lname}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaEnvelope className="inline mr-2 text-emerald-500" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200
                      ${errors.email 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaMobileAlt className="inline mr-2 text-emerald-500" />
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Enter mobile number"
                    maxLength="10"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200
                      ${errors.phoneNumber 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      }`}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-2 text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FaLock className="inline mr-2 text-emerald-500" />
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  maxLength="25"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200
                    ${errors.password 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Password Requirements:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>Minimum 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>At least one uppercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>At least one lowercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>At least one number</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>At least one special character</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || registrationComplete}
              className="group relative w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden shadow-md"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Spinner size={4} color="text-white" />
                    <span>Creating Account...</span>
                  </>
                ) : registrationComplete ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Registration Complete!</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Create Account</span>
                    <FaArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
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
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Important Information</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                • All fields marked with <span className="text-red-500">*</span> are mandatory<br />
                • Super Admin has full system access<br />
                • Admin has limited access to specific modules
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistration;