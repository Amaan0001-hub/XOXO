"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { RiMoonLine, RiSunLine, RiEyeLine, RiEyeOffLine, RiAdminLine, RiLockLine, RiUserLine, RiShieldKeyholeLine, RiArrowRightLine } from "react-icons/ri";
import { useTheme } from '@/components/ThemeProvider';
import { useEffect } from 'react';
import { adminLogin } from '@/app/redux/slices/authSlice';
import { getAdminToken, getAdminEncryptedLocalData } from '@/app/api/auth';
import toast from 'react-hot-toast';

const adminLoginSchema = Yup.object().shape({
    username: Yup.string()
        .required('Username is required'),
    password: Yup.string()
        .required('Password is required')
});

export default function AdminLogin() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isDark, toggleTheme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Check if already authenticated, redirect to dashboard
        const checkAuth = () => {
            const token = getAdminToken();
            const userData = getAdminEncryptedLocalData();
            if (token && userData) {
                const profile = typeof userData === 'string' ? JSON.parse(userData) : userData;
                const user = profile?.userData ?? profile;
                const userType = user?.userType ?? user?.type;
                if (String(userType) === '1') {
                    router.push('/user/dashboard');
                } else if (String(userType) === '2') {
                    router.push('/admin');
                } else {
                    router.push('/not-found');
                }
            }
        };
        checkAuth();
    }, [router]);

    const initialValues = {
        username: '',
        password: ''
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const result = await dispatch(adminLogin(values)).unwrap();
            if (result.statusCode === 200) {
                toast.success(result.message || 'Admin login successful!');
                resetForm();
                // Dispatch custom event for auth change
                window.dispatchEvent(new Event('auth-change'));
                router.push('/admin');
            } else if (result.statusCode === 409) {
                // Error message already shown by toast in authSlice
            }
        } catch (err) {
            // Error handled by the authSlice toast
            console.error('Admin login failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div id="root" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
            <div className="w-full max-w-md mx-auto">
                {/* Header with Theme Toggle */}
                <div className="flex items-center justify-end mb-6">
                    <button
                        onClick={toggleTheme}
                        className="group w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700"
                    >
                        {isDark ? <RiSunLine className="text-lg transition-transform group-hover:rotate-90" /> : <RiMoonLine className="text-lg transition-transform group-hover:rotate-12" />}
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-200/50 dark:border-gray-700/50">
                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 mb-5 shadow-lg transform transition-transform hover:scale-105 duration-300">
                            <RiShieldKeyholeLine className="text-4xl text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                            Admin Portal
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                            Secure access to admin dashboard
                        </p>
                    </div>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={adminLoginSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, errors, touched }) => (
                            <Form className="space-y-5 sm:space-y-6" noValidate>
                                {/* Username Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="username"
                                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        <RiUserLine className="text-emerald-500" />
                                        Username
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <RiAdminLine className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        </div>
                                        <Field
                                            id="username"
                                            name="username"
                                            type="text"
                                            placeholder="Enter your username"
                                            className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-900/50
                                                ${errors.username && touched.username
                                                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                                                } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                                                focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200`}
                                        />
                                    </div>
                                    <ErrorMessage
                                        name="username"
                                        component="div"
                                        className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1"
                                    />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        <RiLockLine className="text-emerald-500" />
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <RiLockLine className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        </div>
                                        <Field
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 bg-white dark:bg-gray-900/50
                                                ${errors.password && touched.password
                                                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                                                } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                                                focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 focus:outline-none transition-colors cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            {showPassword ? <RiEyeOffLine className="text-lg" /> : <RiEyeLine className="text-lg" />}
                                        </button>
                                    </div>
                                    <ErrorMessage name="password" component="div" className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1" />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="group relative w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold py-3.5 px-4 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg cursor-pointer overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Authenticating...
                                            </>
                                        ) : (
                                            <>
                                                Sign In to Admin Panel
                                                <RiArrowRightLine className="text-lg transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </Form>
                        )}
                    </Formik>

                    {/* Footer Note */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Secure Admin Access Only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}