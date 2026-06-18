// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import AdminDashboard from './pages/AdminDashboard';

// Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OTPVerifyPage from './pages/auth/OTPVerifyPage';

// Passenger Pages
import PassengerHome from './pages/passenger/PassengerHome';
import PayFarePage from './pages/passenger/PayFarePage';
import WalletPage from './pages/passenger/WalletPage';
import TripHistoryPage from './pages/passenger/TripHistoryPage';
import ProfilePage from './pages/passenger/ProfilePage';

// Conductor Pages
import ConductorHome from './pages/conductor/ConductorHome';
import ScanPayPage from './pages/conductor/ScanPayPage';
import { ManifestPage, EarningsPage } from './pages/conductor/ScanPayPage';

// Operator Pages
import OperatorDashboard, {
  BusManagement,
  RevenueReport,
  RoutesPage,
} from './pages/operator/OperatorDashboard';

// Layouts
import PassengerLayout from './layouts/PassengerLayout';
import ConductorLayout from './layouts/ConductorLayout';
import OperatorLayout from './layouts/OperatorLayout';

// Guards
import ProtectedRoute from './components/shared/ProtectedRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />

        <Routes>
          {/* ========================================================== */}
          {/* PUBLIC ROUTES                                              */}
          {/* ========================================================== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<OTPVerifyPage />} />

          {/* ========================================================== */}
          {/* SYSTEM ADMIN MANAGEMENT (Protected using your custom guard!) */}
          {/* ========================================================== */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* ========================================================== */}
          {/* PASSENGER ROUTES                                           */}
          {/* ========================================================== */}
          <Route path="/passenger" element={
            <ProtectedRoute role="passenger">
              <PassengerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<PassengerHome />} />
            <Route path="pay" element={<PayFarePage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="history" element={<TripHistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* ========================================================== */}
          {/* CONDUCTOR ROUTES                                           */}
          {/* ========================================================== */}
          <Route path="/conductor" element={
            <ProtectedRoute role="conductor">
              <ConductorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ConductorHome />} />
            <Route path="scan" element={<ScanPayPage />} />
            <Route path="manifest" element={<ManifestPage />} />
            <Route path="earnings" element={<EarningsPage />} />
          </Route>

          {/* ========================================================== */}
          {/* OPERATOR ROUTES                                            */}
          {/* ========================================================== */}
          <Route path="/operator" element={
            <ProtectedRoute role="operator">
              <OperatorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<OperatorDashboard />} />
            <Route path="buses" element={<BusManagement />} />
            <Route path="revenue" element={<RevenueReport />} />
            <Route path="routes" element={<RoutesPage />} />
          </Route>

          {/* CATCH-ALL FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;