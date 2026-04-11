import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import NewAppointment from '../pages/appointments/NewAppointment';
import AppointmentsList from '../pages/appointments/AppointmentsList';
import Settings from '../pages/settings/Settings';
import MainLayout from '../components/layout/MainLayout';

import ClientsList from '../pages/clients/ClientsList';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'turnos',
        element: <AppointmentsList />
      },
      {
        path: 'turnos/nuevo',
        element: <NewAppointment />
      },
      {
        path: 'clientes',
        element: <ClientsList />
      },
      {
        path: 'configuracion',
        element: <Settings />
      }
    ]
  }
]);
