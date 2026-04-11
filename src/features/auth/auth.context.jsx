import React, { createContext, useState, useEffect } from 'react';
import { loginService, registerService, logoutService, getProfileService } from './auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true); // Default true para evitar flashes
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Al iniciar la app, intentamos obtener el perfil del usuario.
     * Si la cookie httpOnly es válida → el usuario está autenticado.
     * Si responde 401 → no hay sesión activa.
     * Ya NO chequeamos localStorage.
     */
    const fetchProfile = async () => {
      try {
        const profile = await getProfileService();
        setIsAuthenticated(true);
        setOnboardingCompleted(profile.onboarding_completed);
        setBusinessName(profile.business_name);
      } catch (error) {
        // 401 = sin sesión (cookie inexistente o expirada) → estado inicial limpio
        setIsAuthenticated(false);
        setOnboardingCompleted(true);
        setBusinessName('');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginService(email, password);
      setIsAuthenticated(true);
      if (data.user) {
        setOnboardingCompleted(data.user.onboardingCompleted);
        setBusinessName(data.user.businessName);
      }
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  };

  const register = async (email, password, businessName) => {
    try {
      const data = await registerService(email, password, businessName);
      setIsAuthenticated(true);
      if (data.user) {
        setOnboardingCompleted(data.user.onboardingCompleted);
        setBusinessName(data.user.businessName);
      }
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrarse',
      };
    }
  };

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  const logout = async () => {
    try {
      // Llamar al backend para que limpie la cookie httpOnly
      await logoutService();
    } catch {
      // Si falla el logout en el server, igualmente limpiamos el estado local
    } finally {
      setIsAuthenticated(false);
      setOnboardingCompleted(true);
      setBusinessName('');
    }
  };

  const updateBusinessName = (newName) => {
    setBusinessName(newName);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, onboardingCompleted, businessName, completeOnboarding, updateBusinessName, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
