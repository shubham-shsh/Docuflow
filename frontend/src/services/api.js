import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // send cookies with requests
});

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Transform response to match ApiResponse
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Request successful",
      statusCode: response.status,
    };
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call refresh endpoint
        const res = await axios.post(
          (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1") + "/users/refresh-token",
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data?.data?.accessToken;

        // Attach new token to axios instance
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        return Promise.reject({
          success: false,
          message: "Session expired, please login again",
          statusCode: 401,
        });
      }
    }

    // Default error handling
    let message = "Something went wrong";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    return Promise.reject({
      success: false,
      message,
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
    });
  }
);

export default api;
