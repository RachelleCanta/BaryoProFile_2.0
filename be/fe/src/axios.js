import axios from "axios";
import { MAIN_API_LINK } from "./utils/API";

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:9090/api', // Set the base URL for the API
  baseURL: MAIN_API_LINK, // Set the base URL for the API
  // timeout: 10000, // Optional: Set a timeout for requests (in milliseconds)
  headers: {
    "Content-Type": "application/json", // Optional: Set default headers
  },
});

export default axiosInstance;
