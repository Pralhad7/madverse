const fs = require('fs');
const file = 'frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The new link helper button HTML
const linkHelper = `
            <div className="flex items-center justify-between mt-1">
              <a 
                href="https://business.google.com/locations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <ExternalLink size={10} /> Find my direct link on Google Business
              </a>
            </div>
`;

// Add it under the google_review_link input for Add Location
content = content.replace(
  /className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"\s*\/>/g,
  `className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />` + linkHelper
);

fs.writeFileSync(file, content);
console.log('Patched AdminDashboard.jsx');
