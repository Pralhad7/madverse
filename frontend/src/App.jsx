import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerReview from './pages/CustomerReview';
import AdminLogin from './pages/AdminLogin';
import BusinessSetup from './pages/BusinessSetup';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
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
