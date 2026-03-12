import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CasesPage from './pages/CasesPage';
import CaseFile from './pages/CaseFile';
import SearchPage from './pages/SearchPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import AnalysisPage from './pages/AnalysisPage';
import DesignConfirmation from './pages/DesignConfirmation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected app routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/cases"     element={<ProtectedRoute><CasesPage /></ProtectedRoute>} />
        <Route path="/cases/:id" element={<ProtectedRoute><CaseFile /></ProtectedRoute>} />
        <Route path="/search"    element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/reports"   element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/settings"  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/admin"     element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/analysis"  element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />

        {/* Design system reference — no auth required */}
        <Route path="/design-system" element={<DesignConfirmation />} />

        {/* Default → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
