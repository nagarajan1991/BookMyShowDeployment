const { axiosInstance } = require(".");

// Add request interceptor to automatically add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const LoginUser = async (value) => {
    try {
        const response = await axiosInstance.post("api/users/login", value);
        if (response.data.success) {
            // Store token and user data
            localStorage.setItem("token", response.data.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.data.user));
        }
        return response.data;
    } catch (err) {
        console.error("Error occurred at client side in login endpoint:", err);
        throw err.response?.data || {
            success: false,
            message: "Login failed. Please try again."
        };
    }
}

export const RegisterUser = async (value) => {
    try {
        const response = await axiosInstance.post("api/users/register", value);
        return response.data;
    } catch (err) {
        console.error("Error occurred at client side in register endpoint:", err);
        throw err.response?.data || {
            success: false,
            message: "Registration failed. Please try again."
        };
    }
}

export const GetCurrentUser = async () => {
    try {
        const response = await axiosInstance.get("api/users/get-current-user");
        return response.data;
    } catch (err) {
        console.error("Error occurred at client side in get-current-user endpoint:", err);
        if (err.response?.status === 401) {
            // Clear storage if unauthorized
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        throw err.response?.data || {
            success: false,
            message: "Failed to get current user."
        };
    }
}

export const ForgetPassword = async (value) => {
    try {
        const response = await axiosInstance.patch(
            "api/users/forgetpassword",
            value
        );
        return response.data;
    } catch (err) {
        console.error("Error occurred at client side in forget-password endpoint:", err);
        throw err.response?.data || {
            success: false,
            message: "Password reset request failed. Please try again."
        };
    }
}

export const ResetPassword = async (value, email) => {
    try {
        const response = await axiosInstance.patch(
            `/api/users/resetpassword/${email}`,
            value
        );
        return response.data;
    } catch (err) {
        console.error("Error occurred at client side in reset-password endpoint:", err);
        throw err.response?.data || {
            success: false,
            message: "Password reset failed. Please try again."
        };
    }
}

// Add logout function
export const LogoutUser = () => {
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return {
            success: true,
            message: "Logged out successfully"
        };
    } catch (err) {
        console.error("Error during logout:", err);
        throw {
            success: false,
            message: "Logout failed"
        };
    }
}

// Add function to check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
}

// Add function to get user role
export const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role || 'user';
}


export const UpdateUserProfile = async (payload) => {
    try {
        const response = await axiosInstance.post('/api/users/update-profile', payload);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};
