'use client'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  usernameLoginId,
  clearUsernameData,
} from '@/app/redux/slices/adminMasterSlice'
import { updateUser, getAllCountry, updateUserAdmin } from '@/app/redux/slices/authSlice'
import { toast } from 'react-toastify'
import Select from 'react-select'
import Spinner from '@/app/common/spinner'

// Modern label style matching the second image
const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#1a1a2e",
  letterSpacing: "0.02em",
}

// Modern input style
const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  background: "#f8f9fc",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  color: "#1a1a2e",
  fontSize: "14px",
  outline: "none",
  transition: "all 0.3s ease",
  fontFamily: "'Inter', sans-serif",
}

const CountryOption = ({ innerProps, data, isFocused }) => (
  <div
    {...innerProps}
    style={{
      display: "flex",
      alignItems: "center",
      padding: "10px 14px",
      cursor: "pointer",
      backgroundColor: isFocused ? "#f0f4ff" : "transparent",
      borderBottom: "1px solid #f0f0f0",
    }}
  >
    {data.countryFlag && (
      <img
        src={data.countryFlag}
        alt={`${data.label} flag`}
        style={{ width: "24px", height: "16px", marginRight: "10px", borderRadius: "4px" }}
      />
    )}
    <span style={{ color: "#1a1a2e", fontSize: "14px" }}>{data.label}</span>
  </div>
)

const CountrySingleValue = ({ data }) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    {data.countryFlag && (
      <img
        src={data.countryFlag}
        alt={`${data.label} flag`}
        style={{ width: "24px", height: "16px", marginRight: "10px", borderRadius: "4px" }}
      />
    )}
    <span style={{ color: "#1a1a2e", fontSize: "14px" }}>{data.label}</span>
  </div>
)

const EditUser = () => {
  const dispatch = useDispatch()
  const [userIdError, setUserIdError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { usernameData, error: usernameError } = useSelector(
    (state) => state.adminMaster,
  )
  const { updateUserData, loading, error, getAllCountryData } = useSelector((state) => state.auth)

  const [authLogin, setAuthLogin] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [countryCode, setCountryCode] = useState('')

  const [fields, setFields] = useState({
    loginID: '',
    name: '',
    fName: '',
    lName: '',
    email: '',
    address: '',
    mobile: '',
    countryid: 0,
    walletBep20: '',
    authPass: '',
  })

  useEffect(() => {
    dispatch(getAllCountry())
  }, [dispatch])
  useEffect(() => {
    resetForm()
  }, [])
  useEffect(() => {
    if (usernameError) {
      toast.error(usernameError.message || 'Invalid User ID')
      setFields({
        loginID: '',
        name: '',
        fName: '',
        lName: '',
        email: '',
        address: '',
        mobile: '',
        countryid: 0,
        walletBep20: '',
        authPass: '',
      })
      setSelectedCountry(null)
      setCountryCode('')
      setIsSearching(false)
    }
  }, [usernameError])

  useEffect(() => {
    if (usernameData) {
      setFields({
        name: usernameData.name || '',
        fName: usernameData.fName || '',
        lName: usernameData.lName || '',
        email: usernameData.email || '',
        address: usernameData.address || '',
        mobile: usernameData.mobile || '',
        countryid: usernameData.countryId || 0,
        walletBep20: usernameData.walletBep20 || '',
        authPass: usernameData.authPass || '',
      })

      if (usernameData.country_Name && getAllCountryData?.data) {
        const countryFromList = getAllCountryData.data.find(
          country => country.country_Name?.toLowerCase() === usernameData.country_Name?.toLowerCase()
        )

        const countryOption = {
          value: usernameData.countryId,
          label: usernameData.country_Name,
          countryFlag: countryFromList?.countryFlag || '',
          countryCode: usernameData.phonecode,
        }

        setSelectedCountry(countryOption)
        setCountryCode(usernameData.phonecode)
      } else if (usernameData.country_Name) {
        const countryOption = {
          value: usernameData.countryId,
          label: usernameData.country_Name,
          countryFlag: '',
          countryCode: usernameData.phonecode,
        }
        setSelectedCountry(countryOption)
        setCountryCode(usernameData.phonecode)
      }
      setIsSearching(false)
    }
  }, [usernameData, getAllCountryData])

  const resetForm = () => {
    setFields({
      loginID: '',
      name: '',
      fName: '',
      lName: '',
      email: '',
      address: '',
      mobile: '',
      countryid: 0,
      walletBep20: '',
      authPass: '',
    })

    setAuthLogin('')
    setSelectedCountry(null)
    setCountryCode('')
    setUserIdError('')
    setIsSearching(false)

    dispatch(clearUsernameData())
  }
  const handleUserIdChange = (e) => {
    setAuthLogin(e.target.value)
    setUserIdError('')
    // Clear previous user data when typing new ID
    setFields({
      name: '',
      fName: '',
      lName: '',
      email: '',
      address: '',
      mobile: '',
      walletBep20: '',
      countryid: 0,
      authPass: '',
    })
    setSelectedCountry(null)
    setCountryCode('')
  }

  const handleSearchUser = async () => {
    if (!authLogin || !authLogin.trim()) {
      toast.error('Please enter a User ID')
      return
    }

    setIsSearching(true)
    setUserIdError('')

    try {
      const result = await dispatch(usernameLoginId(authLogin))

      if (result.payload === null) {
        setUserIdError("User ID doesn't exist")
        setFields({
          loginID: '',
          name: '',
          fName: '',
          lName: '',
          email: '',
          address: '',
          mobile: '',
          countryid: 0,
          walletBep20: '',
          authPass: '',
        })
        setSelectedCountry(null)
        setCountryCode('')
        setIsSearching(false)
      } else {
        setUserIdError('')
        // Data will be populated by the useEffect
      }
    } catch (error) {
      setUserIdError("User ID doesn't exist")
      setIsSearching(false)
    }
  }

  const handleFieldChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value })
  }

  const handleCountryChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedCountry(selectedOption)
      setFields({
        ...fields,
        countryid: selectedOption.value,
      })
      setCountryCode(selectedOption.countryCode)
    }
  }

  const insecureNumbers = ["123456", "123456789", "123123", "password", "qwerty"]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!usernameData) {
      toast.error('Please search and select a valid User ID first')
      return
    }

    if (!fields.fName.trim()) {
      toast.error('Please enter First Name')
      return
    }
    if (!fields.lName.trim()) {
      toast.error('Please enter Last Name')
      return
    }
    if (!fields.email.trim()) {
      toast.error('Please enter Email')
      return
    }
    if (!fields.mobile.trim()) {
      toast.error('Please enter Mobile Number')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(fields.email)) {
      toast.error('Please enter a valid Email')
      return
    }

    const mobileRegex = /^[0-9]{7,12}$/
    if (!mobileRegex.test(fields.mobile)) {
      toast.error('Enter a valid phone number (7 to 12 digits)!')
      return
    }
    if (insecureNumbers.includes(fields.mobile.trim())) {
      toast.error("This mobile number is too common and insecure!")
      return false
    }

    const payload = {
      loginID: authLogin,
      fName: fields.fName,
      lName: fields.lName,
      address: fields.address,
      email: fields.email,
      mobile: fields.mobile,
      countryid: fields.countryid,
      walletBep20: fields.walletBep20,
      authPass: fields.authPass,
    }

    const result = await dispatch(updateUserAdmin(payload)).unwrap()
    if (result.statusCode === 200) {
      toast.success(result?.message || "Success");
      resetForm();
    }
  }

  const countryOptions =
    getAllCountryData?.data?.map((country) => ({
      value: country.country_Id,
      label: country.country_Name,
      countryFlag: country.countryFlag,
      countryCode: country.phonecode,
    })) || []

  // Modern react-select styles
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "48px",
      borderRadius: "10px",
      borderWidth: "1px",
      borderColor: state.isFocused ? "#6C63FF" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(108, 99, 255, 0.1)" : "none",
      backgroundColor: "#f8f9fc",
      "&:hover": {
        borderColor: "#6C63FF",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 12px",
      display: "flex",
      alignItems: "center",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
      padding: "0px",
      color: "#1a1a2e",
      fontSize: "14px",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "48px",
    }),
    singleValue: (provided) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      color: "#1a1a2e !important",
      fontSize: "14px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#a0aec0",
      fontSize: "14px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      zIndex: 20,
      marginTop: "4px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#6C63FF"
        : state.isFocused
          ? "#f0f4ff"
          : "transparent",
      color: state.isSelected ? "#fff" : "#1a1a2e",
      padding: "10px 14px",
      fontSize: "14px",
      "&:active": {
        backgroundColor: state.isSelected ? "#6C63FF" : "#e8ecf1",
      },
    }),
  }

  return (
    <div style={{
      maxWidth: "900px",
      margin: "0 auto",
      padding: "20px 0"
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        border: "1px solid #f0f0f0",
        overflow: "hidden"
      }}>
        {/* Header with gradient - matching second image style */}
        <div style={{
          padding: "28px 32px 24px",
          background: "#1C988E",
          position: "relative"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <h2 style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#fff",
                margin: "0 0 4px 0",
                letterSpacing: "-0.5px"
              }}>
                Edit User Profile
              </h2>
              <p style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.8)",
                margin: 0
              }}>
                Update user information and manage account details
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px 32px" }}>
          {/* Search User ID Section */}
          <div style={{
            background: "#f8faff",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "28px",
            border: "1px dashed #dce3f0"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: usernameData ? "1fr auto 1fr" : "1fr auto",
              gap: "16px",
              alignItems: "end"
            }}>
              <div>
                <label style={{
                  ...labelStyle,
                  color: "#4a5568",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  User ID *
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    style={{
                      ...inputStyle,
                      borderColor: userIdError ? "#fc8181" : "#e2e8f0",
                      background: "#fff",
                      flex: 1
                    }}
                    value={authLogin}
                    onChange={handleUserIdChange}
                    placeholder="Enter User ID to search"
                    disabled={isSearching}
                  />
                  <button
                    type="button"
                    onClick={handleSearchUser}
                    disabled={isSearching || !authLogin.trim()}
                    style={{
                      padding: "12px 24px",
                      background: isSearching || !authLogin.trim() ? "#cbd5e0" : "#1C988E",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      cursor: isSearching || !authLogin.trim() ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      transition: "all 0.3s ease",
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    {isSearching ? "Searching..." : "Search User"}
                  </button>
                </div>
                {userIdError && (
                  <div style={{ marginTop: "6px", fontSize: "12px", color: "#fc8181" }}>
                    ⚠️ {userIdError}
                  </div>
                )}
              </div>

              {usernameData && (
                <div>
                  <label style={{
                    ...labelStyle,
                    color: "#4a5568",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    User Name
                  </label>
                  <input
                    type="text"
                    style={{
                      ...inputStyle,
                      background: "#edf2f7",
                      borderColor: "#e2e8f0",
                      cursor: "not-allowed",
                      color: "#4a5568"
                    }}
                    value={fields.name}
                    readOnly
                  />
                </div>
              )}
            </div>
          </div>

          {/* Registration Details Section */}
          {usernameData && (
            <>
              <form onSubmit={handleSubmit}>
                {/* Referral User Information - Matching second image */}
                <div style={{
                  background: "#fafcff",
                  borderRadius: "12px",
                  padding: "20px 24px",
                  marginBottom: "24px",
                  border: "1px solid #eef2f7"
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{
                        ...labelStyle,
                        color: "#4a5568",
                        fontSize: "12px",
                        textTransform: "uppercase"
                      }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        style={inputStyle}
                        name="fName"
                        value={fields.fName}
                        onChange={handleFieldChange}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label style={{
                        ...labelStyle,
                        color: "#4a5568",
                        fontSize: "12px",
                        textTransform: "uppercase"
                      }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        style={inputStyle}
                        name="lName"
                        value={fields.lName}
                        onChange={handleFieldChange}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Other fields in a clean grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{
                      ...labelStyle,
                      color: "#4a5568",
                      fontSize: "12px",
                      textTransform: "uppercase"
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      style={inputStyle}
                      name="email"
                      value={fields.email}
                      onChange={handleFieldChange}
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label style={{
                      ...labelStyle,
                      color: "#4a5568",
                      fontSize: "12px",
                      textTransform: "uppercase"
                    }}>
                      Country
                    </label>
                    <Select
                      options={countryOptions}
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      placeholder="Select Country"
                      classNamePrefix="select"
                      components={{
                        Option: CountryOption,
                        SingleValue: CountrySingleValue,
                      }}
                      styles={selectStyles}
                      isSearchable
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{
                      ...labelStyle,
                      color: "#4a5568",
                      fontSize: "12px",
                      textTransform: "uppercase"
                    }}>
                      Code
                    </label>
                    <input
                      type="text"
                      value={countryCode ? `+${countryCode}` : '+0'}
                      readOnly
                      style={{
                        ...inputStyle,
                        background: "#edf2f7",
                        borderColor: "#e2e8f0",
                        cursor: "not-allowed",
                        color: "#4a5568"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      ...labelStyle,
                      color: "#4a5568",
                      fontSize: "12px",
                      textTransform: "uppercase"
                    }}>
                      Mobile *
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      name="mobile"
                      value={fields.mobile}
                      onChange={handleFieldChange}
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{
                      ...labelStyle,
                      color: "#4a5568",
                      fontSize: "12px",
                      textTransform: "uppercase"
                    }}>
                      Address
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      name="address"
                      value={fields.address}
                      onChange={handleFieldChange}
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <label style={{
                      ...labelStyle,
                      color: "#4a5568",
                      fontSize: "12px",
                      textTransform: "uppercase"
                    }}>
                      Wallet BEP20
                    </label>
                    <input
                      type="text"
                      style={inputStyle}
                      name="walletBep20"
                      value={fields.walletBep20}
                      onChange={handleFieldChange}
                      placeholder="Enter wallet address"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    ...labelStyle,
                    color: "#4a5568",
                    fontSize: "12px",
                    textTransform: "uppercase"
                  }}>
                    Auth Pass
                  </label>
                  <input
                    type="text"
                    readOnly
                    style={{
                      ...inputStyle,
                      background: "#edf2f7",
                      borderColor: "#e2e8f0",
                      cursor: "not-allowed",
                      color: "#4a5568"
                    }}
                    name="authPass"
                    value={fields.authPass}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "14px 24px",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#fff",
                    background: "#1C988E",
                    border: "none",
                    borderRadius: "10px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 14px rgba(108, 99, 255, 0.3)",
                    fontFamily: "'Inter', sans-serif"
                  }}
                  disabled={loading}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = "translateY(-2px)"
                      e.target.style.boxShadow = "0 6px 20px rgba(108, 99, 255, 0.4)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)"
                    e.target.style.boxShadow = "0 4px 14px rgba(108, 99, 255, 0.3)"
                  }}
                >
                  {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                      <Spinner size={4} color="text-white" />
                      <span>Updating Profile...</span>
                    </div>
                  ) : "Update Profile"}
                </button>
              </form>
            </>
          )}

          {error && (
            <div style={{
              marginTop: "16px",
              padding: "12px 16px",
              background: "#fff5f5",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#fc8181",
              border: "1px solid #fed7d7"
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditUser