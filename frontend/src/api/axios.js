import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8007/api", // backend ka port
  // baseURL: "https://brothersinttvl.com/api", // backend ka port
  withCredentials: true,
});

export default axiosInstance;
