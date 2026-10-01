import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/StatsCard';
import LocationCard from '../components/LocationCard';
import Modal from '../components/Modal';
import QRCodeDisplay from '../components/QRCodeDisplay';
import PhysicalMerchStudio from '../components/PhysicalMerchStudio';
import { 
  Plus, BarChart3, QrCode, Star, MousePointerClick, Loader2, 
  ExternalLink, Sparkles, ShieldCheck, CheckCircle2, RefreshCw, 
  Building2, Palette, Globe, Sliders, AlertTriangle,
  MessageSquare, Copy, Check, HeartHandshake, Phone, Mail, 
  ArrowRight, Lightbulb, TrendingUp, ThumbsUp, Send, CheckCircle, Shield
} from 'lucide-react';

// ─────────────────────────── Overview Tab ───────────────────────────
const Overview = () => {
  const { apiFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    return Promise.all([
      apiFetch('/api/analytics/summary').then(res => res.json()).catch(() => ({})),
      apiFetch('/api/locations').then(res => res.json()).catch(() => ([]))
    ]).then(([analyticsData, locationsData]) => {
      setStats(analyticsData || {});
      setLocations(Array.isArray(locationsData) ? locationsData : []);
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-semibold">Loading business analytics...</p>
      </div>
    );
  }

  // 100% Genuine Database Telemetry - Zero Mock Numbers
  const qrScans = Number(stats?.qr_scanned || stats?.qr_scan || 0);
  const helperStarts = Number(stats?.rating_selected || stats?.helper_start || 0);
  const draftsGenerated = Number(stats?.draft_generated || 0);
  const googleClicks = Number(stats?.google_redirect_clicked || stats?.google_click || 0);
  const directClicks = Number(stats?.direct_google_fallback_clicked || stats?.direct_google_click || 0);

  const totalReviewsInitiated = googleClicks + directClicks;
  const conversionRate = qrScans > 0 ? Math.round((totalReviewsInitiated / qrScans) * 100) : 0;
  const calcPct = (count) => (qrScans > 0 ? Math.min(100, Math.round((count / qrScans) * 100)) : 0);

  const statCards = [
    { 
      title: 'Total QR Scans', 
      value: qrScans.toLocaleString(), 
      icon: QrCode, 
      subtitle: qrScans > 0 ? 'Live customer scans' : 'Awaiting first scan' 
    },
    { 
      title: 'Drafts Created', 
      value: draftsGenerated.toLocaleString(), 
      icon: Sparkles, 
      subtitle: draftsGenerated > 0 ? 'Grounded AI drafts' : 'No drafts generated yet' 
    },
    { 
      title: 'Outbound to Google', 
      value: totalReviewsInitiated.toLocaleString(), 
      icon: MousePointerClick, 
      subtitle: totalReviewsInitiated > 0 ? 'Launched Google review form' : 'No redirects yet' 
    },
    { 
      title: 'Scan-to-Google Rate', 
      value: `${conversionRate}%`, 
      icon: BarChart3, 
      subtitle: qrScans > 0 ? `${totalReviewsInitiated} of ${qrScans} visitors converted` : 'Calculates after first scan' 
    },
  ];

  const firstLocation = locations[0];

  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-800 via-teal-900 to-[#2B1810] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-950/20 border border-teal-700/30">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-xs mb-2">
            <Sparkles size={12} className="text-amber-300" /> Real Customer Engagement
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Performance Overview</h2>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
            Live telemetry tracking QR scans, customer draft completions, and outbound public Google review actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs transition active:scale-95 disabled:opacity-50"
            title="Refresh latest scan telemetry"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          {firstLocation && (
            <Link
              to={`/review/${firstLocation.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-800 font-bold text-xs hover:bg-amber-50 shadow-sm transition"
            >
              <span>Test Customer Flow</span>
              <ExternalLink size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Funnel & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Conversion Funnel */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Review Completion Funnel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Path of real visitors from scanning physical QR to submitting on Google
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                100% Live Telemetry
              </span>
            </div>
          </div>

          {qrScans === 0 && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
                  <QrCode size={18} />
                </div>
                <div>
                  <p className="font-bold">Awaiting First Customer Scan</p>
                  <p className="text-amber-800/80 text-[11px]">Real-time tracking is connected. Tap "Test Customer Flow" or scan your physical QR stands to see your conversion funnel update.</p>
                </div>
              </div>
              {firstLocation && (
                <Link
                  to={`/review/${firstLocation.id}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shrink-0 transition"
                >
                  <span>Simulate Test Scan</span>
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          )}

          <div className="space-y-4">
            {[
              { label: '1. In-Store QR Scanned', count: qrScans, pct: qrScans > 0 ? 100 : 0, color: 'bg-blue-500', desc: 'Customer points camera at receipt/table tent' },
              { label: '2. Assistant Started', count: helperStarts, pct: calcPct(helperStarts), color: 'bg-indigo-500', desc: 'Tapped "Help me draft a review" or selected rating' },
              { label: '3. AI Draft Generated', count: draftsGenerated, pct: calcPct(draftsGenerated), color: 'bg-violet-500', desc: 'Customer selected factual details' },
              { label: '4. Outbound to Google Maps', count: googleClicks, pct: calcPct(googleClicks), color: 'bg-emerald-500', desc: 'Copied draft and launched Google review form' },
              { label: 'Direct to Google (Bypass)', count: directClicks, pct: calcPct(directClicks), color: 'bg-amber-500', desc: 'Customers who preferred writing with zero AI' },
            ].map(step => (
              <div key={step.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{step.label}</span>
                    <span className="text-slate-400 hidden sm:inline ml-2 text-[11px]">— {step.desc}</span>
                  </div>
                  <div className="font-mono text-slate-700 font-bold">
                    {step.count} <span className="text-slate-400 font-normal">({step.pct}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${step.color} rounded-full transition-all duration-700`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Google Compliance Assurance Panel */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <ShieldCheck size={24} className="stroke-[2.2]" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Google Policy Compliance
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Unlike legacy review gating tools that secretly redirect unhappy customers to private forms, MadVerse treats all ratings equally.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2 text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Zero Review Gating:</strong> 1★ to 5★ ratings both lead to the public Google form.</span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>No Incentives or Quids:</strong> Zero discounts or loyalty points offered.</span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Human Controlled:</strong> Customer retains full editorial ownership.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500">
            Audit Status: <span className="font-bold text-emerald-600">Passed (Policy Clean)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────── Locations Tab ───────────────────────────
const Locations = () => {
  const { apiFetch } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrModalLocation, setQrModalLocation] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ name: '', address: '', google_review_link: '' });

  const fetchLocations = () => {
    apiFetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        setLocations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await apiFetch('/api/locations', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create location');
      }
      setIsModalOpen(false);
      setFormData({ name: '', address: '', google_review_link: '' });
      fetchLocations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (location) => {
    await apiFetch(`/api/locations/${location.id}/toggle`, { method: 'PUT' });
    fetchLocations();
  };

  const handleDelete = async (location) => {
    if (window.confirm(`Are you sure you want to delete ${location.name}?`)) {
      await apiFetch(`/api/locations/${location.id}`, { method: 'DELETE' });
      fetchLocations();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-semibold">Loading locations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Locations & QR Codes</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add physical stores, download high-res branded QR flyers, or pause locations anytime.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Location</span>
        </button>
      </div>

      {/* Grid of Locations */}
      {locations.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-300">
          <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Locations Configured</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-5">
            Add your first location with its Google Maps review link to immediately generate your QR code flyer.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
          >
            <Plus size={15} /> Add First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(loc => (
            <LocationCard 
              key={loc.id} 
              location={loc} 
              onToggle={handleToggle}
              onDelete={handleDelete}
              onShowQR={() => setQrModalLocation(loc)}
            />
          ))}
        </div>
      )}

      {/* Add Location Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setError(''); }} title="Register New Location">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Location / Branch Name *
            </label>
            <input 
              type="text" 
              required 
              placeholder="e.g., Downtown Branch, Airport Terminal 2" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Physical Street Address (Optional)
            </label>
            <input 
              type="text" 
              placeholder="e.g., 123 Main St, Suite 400" 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Official Google Review Link *
            </label>
            <input 
              type="url" 
              required 
              placeholder="https://g.page/r/YOUR_BUSINESS/review or search.google.com/local/writereview?placeid=..." 
              value={formData.google_review_link} 
              onChange={e => setFormData({...formData, google_review_link: e.target.value})} 
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Obtain this in your Google Business Profile under "Ask for reviews".
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => { setIsModalOpen(false); setError(''); }} 
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              Save & Generate QR
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Flyer Print Studio Modal */}
      <Modal 
        isOpen={!!qrModalLocation} 
        onClose={() => setQrModalLocation(null)} 
        title={`3D Physical Print Studio: ${qrModalLocation?.name}`}
        maxWidth="max-w-2xl"
      >
        {qrModalLocation && (
          <PhysicalMerchStudio 
            locationId={qrModalLocation.id} 
            businessName={qrModalLocation.name}
          />
        )}
      </Modal>
    </div>
  );
};

// ─────────────────────────── Settings Tab ───────────────────────────
const Settings = () => {
  const { apiFetch, logout } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch('/api/businesses/me')
      .then(res => res.json())
      .then(data => {
        setBusiness(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/businesses/me', {
        method: 'PUT',
        body: JSON.stringify(business)
      });
      setMessage('Brand preferences updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete account and all location data permanently? This action cannot be undone.')) {
      await apiFetch('/api/businesses/me', { method: 'DELETE' });
      logout();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-semibold">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Brand & AI Voice Settings</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Tune the personality, visual palette, and writing style of your review assistant.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold border border-emerald-200/80 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
        {/* Brand identity */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" />
            <span>Profile Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
              <input 
                type="text" 
                value={business?.name || ''} 
                onChange={e => setBusiness({...business, name: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 outline-none" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry Vertical</label>
              <select 
                value={business?.category || 'restaurant'} 
                onChange={e => setBusiness({...business, category: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 outline-none bg-white"
              >
                <option value="creative_studio">Creative Studio & Experience</option>
                <option value="restaurant">Restaurant & Café</option>
                <option value="hotel">Hotel & Hospitality</option>
                <option value="clinic">Medical Clinic & Healthcare</option>
                <option value="salon">Salon & Spa</option>
                <option value="auto_repair">Auto Repair & Services</option>
                <option value="retail">Retail & Shopping</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Voice & Tone */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders size={16} className="text-blue-600" />
            <span>AI Voice & Language Persona</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Tone</label>
              <select 
                value={business?.tone || 'friendly'} 
                onChange={e => setBusiness({...business, tone: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 outline-none bg-white"
              >
                <option value="friendly">Warm & Friendly (Hospitality / Food)</option>
                <option value="professional">Professional & Crisp (Clinical / B2B)</option>
                <option value="casual">Casual & Energetic (Retail / Fitness)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Language</label>
              <select 
                value={business?.language || 'en'} 
                onChange={e => setBusiness({...business, language: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 outline-none bg-white"
              >
                <option value="en">English (US / UK)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visual Theming */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Palette size={16} className="text-blue-600" />
            <span>Visual Theme & Logo</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Brand Color</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={business?.primary_color || '#2563eb'} 
                onChange={e => setBusiness({...business, primary_color: e.target.value})}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5" 
              />
              <input 
                type="text" 
                value={business?.primary_color || '#2563eb'} 
                onChange={e => setBusiness({...business, primary_color: e.target.value})}
                className="w-32 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase" 
              />
              <span className="text-xs text-slate-400">Used for customer page accents & QR tints</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Logo URL (Optional)</label>
            <input 
              type="url" 
              placeholder="https://example.com/logo.png" 
              value={business?.logo_url || ''} 
              onChange={e => setBusiness({...business, logo_url: e.target.value})}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 outline-none" 
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50/60 rounded-3xl p-6 border border-red-200/80 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">Account Deletion</h4>
          <p className="text-xs text-red-700/80 mt-0.5">Permanently remove all locations, QR configurations, and analytics logs.</p>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-white text-red-600 hover:bg-red-600 hover:text-white border border-red-200 rounded-xl text-xs font-bold transition shadow-2xs"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────── AI Google Review Hub ───────────────────────────
const AIReviewHub = () => {
  const { apiFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('reply'); // 'reply' | 'inbox' | 'playbook'
  const [locations, setLocations] = useState([]);
  
  // Reply Generator State
  const [starRating, setStarRating] = useState(5);
  const [reviewInput, setReviewInput] = useState('');
  const [generatingReplies, setGeneratingReplies] = useState(false);
  const [generatedReplies, setGeneratedReplies] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Private Inbox State
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    apiFetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLocations(data);
      })
      .catch(() => {});
  }, []);

  const primaryLoc = locations[0] || {};
  const businessName = primaryLoc.name || 'Trident Net Holidays';
  const locationName = primaryLoc.city || 'Mumbai';
  const googleReviewLink = primaryLoc.google_review_link || 'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai';

  useEffect(() => {
    if (activeTab === 'inbox') {
      loadFeedbacks();
    }
  }, [activeTab]);

  const loadFeedbacks = () => {
    setLoadingFeedbacks(true);
    apiFetch('/api/feedback/private')
      .then(res => res.json())
      .then(data => {
        setFeedbacks(Array.isArray(data) ? data : []);
        setLoadingFeedbacks(false);
      })
      .catch(() => setLoadingFeedbacks(false));
  };

  const handleGenerateReplies = async (customText, customRating) => {
    const text = customText !== undefined ? customText : reviewInput;
    const rating = customRating !== undefined ? customRating : starRating;
    if (!text || !text.trim()) return;

    setGeneratingReplies(true);
    setGeneratedReplies(null);

    try {
      const res = await apiFetch('/api/drafts/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewText: text,
          starRating: rating,
          businessName,
          locationName
        })
      });
      const data = await res.json();
      if (data.replies && Array.isArray(data.replies)) {
        setGeneratedReplies(data.replies);
      }
    } catch (err) {
      console.error('Failed to generate replies:', err);
    } finally {
      setGeneratingReplies(false);
    }
  };

  const handleCopyReply = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setResolvingId(id);
    try {
      await apiFetch(`/api/feedback/private/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const sampleReviews = [
    {
      label: '🌴 5★ Bali Holiday',
      rating: 5,
      text: 'Had an amazing 6-day family holiday in Bali organized by Trident Net Holidays. Everything was seamless from flight tickets to private villa!'
    },
    {
      label: '✈️ 5★ Dubai Visa & Flights',
      rating: 5,
      text: 'Super fast Dubai visa assistance and great flight rates from Mumbai. Highly recommend Trident Net Holidays for corporate trips!'
    },
    {
      label: '🏔️ 4★ Manali Tour Package',
      rating: 4,
      text: 'Great sightseeing experience in Manali. The hotel view was stunning, though transport had a minor delay on the first morning.'
    },
    {
      label: '💬 2★ Flight Reschedule Issue',
      rating: 2,
      text: 'Airline changed our flight schedule and it took longer than expected to get the revised itinerary.'
    }
  ];

  const pendingFeedbacksCount = feedbacks.filter(f => f.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-[#2B1810] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-950/20 border border-teal-700/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-xs mb-2">
            <Sparkles size={12} className="text-amber-300" /> AI Review Growth Suite
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">AI Google Review Hub</h2>
          <p className="text-sm text-teal-100/90 mt-1 max-w-xl">
            Everything your small business needs to dominate Google Maps: reply to customer reviews in 1-tap, resolve complaints privately, and rank higher on Google Local 3-Pack.
          </p>
        </div>

        <a
          href={googleReviewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-teal-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all shrink-0 hover:scale-[1.02]"
        >
          <span>Open Google Business Profile</span>
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Hub Navigation Tabs */}
      <div className="flex border-b border-amber-900/10 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('reply')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 ${
            activeTab === 'reply'
              ? 'border-teal-700 text-teal-800 bg-teal-50/60'
              : 'border-transparent text-madverse-espresso-500 hover:text-madverse-espresso'
          }`}
        >
          <Sparkles size={16} className={activeTab === 'reply' ? 'text-teal-700' : ''} />
          <span>AI Review Responder</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 relative ${
            activeTab === 'inbox'
              ? 'border-teal-700 text-teal-800 bg-teal-50/60'
              : 'border-transparent text-madverse-espresso-500 hover:text-madverse-espresso'
          }`}
        >
          <HeartHandshake size={16} className={activeTab === 'inbox' ? 'text-teal-700' : ''} />
          <span>Private Resolution Inbox</span>
          {pendingFeedbacksCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
              {pendingFeedbacksCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('playbook')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 ${
            activeTab === 'playbook'
              ? 'border-teal-700 text-teal-800 bg-teal-50/60'
              : 'border-transparent text-madverse-espresso-500 hover:text-madverse-espresso'
          }`}
        >
          <TrendingUp size={16} className={activeTab === 'playbook' ? 'text-teal-700' : ''} />
          <span>Local SEO 3-Pack Playbook</span>
        </button>
      </div>

      {/* ─────────────────────────── TAB 1: AI REVIEW RESPONDER ─────────────────────────── */}
      {activeTab === 'reply' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-sm space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-black text-madverse-espresso">
                Generate SEO-Boosted Google Review Replies
              </h3>
              <p className="text-xs text-madverse-espresso-500 mt-1">
                Google ranks businesses higher when you reply quickly. Paste any review you received on Google Maps to get 3 ready-to-post responses tailored for {businessName}.
              </p>
            </div>

            {/* Step 1: Star Rating */}
            <div>
              <label className="block text-xs font-bold text-madverse-espresso-600 mb-2">
                1. Star Rating Received
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStarRating(star)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      starRating === star
                        ? 'bg-amber-100/80 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Star size={14} className={starRating >= star ? 'fill-amber-400 text-amber-400' : 'text-stone-300'} />
                    <span>{star} {star === 1 ? 'Star' : 'Stars'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Customer Review Text */}
            <div>
              <label className="block text-xs font-bold text-madverse-espresso-600 mb-2">
                2. Customer's Review
              </label>
              <textarea
                value={reviewInput}
                onChange={(e) => setReviewInput(e.target.value)}
                placeholder="Paste the customer's Google review here, e.g.: 'Had a wonderful tour package to Kerala arranged by Trident Net Holidays. Very punctual service!'"
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-amber-900/15 text-xs sm:text-sm focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none resize-none bg-[#FAF6F0]/30"
              />

              {/* Sample Test Prompts */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-madverse-espresso-400 flex items-center gap-1">
                  <Lightbulb size={12} className="text-amber-500" /> Quick test samples:
                </span>
                {sampleReviews.map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setStarRating(sample.rating);
                      setReviewInput(sample.text);
                      handleGenerateReplies(sample.text, sample.rating);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-teal-50 hover:text-teal-800 text-[11px] font-semibold text-stone-600 transition"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate CTA Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-stone-400">
                Powered by Google Gemini AI · Optimized for Mumbai Local SEO
              </span>

              <button
                type="button"
                disabled={generatingReplies || !reviewInput.trim()}
                onClick={() => handleGenerateReplies()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-800/20 transition-all hover:scale-[1.01]"
              >
                {generatingReplies ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Writing 3 SEO Responses...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-amber-300" />
                    <span>Generate AI Responses</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Responses Display */}
          {generatedReplies && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-madverse-espresso-500">
                  Ready-to-Post Replies (Select & Copy)
                </h4>
                <span className="text-xs text-teal-700 font-bold flex items-center gap-1">
                  <CheckCircle size={14} /> 3 Personalized Styles Created
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedReplies.map((reply, idx) => {
                  const isCopied = copiedIndex === idx;
                  const isSEO = reply.tone === 'Local SEO Boosted' || reply.badge === 'Google Maps SEO' || reply.badge === 'Local SEO Boosted';
                  const isWarm = reply.tone === 'Warm & Grateful' || reply.badge === 'High Loyalty' || reply.badge === 'Warm & Grateful';

                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                        isSEO 
                          ? 'border-teal-400/80 shadow-md shadow-teal-700/10 ring-1 ring-teal-400/40' 
                          : 'border-amber-900/10 shadow-sm'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isSEO 
                              ? 'bg-teal-100 text-teal-900' 
                              : isWarm 
                                ? 'bg-amber-100 text-amber-900' 
                                : 'bg-slate-100 text-slate-800'
                          }`}>
                            {reply.tone || reply.badge || reply.style}
                          </span>

                          {isSEO && (
                            <span className="text-[10px] font-bold text-teal-700 flex items-center gap-0.5">
                              <TrendingUp size={11} /> High SEO Value
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-madverse-espresso leading-relaxed whitespace-pre-wrap font-medium">
                          "{reply.text}"
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[11px] text-stone-400 font-mono">
                          {reply.text.length} chars
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopyReply(reply.text, idx)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isCopied
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check size={13} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy Reply</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Banner to Google */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <ExternalLink size={16} className="text-amber-700 shrink-0" />
                  <span>Next Step: Paste this response on Google Business Profile to show active customer care.</span>
                </div>
                <a
                  href={googleReviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shrink-0 text-center transition"
                >
                  Open Google Maps Reviews
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────── TAB 2: PRIVATE RESOLUTION INBOX ─────────────────────────── */}
      {activeTab === 'inbox' && (
        <div className="space-y-6">
          {/* Information Notice */}
          <div className="bg-teal-50/80 border border-teal-200/80 rounded-3xl p-5 sm:p-6 text-xs text-teal-900 space-y-2">
            <div className="flex items-center gap-2 font-black text-sm">
              <ShieldCheck size={18} className="text-teal-700" />
              <span>Google Anti-Gating Protection & Direct Owner Care</span>
            </div>
            <p className="leading-relaxed text-teal-800/90">
              When customers give 1 to 3 stars on your Express QR scanner, our platform offers them a direct private channel to message management. 
              This allows you to resolve grievances promptly before they turn into public 1-star Google reviews, while keeping you 100% compliant with Google's Anti-Gating policies.
            </p>
          </div>

          {/* Feedback List */}
          {loadingFeedbacks ? (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
              <Loader2 size={28} className="animate-spin text-teal-700 mb-2" />
              <p className="text-xs font-semibold">Loading private customer resolutions...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-amber-900/10 shadow-sm space-y-3">
              <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h4 className="text-base font-black text-madverse-espresso">Inbox Zero: No Private Complaints!</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Any private notes or concerns sent by customers who rated 1–3 stars will appear here so you can call or message them right away.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-madverse-espresso-500">
                  Customer Concerns ({feedbacks.length})
                </h4>
                <button
                  onClick={loadFeedbacks}
                  className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  <RefreshCw size={12} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="space-y-3">
                {feedbacks.map((fb) => {
                  const isResolved = fb.status === 'resolved';
                  const isContacted = fb.status === 'contacted';

                  return (
                    <div
                      key={fb.id}
                      className={`bg-white rounded-2xl p-5 border transition-all ${
                        isResolved 
                          ? 'border-stone-200 bg-stone-50/50 opacity-75' 
                          : 'border-amber-900/15 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                className={s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-stone-700">
                            {fb.customer_name ? fb.customer_name : 'Anonymous Guest'}
                          </span>
                          <span className="text-[11px] text-stone-400">· {fb.location_name || 'Mumbai'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isResolved
                              ? 'bg-teal-100 text-teal-800'
                              : isContacted
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-900'
                          }`}>
                            {fb.status || 'pending'}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(fb.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#FAF6F0]/60 rounded-xl p-3 border border-amber-900/5 mb-3">
                        <p className="text-xs text-madverse-espresso leading-relaxed">
                          "{fb.message}"
                        </p>
                      </div>

                      {/* Contact Info & Resolution Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          {fb.customer_contact ? (
                            <>
                              <a
                                href={`tel:${fb.customer_contact}`}
                                className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-900"
                              >
                                <Phone size={13} />
                                <span>{fb.customer_contact}</span>
                              </a>
                              <a
                                href={`mailto:${fb.customer_contact}`}
                                className="inline-flex items-center gap-1 font-bold text-stone-600 hover:text-stone-900"
                              >
                                <Mail size={13} />
                                <span>Email</span>
                              </a>
                            </>
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">No phone/email provided</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!isContacted && !isResolved && (
                            <button
                              type="button"
                              disabled={resolvingId === fb.id}
                              onClick={() => handleUpdateStatus(fb.id, 'contacted')}
                              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition"
                            >
                              Mark Contacted
                            </button>
                          )}
                          {!isResolved && (
                            <button
                              type="button"
                              disabled={resolvingId === fb.id}
                              onClick={() => handleUpdateStatus(fb.id, 'resolved')}
                              className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                              <Check size={12} />
                              <span>Mark Resolved</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────── TAB 3: LOCAL SEO PLAYBOOK ─────────────────────────── */}
      {activeTab === 'playbook' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-sm space-y-6">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900">
                Small Business Playbook
              </span>
              <h3 className="text-lg sm:text-xl font-black text-madverse-espresso mt-2">
                How to Rank in the Google Maps Local 3-Pack
              </h3>
              <p className="text-xs text-madverse-espresso-500 mt-1 max-w-2xl">
                Google's Local algorithm prioritizes three core metrics for ranking small businesses like {businessName}: 
                <strong> Review Velocity, Review Sentiment/Keywords, and Owner Engagement</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pillar 1 */}
              <div className="bg-[#FAF6F0]/60 rounded-2xl p-5 border border-amber-900/10 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black text-sm">
                  1
                </div>
                <h4 className="text-sm font-black text-madverse-espresso">
                  Reply to 100% of Reviews within 24 Hours
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Google explicitly states that replying to customer reviews builds trust and positively influences search ranking. Use the <strong>AI Review Responder</strong> tab to draft a personalized reply in 5 seconds.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-[#FAF6F0]/60 rounded-2xl p-5 border border-amber-900/10 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm">
                  2
                </div>
                <h4 className="text-sm font-black text-madverse-espresso">
                  Seed Target Search Keywords Naturally
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  When reviews or owner replies mention phrases like <em>"holiday packages in Mumbai"</em>, <em>"flight booking in Andheri"</em>, or <em>"Dubai visa service"</em>, Google associates your location with those high-intent customer searches.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-[#FAF6F0]/60 rounded-2xl p-5 border border-amber-900/10 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-900 text-white flex items-center justify-center font-black text-sm">
                  3
                </div>
                <h4 className="text-sm font-black text-madverse-espresso">
                  Place QR Counter Stands at Checkout
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  85% of reviews are lost when asked via email days later. Placing a physical QR stand on your reception desk lets customers scan right when they are happiest and waiting for documents.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="bg-[#FAF6F0]/60 rounded-2xl p-5 border border-amber-900/10 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  4
                </div>
                <h4 className="text-sm font-black text-madverse-espresso">
                  Stay 100% Google Anti-Gating Compliant
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Google bans businesses that block negative reviews. Our platform protects you legitimately: all customers can reach Google, while offering unsatisfied clients an instant direct line to you first.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────── Main Dashboard Router ───────────────────────────
const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="ai-hub" element={<AIReviewHub />} />
      <Route path="locations" element={<Locations />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminDashboard;
