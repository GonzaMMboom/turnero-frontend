import api from '../../services/api';

/**
 * Login: el backend establece la cookie httpOnly automáticamente.
 * Ya no almacenamos nada en localStorage.
 */
export const loginService = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Register: ídem login, el backend establece la cookie.
 */
export const registerService = async (email, password, businessName) => {
  const response = await api.post('/auth/register', { email, password, businessName });
  return response.data;
};

/**
 * Logout: llama al backend para que limpie la cookie httpOnly.
 * El cliente no puede limpiar una cookie httpOnly directamente.
 */
export const logoutService = async () => {
  await api.post('/auth/logout');
};

/**
 * Perfil: si la cookie existe, el backend la verifica y devuelve el perfil.
 * Si no existe o expiró, el backend responde 401.
 */
export const getProfileService = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
