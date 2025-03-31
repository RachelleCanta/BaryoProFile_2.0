import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api', // Set the base URL for the API
    timeout: 10000, // Optional: Set a timeout for requests (in milliseconds)
    headers: {
        'Content-Type': 'application/json', // Optional: Set default headers
    },
});

export default axiosInstance;