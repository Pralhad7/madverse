import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, Printer, Sparkles, ExternalLink, Star } from 'lucide-react';

const QRCodeDisplay = ({ locationId, businessName = 'Our Business', primaryColor = '#2563eb' }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(locationId ? `/api/qr/image/${locationId}` : null);
  const [template, setTemplate] = useState('table-tent'); // 'table-tent', 'sticker', 'minimal'
  const reviewLink = `${window.location.origin}/review/${locationId}`;

  useEffect(() => {
    if (locationId) {
      setQrDataUrl(`/api/qr/image/${locationId}`);
    }
  }, [locationId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reviewLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const downloadUrl = `/api/qr/download/${locationId}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${businessName.replace(/\s+/g, '_')}_QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Template Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold">
        <button
          onClick={() => setTemplate('table-tent')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            template === 'table-tent' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Table Tent Flyer
        </button>
        <button
          onClick={() => setTemplate('sticker')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            template === 'sticker' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Counter Sticker
        </button>
        <button
          onClick={() => setTemplate('minimal')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            template === 'minimal' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Raw QR Only
        </button>
      </div>

      {/* Printable Preview Canvas */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-center">
        {template === 'table-tent' && (
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/90 text-center max-w-xs w-full space-y-3.5 print:shadow-none print:border-2">
            <div className="inline-flex items-center gap-1 text-amber-500 text-sm">
              <Star size={16} className="fill-amber-400" />
              <Star size={16} className="fill-amber-400" />
              <Star size={16} className="fill-amber-400" />
              <Star size={16} className="fill-amber-400" />
              <Star size={16} className="fill-amber-400" />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                How was your visit today?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan to share your honest account of <strong className="text-slate-800">{businessName}</strong> on Google.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white border-2 border-dashed border-blue-200 rounded-xl inline-block shadow-inner">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 object-contain mx-auto" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-slate-700">Point phone camera to scan</p>
              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Sparkles size={10} className="text-blue-500" /> Fast AI writing helper included
              </p>
            </div>
          </div>
        )}

        {template === 'sticker' && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white text-center max-w-xs w-full shadow-lg space-y-3">
            <span className="text-[11px] uppercase font-bold tracking-widest text-blue-200">
              {businessName}
            </span>
            <h4 className="text-lg font-black tracking-tight">Review us on Google</h4>
            <div className="p-3 bg-white rounded-2xl inline-block shadow-sm">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 object-contain mx-auto" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
              )}
            </div>
            <p className="text-xs text-blue-100 font-medium">Scan with your camera</p>
          </div>
        )}

        {template === 'minimal' && (
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 object-contain mx-auto" />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
            )}
          </div>
        )}
      </div>

      {/* URL Box */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-600">Direct Customer URL:</label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            readOnly
            value={reviewLink}
            className="flex-1 px-3 py-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Copy URL"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Download and Print Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition"
        >
          <Download size={15} />
          <span>Save PNG</span>
        </button>

        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition"
        >
          <Printer size={15} />
          <span>Print Flyer</span>
        </button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
