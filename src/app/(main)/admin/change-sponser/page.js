'use client'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  usernameLoginId,
  ChangeAdminSponser,
} from '@/app/redux/slices/adminMasterSlice'
import { toast } from 'react-toastify'
import Spinner from '@/app/common/spinner'

const ChangeSponser = () => {
  const dispatch = useDispatch()
  const { usernameData, loading, error, sponserData } = useSelector(
    (state) => state.adminMaster,
  )
  const [authLogin, setAuthLogin] = useState('')
  const [sponsorAuthLogin, setSponsorAuthLogin] = useState('')
  const [touched, setTouched] = useState(false)
  const [userName, setUserName] = useState('')
  const [sponsorName, setSponsorName] = useState('')
  const [lvlopen, setLvlopen] = useState(0)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (authLogin && authLogin.trim()) {
        await dispatch(usernameLoginId(authLogin)).then((res) => {
          setUserName(res.payload?.name || res.payload?.userName || '')

          if (!res.payload) {
            setErrors({ authLogin: 'User not found' })
          } else {
            setErrors({})
          }
        })

        setTouched(true)
      } else {
        setUserName('')
      }
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [authLogin, dispatch])

  const handleUserIdChange = (e) => {
    setAuthLogin(e.target.value)
    setErrors((prev) => ({ ...prev, title: undefined }))
  }
  const handleSponsorIdChange = (e) => {
    setSponsorAuthLogin(e.target.value)
    setErrors((prev) => ({ ...prev, sponsor: undefined }))
    if (e.target.value && e.target.value.trim()) {
      dispatch(usernameLoginId(e.target.value)).then((res) => {
        setSponsorName(res.payload?.name || res.payload?.userName || '')
      })
    } else {
      setSponsorName('')
    }
  }
  const handleBlurOrFetch = () => {
    if (authLogin && authLogin.trim()) {
      dispatch(usernameLoginId(authLogin)).then((res) => {
        setUserName(res.payload?.name || res.payload?.userName || '')
      })
      setTouched(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let newErrors = {}
    if (!authLogin.trim()) newErrors.title = 'UserId is required'
    if (!sponsorAuthLogin.trim())
      newErrors.sponsor = 'Sponsor User ID is required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    if (!userName) {
      toast.warn('Please enter a valid User ID')
      return
    }
    if (!sponsorAuthLogin || !sponsorAuthLogin.trim()) {
      toast.warn('Please enter a Sponsor User ID')
      return
    }
    if (authLogin.trim() === sponsorAuthLogin.trim()) {
      toast.warn('UserID and SponserID should not be the same')
      return
    }

    try {
      const result = await dispatch(
        ChangeAdminSponser({ authLogin, sponsorAuthLogin, lvlopen }),
      )
      const payload = result.payload
      const statusCode =
        payload?.statusCode || (payload?.data && payload.data[0]?.statusCode)
      const message =
        payload?.message || (payload?.data && payload.data[0]?.message)
      if (statusCode === 1 || statusCode === 200) {
        toast.success(message || 'Sponsor changed successfully!')
        setAuthLogin('')
        setSponsorAuthLogin('')
        setTouched(false)
        setUserName('')
        setSponsorName('')
      } else {
        toast.error(message || 'Failed to change sponsor. Please try again.')
      }
    } catch (error) {
      toast.error(
        'Error changing sponsor: ' + (error.message || 'Unknown error'),
      )
    }
  }

  return (
    <div>
      <div>
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg transform transition-transform hover:scale-105 duration-300 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M15 11a4 4 0 100-8 4 4 0 000 8zM9 11a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Change Sponsor
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Update sponsor association for any user
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Sponsor Details</h2>
            <p className="text-emerald-100 text-sm mt-1">Enter user and sponsor information below</p>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            {/* User ID Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-md font-semibold text-gray-800 dark:text-white">User Information</h3>
              </div>
              
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    User ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    value={authLogin}
                    onChange={handleUserIdChange}
                    onBlur={handleBlurOrFetch}
                    placeholder="Enter user ID"
                  />
                  {errors.authLogin && (
                    <p className="mt-2 text-sm text-red-500">{errors.authLogin}</p>
                  )}
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    User Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    value={touched && userName ? userName : ''}
                    readOnly
                    placeholder="User name will appear here"
                  />
                </div>
              </div>
            </div>

            {/* Sponsor Section */}
            {userName && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-5 border border-emerald-100 dark:border-gray-700 animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-md font-semibold text-gray-800 dark:text-white">Sponsor Information</h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Sponsor User ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                      value={sponsorAuthLogin}
                      onChange={handleSponsorIdChange}
                      placeholder="Enter sponsor user ID"
                      required
                    />
                    {errors.sponsor && (
                      <p className="mt-2 text-sm text-red-500">{errors.sponsor}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Sponsor Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      value={sponsorName}
                      readOnly
                      placeholder="Sponsor name will appear here"
                    />
                  </div>
                </div>

                {/* Level Open Checkbox */}
                <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={lvlopen === 1}
                        onChange={(e) => setLvlopen(e.target.checked ? 1 : 0)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 transition-colors">
                      Level Open
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (Enable this option to open sponsor level)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="group relative w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
              disabled={!!errors.authLogin}
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Spinner size={4} color="text-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Change Sponsor'
                )}
              </span>
            </button>

            {/* Error Messages */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Important Information</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                • User ID and Sponsor ID cannot be the same<br />
                • Both User ID and Sponsor ID must be valid registered users<br />
                • Level Open option controls sponsor hierarchy level access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangeSponser