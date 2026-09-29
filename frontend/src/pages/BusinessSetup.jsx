import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, ShieldCheck, Sparkles, Building2, Check, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const BusinessSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'restaurant',
    logoUrl: '',
    primaryColor: '#2563eb',
    secondaryColor: '#ffffff',
    defaultLanguage: 'English',
    tone: 'friendly',
    email: '',
    password: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.error || data.message || 'Failed to create business');
      }
    } catch (err) {
      setError('An error occurred during onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="max-w-xl mx-auto w-full">
        {/* Header with Brand Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-4 group">
            <img 
              src={logo} 
              alt="MadVerse Logo" 
              className="h-14 sm:h-16 w-auto object-contain mix-blend-multiply transition-transform group-hover:scale-105" 
            />
          </Link>
          <h2 className="text-2xl font-extrabold text-madverse-espresso tracking-tight">Launch Your Review Assistant</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Set up your brand profile, configure AI writing styles, and generate in-store QR codes.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/90">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                {error}
              </div>
            )}

            {/* Business Basics */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                1. Business Identity
              </span>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., MadVerse Experience Studio"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="creative_studio">Creative Studio & Experience</option>
                    <option value="restaurant">Restaurant & Café</option>
                    <option value="hotel">Hotel & Hospitality</option>
                    <option value="clinic">Clinic & Healthcare</option>
                    <option value="salon">Salon & Spa</option>
                    <option value="auto_repair">Auto Repair</option>
                    <option value="retail">Retail Store</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      readOnly
                      className="flex-1 px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Credentials */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                2. Owner Admin Login
              </span>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="owner@yourbusiness.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password * (Min 8 characters)</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength="8"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : (
                  <>
                    <span>Create Business Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Already have an account?{' '}
            <Link to="/admin/login" className="font-bold text-blue-600 hover:underline">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetup;
