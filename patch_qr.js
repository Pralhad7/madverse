const fs = require('fs');
const file = 'frontend/src/components/PhysicalMerchStudio.jsx';
let content = fs.readFileSync(file, 'utf8');

const warning = `
        {/* Localhost Warning */}
        {window.location.hostname === 'localhost' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-800">
            <span className="font-bold shrink-0 mt-0.5">⚠️ Local Dev Warning:</span>
            <span>
              This QR code points to <strong>localhost</strong>, which cannot be scanned by your phone. 
              To test on your phone, access this dashboard via your computer's local IP address (e.g. http://192.168.x.x:5173).
            </span>
          </div>
        )}
`;

content = content.replace(
  /{locations\.length === 0 \? \(/g,
  warning + "\n{locations.length === 0 ? (" // wait this is admin dashboard
);

fs.writeFileSync(file, content);
