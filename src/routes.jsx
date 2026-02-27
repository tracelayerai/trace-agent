import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import CasesPage from './pages/CasesPage';
import CaseFilePage from './pages/CaseFilePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/search',
    element: <SearchPage />,
  },
  {
    path: '/cases',
    element: <CasesPage />,
  },
  {
    path: '/cases/:id',
    element: <CaseFilePage />,
  },
  {
    path: '/reports',
    element: <ReportsPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
]);
