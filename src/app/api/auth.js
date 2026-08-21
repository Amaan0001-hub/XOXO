
import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "@/app/constants/constant";
import { decryptData, encryptData } from "../constants/encryption";


export const getEncryptedLocalData = (key) => {
  const encryptedData = localStorage.getItem(key);
  return encryptedData ? decryptData(encryptedData) : null;
};

export const getPlainLocalData = (key) => {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export const doLogin = (data, role = "user") => {
  if (data?.data === undefined) return false;
  const userData = data.data;

  const userId = userData?.UserId || userData?.URID || userData?.adminUserId;
  const payload = {
    ...userData,
    token: data.token || data.data?.token || null,
  };

  const storedUser = {
    userData: payload,
  };

  // ✅ FIX: UserType sahi se set karein
  let userType = "0"; // Default: Normal User

  // Admin login detect karein (type: 2) OR explicit role passed in
  const isAdmin =
    role === "admin" ||
    userData?.type === 2 ||
    userData?.Role === "Admin" ||
    userData?.role === "Admin";

  const authLogin = userData?.AuthLogin || userData?.authLogin || userData?.username || null;

  if (isAdmin) {
    userType = "2";
    localStorage.setItem("adminCurrentUser", encryptData(JSON.stringify(storedUser)));
    localStorage.setItem("adminCurrentUserPlain", JSON.stringify(storedUser));
    if (authLogin) {
      localStorage.setItem("adminAuthLogin", encryptData(authLogin));
    }
  } else {
    userType = "0";

    localStorage.setItem("emailId", userData?.Email || userData?.email);
    localStorage.setItem("currentUser", encryptData(JSON.stringify(storedUser)));
    localStorage.setItem("currentUserPlain", JSON.stringify(storedUser));
    if (authLogin) {
      localStorage.setItem("AuthLogin", encryptData(authLogin));
    }
  }

  // ✅ Cookie set karein
  Cookies.set('userType', userType, {
    expires: 7,
    secure: true,
    sameSite: 'Strict',
  });

  if (userId) {
    setUserId(userId);
  }

  return true;
};


export const getEmailId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("emailId");
  }
};

export const AuthLogin = () => {
  let authLogin = getEncryptedLocalData("AuthLogin");

  if (!authLogin) {
    const currentUser = getEncryptedLocalData("currentUser");
    if (currentUser) {
      const userData =
        typeof currentUser === "string" ? JSON.parse(currentUser) : currentUser;
      const profile = userData?.userData || userData;
      authLogin = profile?.AuthLogin || profile?.authLogin || profile?.username || null;
    }
  }

  return authLogin;
};

export const doUserLogout = () => {
  // Clear only user-related localStorage items
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentUserPlain");
  localStorage.removeItem("AuthLogin");
  localStorage.removeItem("emailId");
  localStorage.removeItem("UserId");
  Cookies?.remove("token");
  Cookies?.remove("userType");
  sessionStorage?.clear();

};

export const doAdminLogout = () => {
  // Clear only admin-related localStorage items
  localStorage.removeItem("adminCurrentUser");
  localStorage.removeItem("adminCurrentUserPlain");
  localStorage.removeItem("adminAuthLogin");

  // Clear admin-related cookies
  Cookies?.remove("admintoken");
  Cookies?.remove("Role");
  Cookies?.remove("userType");
  sessionStorage?.clear();

};

export const doLogout = () => {
  localStorage?.clear();
  Cookies?.remove("token");
  Cookies?.remove("admintoken");
  Cookies?.remove("Role");
  sessionStorage?.clear();
  Cookies?.remove("userType");
};



export const setToken = (token) => {
  if (token && typeof window !== "undefined") {
    Cookies.set("token", token, {
      expires: 7,
      secure: true,
      sameSite: "Strict",
    });
  }
};
export const setAdminToken = (token) => {
  if (token && typeof window !== "undefined") {
    Cookies.set("admintoken", token, {
      expires: 7,
      secure: true,
      sameSite: "Strict",
    });
  }
};
// setToken()

export const getToken = () => {

  if (typeof window !== "undefined") {
    const pathname = window.location.pathname || "";
    const isAdminContext =
      pathname.startsWith("/admin") || pathname.startsWith("/ad-crm");

    if (isAdminContext) {
      const adminToken = Cookies.get("admintoken");
      if (adminToken) return adminToken;
    }
  }

  const token = Cookies.get("token");
  return token ? token : null;
};
export const getAdminToken = () => {
  const token = Cookies.get("admintoken");
  return token ? token : null;
};
export const setUserId = (UserId) => {
  if (UserId && typeof window !== "undefined") {
    localStorage.setItem("UserId", encryptData(UserId));
  }
};

export const setCookie = (name, value, options = {}) => {
  const defaultOptions = {
    expires: 7,
    path: "/",
    ...options,
  };
  if (typeof window !== "undefined") {
    Cookies.set(name, value, defaultOptions);
  }
};

export const getCookie = (name) => {
  return Cookies.get(name);
};

export const removeCookie = (name) => {
  Cookies.remove(name);
};

export const setCookies = (
  categoryId,
  subCategoryId = null,
  subCategoryTypeId = null
) => {
  if (categoryId) {
    setCookie("categoryId", categoryId);
  }

  if (subCategoryId) {
    setCookie("subCategoryId", subCategoryId);
  } else {
    removeCookie("subCategoryId");
  }

  if (subCategoryTypeId) {
    setCookie("subCategoryTypeId", subCategoryTypeId);
  } else {
    removeCookie("subCategoryTypeId");
  }
};

export const setUserDetails = (user) => {
  if (user && typeof window !== "undefined") {
    // Store only userId in cookies
    if (user.Id) {
      Cookies.set("userId", user.Id, {
        expires: 7,
        secure: true,
        sameSite: "Strict",
      });
    }

  }
};
export const getUserId = () => {
  if (typeof window !== "undefined") {
    const userId = getEncryptedLocalData("UserId");
    return userId ? userId : null;
  }
  return null;
};


export const getAdminEncryptedLocalData = () => {
  if (typeof window === "undefined") return null;
  return getEncryptedLocalData("adminCurrentUser");
};

export const getAdminUserId = () => {
  if (typeof window !== "undefined") {
    let currentUser = getEncryptedLocalData("adminCurrentUser");

    if (!currentUser) {
      currentUser = getEncryptedLocalData("currentUser");
    }

    if (currentUser) {
      const userData = typeof currentUser === 'string' ? JSON.parse(currentUser) : currentUser;
      const profile = userData?.userData || userData;
      return profile?.adminUserId || null;
    }
    return null;
  }
  return null;
};

export const getRequest = async (endpoint) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(" API Call Failed:", error);
    throw error;
  }
};

export const postRequestWithLoginId = async (endpoint, data) => {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(" API Call Failed:", error);
    throw error;
  }
};

export const getRequestURId = async (endpoint) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.get(
      `${BASE_URL}${endpoint}?URID=${getUserId()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(" API Call Failed:", error);
    throw error;
  }
};
export const postRequestURId = async (endpoint) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.post(
      `${BASE_URL}${endpoint}?URID=${getUserId()}`,
      "", // empty body as per your curl command
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("API Call Failed:", error);
    throw error;
  }
};

export const getRequestUserId = async (endpoint) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.get(
      `${BASE_URL}${endpoint}?userId=${getUserId()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(" API Call Failed:", error);
    throw error;
  }
};

export const getRequestWithToken = async (endpoint) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(" API Call Failed:", error);
    throw error;
  }
};

export const postCreate = async (endpoint, data) => {
  const dataWithCreatedBy = {
    ...data,
    createdBy: getUserId(),
  };

  const response = await axios.post(
    `${BASE_URL}${endpoint}`,
    dataWithCreatedBy
  );

  return response.data;
};

export const postCreateWithUpdatedBy = async (endpoint, data) => {
  const token = getToken();

  if (!token) {
    throw new Error("No token found");
  }

  const dataWithCreatedBy = {
    ...data,
    updatedBy: getUserId(),
  };

  const response = await axios.post(
    `${BASE_URL}${endpoint}`,
    dataWithCreatedBy,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const postCreateWithUserId = async (endpoint, data) => {
  const userId = getUserId();
  const dataWithCreatedBy = {
    ...data,
    userId,
    createdBy: getUserId(),
  };

  const response = await axios.post(
    `${BASE_URL}${endpoint}`,
    dataWithCreatedBy
  );
  return response.data;
};

export const getRequestLoginId = async (endpoint, data) => {
  try {
    const token = getToken()

    if (!token) {
      throw new Error('No token found')
    }

    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error(' API Call Failed:', error)
    throw error
  }
}

export const postRequestNoDataInBody = async (endpoint) => {
  try {
    const token = getToken()
    const headers = token ? { Authorization: `Bearer ${token}`, } : {}
    const response = await axios.post(`${BASE_URL}${endpoint}`, {}, {
      headers,
    })
    return response.data
  } catch (error) {
    console.error(' API Call Failed:', error.response?.data || error.message)
    throw error
  }
}

export const postRequestLoginId = async (endpoint, data) => {
  try {
    const token = getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
};

export const postCreateWithUserIdAndToken = async (endpoint, data) => {
  const token = getToken();
  const userId = getUserId();
  const dataWithCreatedBy = {
    ...data,
    userId,
    createdBy: getUserId(),
  };

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.post(
    `${BASE_URL}${endpoint}`,
    dataWithCreatedBy,
    {
      headers,
    }
  );
  return response.data;
};

export const postRequest = async (endpoint) => {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(" API Call Failed:", error);
    throw error;
  }
};

export const postRequestWithData = async (endpoint, data) => {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error(" API Call Failed:", error);
    throw error;
  }
};

export const forgotPasswordRequest = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/Authentication/forgotPassword`, {
      userId: data.userId,
      email: data.email,
    });
    return response.data;
  } catch (error) {
    console.error("Forgot Password API Call Failed:", error);
    throw error;
  }
};

export const postRequestWithParams = async (endpoint, data) => {
  try {
    const response = await axios.post(
      `${BASE_URL}${endpoint}?age=${data.age}&name=${data.name}&gender=${data.gender}&skintype=${data.skintype}&skinSensitive=${data.skinSensitive}}`
    );
    return response.data;
  } catch (error) {
    console.error(" API Call Failed:", error);
    throw error;
  }
};

export const postRequestWithToken = async (endpoint, data) => {
  try {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error(" API Call Failed:", error);
    throw error;
  }
};

// export const putRequestWithToken = async (endpoint, data) => {
//   try {
//     const token = getToken();
//     const headers = token ? { Authorization: `Bearer ${token}` } : {};
//     const response = await axios.put(`${BASE_URL}${endpoint}`, data, {
//       headers,
//     });

//     return response.data;
//   } catch (error) {
//     console.error(" API Call Failed:", error);
//     throw error;
//   }
// };
export const putRequestWithToken = async (endpoint, data) => {
  try {
    const token = getToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.put(`${BASE_URL}${endpoint}`, data, { headers });
    return response.data;
  } catch (error) {
    console.error("API Call Failed:", error);
    throw error;
  }
};
export const postformRequest = async (endpoint, data) => {
  try {
    const token = getToken();
    const headers = {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    };

    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("API Call Failed:", error);
    throw error;
  }
};

export const postUpdate = async (endpoint, data) => {
}

export function isValidSHA256Format(input) {
  // Must be exactly 64 hex characters
  const sha256Regex = /^[a-f0-9]{64}$/i;
  return sha256Regex.test(input);
}


export const postImageWithParams = async (endpoint, data, imageFile) => {
  const token = getToken();
  if (!token) throw new Error("No token found");

  const formData = new FormData();
  if (imageFile) {
    formData.append("profileImage", imageFile);
  }

  const queryParams = {
    ...data, 
  };

  const response = await axios.post(`${BASE_URL}${endpoint}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
    params: queryParams,
  });

  return response.data;
};


export const addTicketReplyApi = async (endpoint, { ticketId, createdBy, message, status = 1, seen = 1, imageFile }) => {
  try {
    const token = getToken();

    const formData = new FormData();
    if (imageFile) {
      formData.append("ImagePath", imageFile);
    } else {
      formData.append("ImagePath", "");
    }

    const url = `${BASE_URL}${endpoint}?TicketId=${ticketId}&CreatedBy=${createdBy}&Message=${encodeURIComponent(
      message
    )}&Status=${status}&Seen=${seen}`;

    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Something went wrong");
  }
};

// Admin Dashboard API
export const getAdminDashboard = async (adminUserId) => {
  try {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(
      `${BASE_URL}/AdminAuthentication/getAdminDashboardDetails?adminUserId=${adminUserId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Admin Dashboard API Call Failed:", error);
    throw error;
  }
};

// Search All Users API
export const getSearchAllUsers = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.post(`${BASE_URL}/AdminManageUser/SearchAllUsers`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Search All Users API Call Failed:", error);
    throw error;
  }
};

// Get All Menu API
export const getAllMenu = async (adminUserId) => {
  try {
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(
      `${BASE_URL}/Menu/getAllMenu?adminUserId=${adminUserId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Get All Menu API Call Failed:", error);
    throw error;
  }
};

