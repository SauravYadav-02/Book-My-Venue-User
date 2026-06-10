import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from 'axios'

// Global Axios Interceptor to handle suspension
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const msg = error.response.data?.message || "";
      if (msg.toLowerCase().includes("suspended")) {
        localStorage.removeItem("userId");
        localStorage.removeItem("vendorId");
        localStorage.removeItem("adminId");
        window.location.href = "/login?suspended=true";
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <App />
)

