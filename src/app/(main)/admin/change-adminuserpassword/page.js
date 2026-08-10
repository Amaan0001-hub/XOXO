
// /app/admin/change-adminuserpassword/page.js
'use client'

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChangePasswordAdminUserMaster } from '@/app/redux/slices/adminMasterSlice';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { isValidPassword } from '@/app/constants/validationHelpers';
import Spinner from '@/app/common/spinner';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaKey, FaShieldAlt, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { RiLockPasswordLine, RiShieldKeyholeLine } from "react-icons/ri";

const ChangePassword = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.adminMaster);

  const [formData, setFormData] = useState({
    userId: '',        // Maps to @LoginID
    oldPassword: '',   // Maps to @OldPassword
    newPass: ''        // Maps to @newPassword
  });

  const [errors, setErrors] = useState({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userId)) {
      newErrors.userId = 'User ID can only contain letters, numbers, and underscores';
    }

    // Validate old password
    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = 'Current password is required';
    } else {
      const oldPasswordError = isValidPassword(formData.oldPassword);
      if (oldPasswordError) {
        newErrors.oldPassword = oldPasswordError;
      }
    }

    // Validate new password
    if (!formData.newPass.trim()) {
      newErrors.newPass = 'New password is required';
    } else {
      const newPasswordError = isValidPassword(formData.newPass);
      if (newPasswordError) {
        newErrors.newPass = newPasswordError;
      } else if (formData.newPass === formData.oldPassword) {
        newErrors.newPass = 'New password must be different from old password';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data matching the API/Stored Procedure parameters
      const requestData = {
        UserId: formData.userId,        // Maps to @LoginID
        OldPassword: formData.oldPassword, // Maps to @OldPassword
        NewPass: formData.newPass        // Maps to @newPassword
      };
      
      const result = await dispatch(ChangePasswordAdminUserMaster(requestData)).unwrap();
      
      // Check if the API response indicates success
      if (result && (result.statusCode === 200 || result.success === true)) {
        toast.success(result.message || 'Password updated successfully');
        setFormData({
          userId: '',
          oldPassword: '',
          newPass: ''
        });
        setErrors({});
      } else if (result && result.statusCode === 400) {
        // Handle validation errors from API
        if (result.errors) {
          const apiErrors = {};
          Object.keys(result.errors).forEach(key => {
            // Map API field names to form field names
            if (key === 'UserId') apiErrors.userId = result.errors[key][0];
            else if (key === 'OldPassword') apiErrors.oldPassword = result.errors[key][0];
            else if (key === 'NewPass') apiErrors.newPass = result.errors[key][0];
            else apiErrors[key] = result.errors[key][0];
          });
          setErrors(apiErrors);
          toast.error('Please fix the validation errors');
        } else {
          toast.error(result.message || 'Validation failed');
        }
      } else if (result && result.statusCode === 409) {
        toast.error(result.message || 'Current password is incorrect');
      } else {
        toast.error(result?.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password change failed:', error);
      if (typeof error === 'string') {
        toast.error(error);
      } else if (error?.message) {
        toast.error(error.message);
      } else if (error?.errors) {
        const apiErrors = {};
        Object.keys(error.errors).forEach(key => {
          if (key === 'UserId') apiErrors.userId = error.errors[key][0];
          else if (key === 'OldPassword') apiErrors.oldPassword = error.errors[key][0];
          else if (key === 'NewPass') apiErrors.newPass = error.errors[key][0];
          else apiErrors[key] = error.errors[key][0];
        });
        setErrors(apiErrors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error('Failed to update password. Please try again.');
      }
    }
  };

  return (
    <div>
      <div>
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg transform transition-transform hover:scale-105 duration-300 mb-4">
            <RiShieldKeyholeLine className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Change User Password
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 flex items-center justify-center gap-2">
            <FaShieldAlt className="text-emerald-500" />
            Update your account password securely
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RiLockPasswordLine className="text-xl" />
              Password Settings
            </h2>
            <p className="text-emerald-100 text-sm mt-1">Enter your credentials to change password</p>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && typeof error === 'string' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* User ID Field */}
              <div>
                <label htmlFor="userId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaUser className="inline mr-2 text-emerald-500" />
                  User ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="userId"
                    name="userId"
                    type="text"
                    value={formData.userId}
                    onChange={handleChange}
                    placeholder="Enter user ID"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200
                      ${errors.userId 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      }`}
                  />
                </div>
                {errors.userId && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <FaCheckCircle className="text-xs" />
                    {errors.userId}
                  </p>
                )}
              </div>

              {/* Old Password Field */}
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaLock className="inline mr-2 text-emerald-500" />
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="oldPassword"
                    name="oldPassword"
                    type={showOldPassword ? 'text' : 'password'}
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200
                      ${errors.oldPassword 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showOldPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.oldPassword && (
                  <p className="mt-2 text-sm text-red-500">{errors.oldPassword}</p>
                )}
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label htmlFor="newPass" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FaKey className="inline mr-2 text-emerald-500" />
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPass"
                  name="newPass"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPass}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200
                    ${errors.newPass 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPass && (
                <p className="mt-2 text-sm text-red-500">{errors.newPass}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
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
              disabled={loading}
              className="group relative w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden shadow-md"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Spinner />
                    <span>Changing Password...</span>
                  </>
                ) : (
                  <>
                    <FaArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                    Change User Password
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FaShieldAlt className="text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">Security Tip</h4>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                • Never share your password with anyone<br />
                • Use a unique password that you don't use elsewhere<br />
                • Change your password regularly for better security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;