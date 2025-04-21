import { axiosInstance } from ".";

// Create axios instance with default config
const api = axiosInstance.create({
  baseURL: '/api/bookings'
});


// Add request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const makePayment = async (data) => {
  try {
      const response = await api.post("/make-payment", data);
      return response.data;
  } catch (error) {
      throw error.response?.data || error;
  }
};

export const bookShow = async (data) => {
  try {
      const response = await api.post("/book-show", data);
      return response.data;
  } catch (error) {
      throw error.response?.data || error;
  }
};

export const getAllBookings = async () => {
  try {
    const response = await axiosInstance.get("/api/bookings/get-all-bookings");
    return response.data;
  } catch (err) {
    console.log("Error while getting all bookings", err);
  }
};
