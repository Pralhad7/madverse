import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerReview from './pages/CustomerReview';

// Lazy load admin pages to keep the customer bundle size small
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const BusinessSetup = lazy(() => import('./pages/BusinessSetup'));
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/review" element={<CustomerReview />} />
        <Route path="/review/:locationId" element={<CustomerReview />} />

        {/* Auth routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/setup" element={<BusinessSetup />} />

        {/* Protected admin routes */}
        <Route path="/admin/dashboard" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="*" element={<AdminDashboard />} />
        </Route>

        {/* Redirect /admin to dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
