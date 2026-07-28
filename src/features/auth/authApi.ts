import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "https://rengy-backend-nrla.onrender.com/api"}/auth`,
  withCredentials: true,
});

export default API;
