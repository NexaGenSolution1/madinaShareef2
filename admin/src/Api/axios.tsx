import axios from "axios";

// const url = "http://localhost:8003/api/v1";
const url = "https://wasalemadina.com/api/v1";

const axiosInstance = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    console.error("API error:", error);
    return Promise.reject(error);
  }
);
export default axiosInstance;
