import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './LoginPage';
import LandingPage from './LandingPage';
import TeamPage from './TeamPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './DashboardPage';
import ChatsPage from './ChatsPage';
import CustomersPage from './CustomersPage';
import CampaignsPage from './CampaignsPage';
import AnalyticsPage from './AnalyticsPage';
import SettingsPage from './SettingsPage';
import ProductsPage from './ProductsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/chats" element={<ChatsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/catalog" element={<ProductsPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
