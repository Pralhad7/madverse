import React, { useState } from 'react';
import { MapPin, Trash2, QrCode, ExternalLink, Copy, Check, Power, Edit3, Zap, AlertTriangle } from 'lucide-react';

const LocationCard = ({ location, onToggle, onDelete, onShowQR, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const { id, name, address, is_active, isActive, google_review_link } = location;
  const activeStatus = is_active !== undefined ? is_active : isActive;
  const reviewUrl = `${window.location.origin}/review/${id}`;

  const isDirectReviewLink = Boolean(
    google_review_link && (
      google_review_link.includes('/review') ||
      google_review_link.includes('writereview') ||
      google_review_link.includes('g.page/r/')
    )
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group">
      <div>
        {/* Header with Title & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {name}
            </h4>
            <div className="flex items-center text-xs text-slate-500 mt-1">
              <MapPin size={13} className="text-slate-400 mr-1 shrink-0" />
              <span className="truncate max-w-[200px]">{address || 'No physical address specified'}</span>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            activeStatus 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' 
              : 'bg-amber-50 text-amber-700 border border-amber-200/80'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeStatus ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            {activeStatus ? 'Active' : 'Paused'}
          </span>
        </div>

        {/* Google Link Quality Indicator */}
        <div className="mb-3">
          {isDirectReviewLink ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Zap size={11} className="fill-emerald-500" />
              <span>Direct 5★ Google Review Modal</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <AlertTriangle size={11} className="text-amber-600" />
              <span>Generic Search Link (Edit to use Direct Link)</span>
            </span>
          )}
        </div>

        {/* Quick URL & Test Link Box */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Customer QR Link
            </span>
            <button
              onClick={handleCopyLink}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="font-mono text-[11px] text-slate-600 truncate bg-white px-2 py-1 rounded border border-slate-200/60">
            {reviewUrl}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onShowQR(location)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition"
            title="View & Print QR Code"
          >
            <QrCode size={14} />
            <span>QR & Flyer</span>
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(location)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
              title="Edit Location & Google Link"
            >
              <Edit3 size={15} />
            </button>
          )}

          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition"
            title="Test Customer Flow in New Tab"
          >
            <ExternalLink size={15} />
          </a>

          <button
            onClick={() => onToggle(location)}
            className={`p-2 rounded-xl transition ${
              activeStatus 
                ? 'text-amber-500 hover:bg-amber-50' 
                : 'text-emerald-500 hover:bg-emerald-50'
            }`}
            title={activeStatus ? 'Pause Location' : 'Activate Location'}
          >
            <Power size={15} />
          </button>
        </div>

        <button
          onClick={() => onDelete(location)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
          title="Delete Location"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default LocationCard;
