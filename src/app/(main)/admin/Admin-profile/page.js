"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminUserDetails } from "@/app/redux/slices/authSlice";
import { getEncryptedLocalData } from "@/app/api/auth";
import { User, Mail, Phone, Lock } from "lucide-react"; // Uncomment these

const AdminProfile = () => {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  
  // Access state from auth slice, not admin
  const { user: adminDetailsRaw, loading, error } = useSelector((state) => state.auth || {});
  
  // Get data from response.data array
  const adminDetails = adminDetailsRaw?.data && Array.isArray(adminDetailsRaw.data) 
    ? adminDetailsRaw.data[0] 
    : null;
  


  useEffect(() => {
    const encryptedUser = localStorage.getItem('adminCurrentUser');
    if (encryptedUser) {
      try {
        const decryptedUser = getEncryptedLocalData('adminCurrentUser');
        if (decryptedUser) {
          // Parse the JSON string
          const parsedUser = typeof decryptedUser === 'string' 
            ? JSON.parse(decryptedUser) 
            : decryptedUser;
          
          setUserData(parsedUser);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (userData?.adminUserId && userData?.username) {
      dispatch(fetchAdminUserDetails({ 
        adminUserId: userData.adminUserId, 
        username: userData.username 
      }));
    }
  }, [userData, dispatch]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
        Error loading profile: {error}
      </div>
    </div>
  );

  // Use adminDetails from API or fallback to userData from localStorage
  const displayData = adminDetailsRaw?.[0] || {}
  return (
    <div className="flex items-center justify-center p-0 mx-auto mt-0">
      <div className="w-full max-w-lg p-8 bg-white shadow-2xl rounded-3xl border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-4 rounded-full border-4 border-blue-200 flex items-center justify-center bg-gray-100">
            <User className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Admin Profile</h2>
          {displayData?.type && (
            <span className="px-3 py-1 mt-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
              {displayData.type}
            </span>
          )}
        </div>

        {displayData ? (
          <div className="mt-6 space-y-4">
            {[
              { 
                label: "Username", 
                value: displayData.username || "N/A", 
                icon: <User className="w-5 h-5 text-blue-500" /> 
              },
              { 
                label: "First Name", 
                value: displayData.firstName || "N/A", 
                icon: <User className="w-5 h-5 text-blue-500" /> 
              },
              { 
                label: "Last Name", 
                value: displayData.lastName || "N/A", 
                icon: <User className="w-5 h-5 text-blue-500" /> 
              },
              { 
                label: "Email", 
                value: displayData.email || "N/A", 
                icon: <Mail className="w-5 h-5 text-green-500" /> 
              },
              { 
                label: "Phone", 
                value: displayData.phoneNumber || "N/A", 
                icon: <Phone className="w-5 h-5 text-purple-500" /> 
              },
             
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 transition-all bg-gray-50 rounded-xl hover:bg-gray-100"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  {item.icon}
                  <span className="w-24">{item.label}:</span>
                </span>
                <span className="text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No user data available</p>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;