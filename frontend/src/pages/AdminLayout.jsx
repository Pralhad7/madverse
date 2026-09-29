import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Store, BarChart3, Settings, LogOut, ShieldCheck, 
  ExternalLink, Sparkles, Menu, X, CheckCircle, Bell
} from 'lucide-react';
import logo from '../assets/logo.png';

const AdminLayout = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { name: 'Analytics & Funnel', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'Locations & QR Merch', path: '/admin/dashboard/locations', icon: Store },
    { name: 'Brand & AI Voice', path: '/admin/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-madverse-espresso flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-amber-900/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/admin/dashboard" className="flex items-center">
          <img 
            src={logo} 
            alt="MadVerse Logo" 
            className="h-7 w-auto object-contain mix-blend-multiply" 
          />
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-madverse-espresso-500 hover:text-madverse-espresso rounded-lg hover:bg-amber-50"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-amber-900/10 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Brand Logo Header */}
          <div className="p-5 border-b border-amber-900/10 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center group">
              <img 
                src={logo} 
                alt="MadVerse Logo" 
                className="h-10 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform" 
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <span className="text-[10px] font-extrabold text-madverse-espresso-400 uppercase tracking-wider px-3 mb-2 block">
              Workspace
            </span>

            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/25' 
                      : 'text-madverse-espresso-600 hover:bg-[#FAF6F0] hover:text-madverse-espresso'
                  }`}
                >
                  <Icon size={18} className="mr-3 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Compliance & User */}
        <div className="p-4 border-t border-amber-900/10 space-y-3">
          {/* Policy Compliance Pill */}
          <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-teal-900">
              <ShieldCheck size={16} className="text-teal-600 shrink-0" />
              <span>Google Policy: 100%</span>
            </div>
            <p className="text-[11px] text-teal-800/80 mt-1 leading-snug">
              Zero review-gating active. All customer ratings route equally to Google.
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center w-full px-3.5 py-2 text-xs font-bold text-madverse-espresso-400 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition"
          >
            <LogOut size={16} className="mr-2.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
