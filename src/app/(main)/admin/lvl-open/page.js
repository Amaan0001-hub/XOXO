
'use client'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { usernameLoginId } from '@/app/redux/slices/adminMasterSlice'
import { LvlOpen as LevelOpenAction } from '@/app/redux/slices/adminMasterSlice'
import { toast } from 'react-toastify'
import Spinner from '@/app/common/spinner'

const LvlOpen = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.adminMaster)

  const [authLogin, setAuthLogin] = useState('')
  const [touched, setTouched] = useState(false)
  const [userName, setUserName] = useState('')
  const [lvlopen, setLvlopen] = useState(0)
  const [errors, setErrors] = useState({})

  // Auto fetch user details
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
    }, 200)
    return () => clearTimeout(timeoutId)
  }, [authLogin, dispatch])

  const handleUserIdChange = (e) => {
    setAuthLogin(e.target.value)
    setErrors((prev) => ({ ...prev, authLogin: undefined }))
  }

  const handleBlurOrFetch = () => {
    if (authLogin && authLogin.trim()) {
      dispatch(usernameLoginId(authLogin)).then((res) => {
        setUserName(res.payload?.name || res.payload?.userName || '')
      })
      setTouched(true)
    }
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    let newErrors = {}

    if (!authLogin.trim()) {
      newErrors.authLogin = 'User ID is required'
    }

    if (lvlopen !== 1) {
      newErrors.lvlopen = 'Please enable Level Open'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    if (!userName) {
      toast.warn('Please enter a valid User ID')
      return
    }

    try {
      const result = await dispatch(
        LevelOpenAction({ authLogin: authLogin })
      )

      const payload = result.payload
      const statusCode = payload?.statusCode || payload?.data?.[0]?.statusCode
      const message = payload?.message || payload?.data?.[0]?.message

      if (statusCode === 1 || statusCode === 200) {
        toast.success(message || 'Level opened successfully!')

        setAuthLogin('')
        setTouched(false)
        setUserName('')
        setLvlopen(0)
      } else {
        toast.error(message || 'Failed to open level.')
      }
    } catch (error) {
      toast.error(
        'Error opening level: ' + (error.message || 'Unknown error')
      )
    }
  }

  return (
    <div className="flex items-center justify-center p-0 mx-auto mt-0">
      <div className="relative w-full max-w-2xl p-8 bg-white border shadow-xl rounded-2xl">

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-20 h-20 border-2 border-blue-200 rounded-full bg-blue-50">
            <svg
              className="w-10 h-10 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M15 11a4 4 0 100-8 4 4 0 000 8zM9 11a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mt-2 mb-6 text-2xl font-bold text-center text-gray-800">
          Open Level
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* USER ID + NAME */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                User ID
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={authLogin}
                onChange={handleUserIdChange}
                onBlur={handleBlurOrFetch}
                placeholder="Enter User ID"
              />
              {errors.authLogin && (
                <p className="mt-1 text-sm text-red-500">{errors.authLogin}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                User Name
              </label>
              <input
                type="text"
                readOnly
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50"
                value={touched && userName ? userName : ''}
                placeholder="User Name"
              />
            </div>
          </div>

          {/* LEVEL OPEN CHECKBOX */}
          {userName && (
            <div className="mt-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={lvlopen === 1}
                  onChange={(e) => setLvlopen(e.target.checked ? 1 : 0)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                Level Open
              </label>

              {errors.lvlopen && (
                <p className="mt-1 text-sm text-red-500">{errors.lvlopen}</p>
              )}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full py-3 mt-6 text-lg font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!!errors.authLogin}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size={4} color="text-white" />
                <span>Processing...</span>
              </div>
            ) : (
              'Submit'
            )}
          </button>
        </form>

        {loading && <p className="mt-4 text-center text-blue-500">Loading...</p>}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>
    </div>
  )
}

export default LvlOpen;