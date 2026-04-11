import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Necesario para que el browser envíe y reciba cookies httpOnly automáticamente
  withCredentials: true,
});

// Interceptor de respuesta: si el server responde 401, el usuario no está autenticado.
// No necesitamos leer localStorage; la cookie se maneja en el browser automaticamente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Podés agregar lógica global aquí si querés (ej: redirect a /login en 401)
    return Promise.reject(error);
  }
);

export default api;
