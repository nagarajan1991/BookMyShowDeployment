import axios from "axios";
const BASE_URL = "https://bookmyshowdeployment.onrender.com";

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    }
});

// Request interceptor to add token dynamically
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

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error);
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Add a function to update token
export const updateToken = (token) => {
    if (token) {
        localStorage.setItem("token", token);
    } else {
        localStorage.removeItem("token");
    }
};

// Add a function to check if token exists
export const hasToken = () => {
    return !!localStorage.getItem("token");
};

// Add a function to clear auth data
export const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
