"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { doUserLogout, getToken, getUserId } from '@/app/api/auth';
import { getAllCountry, getUserDashboardDetails, sendOtpFundRequest, validateOtp, sendOtpRequestwalletaddress, updatePassword, getProfileDetails } from '@/app/redux/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useDispatch as useReduxDispatch } from 'react-redux';
import Loader from '../../components/Loader';
import * as yup from "yup";
import { useFormik } from "formik";
import { FiUser, FiLock } from "react-icons/fi";
import { BASE_URL } from '@/app/constants/constant';

const isValidBep20Length = (value) => {
  if (!value) return true;
  return value && value.length >= 38 && value.length <= 44;
};

const passwordSchema = yup.object().shape({
  oldPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .required('New password is required')
    .min(4, 'Password must be at least 4 characters')
    .notOneOf([yup.ref('oldPassword')], 'New password must be different from current password'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
});

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "12px",
  fontWeight: 500,
  color: "#000",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--vi-card2, rgba(255,255,255,0.05))",
  border: "1px solid var(--vi-border, #374151)",
  borderRadius: "8px",
  color: "#000",
  fontSize: "13px",
  outline: "none",
  transition: "border-color 0.2s",
};

export default function Profile() {
  const dispatch = useReduxDispatch();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [fName, setfName] = useState('');
  const [lastName, setlastName] = useState("");
  const [email, setEmail] = useState('');
  const [loginId, setLoginId] = useState("");
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');

  const [userData, setUserData] = useState(null);
  const [greetingTime, setGreetingTime] = useState('');
  const [walletAddress, setWalletAddress] = useState("");
  const [originalWallet, setOriginalWallet] = useState("");
  const [address, setAddress] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isWalletSet, setIsWalletSet] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Password OTP flow
  const [isPasswordOtpSent, setIsPasswordOtpSent] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordOtpError, setPasswordOtpError] = useState("");
  const [isPasswordOtpLoading, setIsPasswordOtpLoading] = useState(false);
  const [isPasswordOtpVerified, setIsPasswordOtpVerified] = useState(false);

  const token = getToken();
  const { getAllCountryData, UserdashboardData, profileData } = useSelector((state) => state.auth);


  // Password change formik
  const AuthEmail = JSON.parse(localStorage.getItem("currentUserPlain"))?.userData?.AuthLogin;
  const passwordFormik = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      try {
        setIsPasswordLoading(true);
        setPasswordError(null);
        const data = {
          userId: loginId,
          oldPassword: values.oldPassword,
          newPass: values.newPassword
        };
        const result = await dispatch(updatePassword(data)).unwrap();
        if (result.statusCode === 200) {
          toast.success(result.message);
          passwordFormik.resetForm();
          
        } else if (result.statusCode === 409) {
          toast.error(result.message);
        } else if (result.error) {
          throw new Error(result.error.message || 'Password update failed');
        }
      } catch (err) {
        setPasswordError(err.message || 'An error occurred while updating password');
        toast.error(err.message || 'An error occurred while updating password');
      } finally {
        setIsPasswordLoading(false);
      }
    }
  });
  const profileDataLoading = async () => {
    try {
      const result = await dispatch(getProfileDetails()).unwrap();
      // Agar thunk response me data aa raha hai
      if (result) {

        const user = result?.[0] || result.payload;
        setUserData(user);

        setfName(user.FName || "");
        setlastName(user.LName || "");
        setEmail(user.Email || "");
        setPhone(user.Mobile || "");
        setCountry(user.CountryId || "");
        setWalletAddress(user.WalletBep20 || "");
        setOriginalWallet(user.WalletBep20 || "");
        setLoginId(user.AuthLogin || "");
        setAddress(user.Address || "");

        // Check wallet
        if (user.WalletBep20 && isValidBep20Length(user.WalletBep20)) {
          setIsWalletSet(true);
        }

        // Greeting
        const hour = new Date().getHours();

        if (hour < 12) {
          setGreetingTime("Good morning");
        } else if (hour < 18) {
          setGreetingTime("Good afternoon");
        } else {
          setGreetingTime("Good evening");
        }
      }
    } catch (e) {
      console.log("err =>", e);
    }
  };

  useEffect(() => {
    profileDataLoading();
  }, []);

  useEffect(() => {
    dispatch(getAllCountry());
    dispatch(getUserDashboardDetails());
  }, [dispatch]);
  const kid = UserdashboardData?.[0]?.Kid;

  const copyAffiliateCode = () => {
    const code = userData?.AuthLogin || '';
    navigator.clipboard.writeText(code);
    toast.success('Affiliate code copied');
  };

  const revealApiKey = () => {
    const apiKey = userData?.token || 'arb_live_a9x7k2m3n4p5q6r7s8t9';
    toast.success(`API Key: ${apiKey}`);
  };

  const signOut = (e) => {
    e.preventDefault();
    doUserLogout();
    router.push('/user/login');
  };

  // Format wallet address for display
  const formatWalletAddress = (address) => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSendOtp = async () => {
    if (!walletAddress) {
      toast.error("Please enter wallet address first");
      return;
    }

    if (!isValidBep20Length(walletAddress)) {
      toast.error("Wallet address must be 38-44 characters long");
      return;
    }

    try {
      setIsOtpLoading(true);
      const response = await dispatch(
        sendOtpRequestwalletaddress()
      ).unwrap();

      if (response?.statusCode === 200) {
        setIsOtpSent(true);
        toast.success(response?.data?.message || "OTP sent to your email");
      } else {
        toast.error(response?.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to send OTP");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleSendPasswordOtp = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordFormik.values;
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields first");
      return;
    }

    try {
      setIsPasswordOtpLoading(true);
      setPasswordOtpError("");

      const emailId = email || JSON.parse(localStorage.getItem("currentUserPlain"))?.userData?.AuthLogin;
      if (!emailId) {
        toast.error("Email not found");
        return;
      }

      const response = await dispatch(sendOtpFundRequest({ emailId })).unwrap();

      if (response?.statusCode === 200) {
        setIsPasswordOtpSent(true);
        setIsPasswordOtpVerified(false);
        toast.success("OTP sent to your email");
      } else {
        toast.error(response?.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to send OTP");
    } finally {
      setIsPasswordOtpLoading(false);
    }
  };

 

  const saveChanges = async () => {
    const walletChanged = originalWallet !== walletAddress;

    // Validate wallet if changed
    if (walletChanged) {
      if (walletAddress !== "" && !isValidBep20Length(walletAddress)) {
        toast.error("Please Enter a Valid BEP20 USDT Wallet Address");
        return;
      }

      if (walletAddress !== "" && !isOtpSent) {
        toast.error("Please verify your wallet address with OTP first");
        return;
      }

      if (isOtpSent && !otp) {
        setOtpError("Please enter the OTP");
        return;
      }
    }

    try {
      setIsSaveLoading(true);

  
      if (!userData) return;

      // Find the selected country object to get its ID
      const selectedCountry = getAllCountryData?.data?.find(
        (c) => c.country_Name === parseInt(country)
      );

      const payload = {
        loginID: loginId,
        fName: fName,
        lName: lastName,
        address: address,
        email: email,
        mobile: phone,
        countryid: parseInt(country) || null,
        walletBep20: walletAddress,
        updateprofileotp: otp
      };

      // Call update profile API
      const response = await fetch(
        `${BASE_URL}/Authentication/updateUserProfile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.statusCode !== 200) {
        throw new Error(result.message || 'Failed to update profile');
      }

      // Update localStorage after successful API response
      const storedData = JSON.parse(
        localStorage.getItem('currentUserPlain') || '{}'
      );

      localStorage.setItem(
        'currentUserPlain',
        JSON.stringify(storedData)
      );

      setOriginalWallet(walletAddress);

      // Set wallet as set if it's valid
      if (walletAddress && isValidBep20Length(walletAddress)) {
        setIsWalletSet(true);
      }

      // Reset OTP state
      setIsOtpSent(false);
      setOtp("");

      toast.success(result.message || 'Profile updated successfully');
    } catch (error) {
      console.error('Update Profile Error:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsSaveLoading(false);
    }
  };

  // Handle wallet address change
  const handleWalletChange = (e) => {
    const newValue = e.target.value;
    setWalletAddress(newValue);

    // Reset OTP state when wallet changes
    if (originalWallet !== newValue) {
      setIsOtpSent(false);
      setOtp("");
      setOtpError("");
    }
  };

  // Check if wallet has been changed
  const walletChanged = originalWallet !== walletAddress;

  // Determine if save button should be disabled
  const isSaveButtonDisabled = walletChanged
    ? !isValidBep20Length(walletAddress) ||
    (walletAddress !== "" && !isOtpSent)
    : false;

  const shouldShowOtpButton = walletChanged && walletAddress && !isOtpSent;

  // Check if all password fields are filled
  const arePasswordFieldsFilled = () => {
    const { oldPassword, newPassword, confirmPassword } = passwordFormik.values;
    return oldPassword && newPassword && confirmPassword;
  };

  return (
    <>
      <div id="p-profile" className="page">
        <div className="g21">
          <div>
            <div className="scard scc" style={{ marginBottom: "12px" }}>
              <div className='profile-flexing-heading'>
                <div className="pf-av">{fName?.charAt(0).toUpperCase() || 'A'}</div>
                <div style={{ width: "100%" }}>
                  <div style={{ fontSize: "18px", fontWeight: 900, letterSpacing: "-.3px", marginBottom: "3px" }}>
                    {fName || 'User'}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--t2)", marginBottom: "8px" }}>
                    {email} · {formatWalletAddress(userData?.WalletBep20)}
                  </div>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    <span className="tag tp">{userData?.Role === 'User' ? 'PRO' : userData?.Role}</span>
                    <span className="tag tg">{userData?.Email ? 'Verified' : 'Pending'}</span>
                    <span className="tag ta">Gold</span>
                  </div>
                </div>

                <div className="flexing-tab-btn">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="tag tg"
                    style={{
                      background: activeTab === "profile" ? "#672ACA" : "transparent",
                      color: activeTab === "profile" ? "#fff" : "var(--t2)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FiUser size={16} />
                    Profile Settings
                  </button>

                  <button
                    onClick={() => setActiveTab("password")}
                    className="tag tg"
                    style={{
                      background: activeTab === "password" ? "#672ACA" : "transparent",
                      color: activeTab === "password" ? "#fff" : "var(--t2)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FiLock size={16} />
                    Reset Password
                  </button>
                </div>
              </div>
              <hr />

              {/* Profile Form Fields - Only show when activeTab is 'profile' */}
              {activeTab === 'profile' && (
                <>
                  <div className="g2" style={{ gap: "10px", marginBottom: "12px", width: "100%" }}>

                    <div className="fg" style={{ margin: 0 }}>
                      <label className="fl">First Name</label>
                      <input
                        className="fi"
                        type="text"
                        value={fName}
                        readOnly={kid === 1}
                        style={{
                          cursor: kid === 1 ? 'not-allowed' : 'text',
                          backgroundColor: kid === 1 ? '#f5f5f5' : '#fff',
                        }}
                        onChange={(e) => setfName(e.target.value)}
                        placeholder="First name"
                      />
                    </div>



                    <div className="fg" style={{ margin: 0 }}>
                      <label className="fl">Last Name</label>
                      <input
                        className="fi"
                        type="text"
                        value={lastName}
                        readOnly={kid === 1}
                        style={{
                          cursor: kid === 1 ? 'not-allowed' : 'text',
                          backgroundColor: kid === 1 ? '#f5f5f5' : '#fff',
                        }}
                        onChange={(e) => setlastName(e.target.value)}
                        placeholder="Last name"
                      />
                    </div>

                    <div className="fg" style={{ margin: 0 }}>
                      <label className="fl">Phone</label>
                      <input
                        className="fi"
                        type="tel"
                        placeholder="+1 555 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="fg" style={{ margin: 0 }}>
                      <label className="fl">Country</label>
                      <select
                        className="fi"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      >
                        <option value="">Select Country</option>
                        {getAllCountryData?.data?.map((item) => (
                          <option key={item.country_Id} value={item.country_Id}>
                            {item.country_Name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="fg" style={{ margin: 0 }}>
                    <label className="fl">Email</label>
                    <input
                      className="fi"
                      type="email"
                      value={email}
                      readOnly={kid === 1}
                      style={{
                        cursor: kid === 1 ? 'not-allowed' : 'text',
                        backgroundColor: kid === 1 ? '#f5f5f5' : '#fff',
                      }}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="fg" style={{ margin: 0 }}>
                    <label className="fl mt-2">Address</label>
                    <input
                      className="fi"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  {/* Wallet Address Section with OTP */}
                  <div className="fg mb-4 mt-2" style={{ margin: 0 }}>
                    <label className="fl">
                      Wallet Address
                      {isWalletSet && !walletChanged && (
                        <span style={{ marginLeft: "8px", fontSize: "12px", color: "#10b981" }}>
                          ✓ Wallet is set
                        </span>
                      )}
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        className="fi"
                        type="text"
                        placeholder="BEP20 USDT Wallet Address"
                        value={walletAddress}
                        onChange={handleWalletChange}
                        disabled={isWalletSet && !walletChanged}
                        style={{
                          flex: 1,
                          ...(isWalletSet && !walletChanged ? { backgroundColor: "#f5f5f5" } : {})
                        }}
                      />
                      {shouldShowOtpButton && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={
                            !walletAddress ||
                            !isValidBep20Length(walletAddress) ||
                            isOtpLoading
                          }
                          className="btn btn-p"
                          style={{
                            padding: "8px 16px",
                            whiteSpace: "nowrap",
                            opacity:
                              !walletAddress ||
                                !isValidBep20Length(walletAddress) ||
                                isOtpLoading
                                ? 0.6
                                : 1,
                            cursor:
                              !walletAddress ||
                                !isValidBep20Length(walletAddress) ||
                                isOtpLoading
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {isOtpLoading ? "Sending..." : "Send OTP"}
                        </button>
                      )}
                    </div>
                    {walletAddress && !isValidBep20Length(walletAddress) && (
                      <p style={{ marginTop: "4px", fontSize: "12px", color: "#ef4444" }}>
                        Please enter a valid BEP20 USDT wallet address (38-44 characters)
                      </p>
                    )}
                  </div>

                  {/* OTP Input Field */}
                  {isOtpSent && walletChanged && (
                    <div className="fg" style={{ margin: "0 0 12px 0" }}>
                      <label className="fl">Enter OTP (Sent to Email)</label>
                      <input
                        className="fi"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setOtp(value);
                          setOtpError("");
                        }}
                      />
                      {otpError && (
                        <p style={{ marginTop: "4px", fontSize: "12px", color: "#ef4444" }}>
                          {otpError}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    className="btn btn-p"
                    style={{ padding: "9px 24px" }}
                    onClick={saveChanges}
                    disabled={isSaveButtonDisabled || isSaveLoading}
                  >
                    {isSaveLoading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}

              {/* Reset Password Form - Only show when activeTab is 'password' */}
              {activeTab === 'password' && (
                <>
                  <div style={{ marginBottom: "20px", marginTop: "10px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>Change Password</h3>
                    <p style={{ fontSize: "13px", color: "var(--t2)" }}>Update your password to keep your account secure</p>
                  </div>

                  <form
                    onSubmit={passwordFormik.handleSubmit}
                    style={{ padding: "4px 0", display: "flex", flexDirection: "column", gap: "16px" }}
                  >
                    {/* Current Password */}
                    <div>
                      <label htmlFor="oldPassword" style={labelStyle}>Current Password</label>
                      <input
                        type="password"
                        id="oldPassword"
                        name="oldPassword"
                        style={inputStyle}
                        placeholder="Enter current password"
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        value={passwordFormik.values.oldPassword}
                        onFocus={e => e.target.style.borderColor = "#10b981"}
                        onBlurCapture={e => e.target.style.borderColor = "var(--vi-border, #374151)"}
                      />
                      {passwordFormik.touched.oldPassword && passwordFormik.errors.oldPassword && (
                        <p style={{ marginTop: "4px", fontSize: "11px", color: "#ef4444" }}>
                          {passwordFormik.errors.oldPassword}
                        </p>
                      )}
                    </div>

                    {/* New + Confirm - side by side */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label htmlFor="newPassword" style={labelStyle}>New Password</label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          style={inputStyle}
                          placeholder="Enter new password"
                          onChange={passwordFormik.handleChange}
                          onBlur={passwordFormik.handleBlur}
                          value={passwordFormik.values.newPassword}
                          onFocus={e => e.target.style.borderColor = "#10b981"}
                          onBlurCapture={e => e.target.style.borderColor = "var(--vi-border, #374151)"}
                        />
                        {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                          <p style={{ marginTop: "4px", fontSize: "11px", color: "#ef4444" }}>
                            {passwordFormik.errors.newPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          style={inputStyle}
                          placeholder="Confirm new password"
                          onChange={passwordFormik.handleChange}
                          onBlur={passwordFormik.handleBlur}
                          value={passwordFormik.values.confirmPassword}
                          onFocus={e => e.target.style.borderColor = "#10b981"}
                          onBlurCapture={e => e.target.style.borderColor = "var(--vi-border, #374151)"}
                        />
                        {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                          <p style={{ marginTop: "4px", fontSize: "11px", color: "#ef4444" }}>
                            {passwordFormik.errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* OTP Section - Clean Layout */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginTop: "8px",
                      borderTop: "1px solid #e5e7eb",
                      paddingTop: "16px"
                    }}>
                      {/* Send OTP Button - Only show if OTP not sent */}
                    
                      {isPasswordOtpSent && !isPasswordOtpVerified && (
                        <div style={{
                          background: "#faf9fc",
                          border: "1px solid #ece9f5",
                          borderRadius: "10px",
                          padding: "16px 18px",
                        }}>
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginBottom: "10px",
                          }}>
                            <label htmlFor="passwordOtp" style={{ ...labelStyle, marginBottom: 0 }}>
                              Enter OTP
                            </label>
                            <span style={{ fontSize: "11px", color: "var(--t2, #6b7280)" }}>
                              Sent to your email
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: "10px" }}>
                            <input
                              type="text"
                              id="passwordOtp"
                              name="passwordOtp"
                              placeholder="6-digit code"
                              value={passwordOtp}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setPasswordOtp(value);
                                setPasswordOtpError("");
                              }}
                              style={{
                                ...inputStyle,
                                flex: 1,
                                textAlign: "center",
                                letterSpacing: "3px",
                                fontWeight: 600,
                                border: passwordOtpError ? "1px solid #ef4444" : inputStyle.border,
                              }}
                            />
                            <button
                              type="button"
                              disabled={isPasswordOtpLoading || !passwordOtp}
                              style={{
                                padding: "0 22px",
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#fff",
                                background: isPasswordOtpLoading || !passwordOtp ? "#d1d5db" : "#672ACA",
                                border: "none",
                                borderRadius: "8px",
                                cursor: isPasswordOtpLoading || !passwordOtp ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {isPasswordOtpLoading ? "Verifying..." : "Verify"}
                            </button>
                          </div>

                          {passwordOtpError && (
                            <p style={{ fontSize: "12px", color: "#ef4444", margin: "8px 0 0" }}>
                              {passwordOtpError}
                            </p>
                          )}

                          {/* Resend OTP */}
                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                            <button
                              type="button"
                              onClick={handleSendPasswordOtp}
                              disabled={isPasswordOtpLoading}
                              style={{
                                padding: 0,
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#672ACA",
                                background: "transparent",
                                border: "none",
                                cursor: isPasswordOtpLoading ? "not-allowed" : "pointer",
                                textDecoration: "underline",
                              }}
                            >
                              {isPasswordOtpLoading ? "Sending..." : "Resend OTP"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Change Password Button - Show after OTP verified */}
                      {/* {isPasswordOtpVerified && ( */}
                        <button
                          type="submit"
                          disabled={isPasswordLoading}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            fontWeight: 600,
                            fontSize: "15px",
                            color: "#fff",
                            background: isPasswordLoading ? "#a78bfa" : "#10b981",
                            border: "none",
                            borderRadius: "8px",
                            cursor: isPasswordLoading ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                            marginTop: "4px",
                          }}
                        >
                          {isPasswordLoading ? 'Updating...' : 'Change Password'}
                        </button>
                      {/* )} */}
                    </div>
                  </form>

                  {passwordError && (
                    <p style={{ fontSize: "12px", color: "#ef4444", textAlign: "center", marginTop: "12px" }}>
                      {passwordError}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="scard scc">
              <div className="st" style={{ marginBottom: "10px" }}>Affiliate Code</div>
              <div className="ref-link" style={{ marginBottom: "8px" }}>{userData?.AuthLogin || 'ARB-a9x7k2'}</div>
              <button className="btn btn-g2" style={{ width: "100%", padding: "8px", fontSize: "12px" }} onClick={copyAffiliateCode}>
                📋 Copy Code
              </button>
            </div>

            <button
              className="btn btn-danger"
              style={{ width: "100%", padding: "10px", textDecoration: "none" }}
              onClick={signOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}