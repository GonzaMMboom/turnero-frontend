import React, { useContext, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { AuthContext } from '../../features/auth/auth.context';

export default function MainLayout() {
  const { onboardingCompleted, loading, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && onboardingCompleted === false) {
      if (location.pathname !== '/configuracion') {
        navigate('/configuracion');
      }
    }
  }, [onboardingCompleted, loading, isAuthenticated, location.pathname, navigate]);

  if (loading) return null;

  return (
    <div className="bg-[#f7f9fb] font-body text-[#191c1e] min-h-screen relative">
      <Sidebar />
      <Navbar />
      <main className="ml-64 mt-20 p-12 min-h-[calc(100vh-5rem)]">
        <Outlet />
      </main>
    </div>
  );
}
