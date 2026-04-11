import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 🔥 clave para cookies httpOnly
});

// --- Interceptor de REQUEST ---
api.interceptors.request.use(
  (config) => {
    // Podés agregar logs o headers extra acá si querés
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Interceptor de RESPONSE ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // 🔥 Manejo global de auth
    if (status === 401) {
      console.warn("No autenticado / sesión expirada");

      // Ejemplo: redirigir al login
      // window.location.href = "/login";
    }

    // 🔥 Podés manejar otros errores globales
    if (status === 500) {
      console.error("Error interno del servidor");
    }

    return Promise.reject(error);
  },
);

export default api;
