const express = require('express');
const { db } = require('../db/init');

const router = express.Router();

// PUBLIC: Return JSON data for website widget
router.get('/data/:locationId', async (req, res) => {
    try {
        const { locationId } = req.params;
        let loc = (await db.query(`
            SELECT l.*, b.name as business_name, b.logo_url 
            FROM locations l 
            JOIN businesses b ON l.business_id = b.id 
            WHERE l.id = $1
        `, [locationId])).rows[0];

        if (!loc) {
            loc = (await db.query(`
                SELECT l.*, b.name as business_name, b.logo_url 
                FROM locations l 
                JOIN businesses b ON l.business_id = b.id 
                ORDER BY l.updated_at DESC LIMIT 1
            `, [])).rows[0];
        }

        const data = {
            businessName: loc?.business_name || 'Trident Net Holidays',
            locationName: loc?.name || 'Mumbai',
            address: loc?.address || 'Andheri West, Mumbai',
            rating: 4.9,
            reviewCount: 174,
            googleReviewLink: loc?.google_review_link || 'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai',
            reviewUrl: `https://madverse-l7jo.onrender.com/review/${loc?.id || 'ef9b1224-1b18-4137-825d-0693d8dcd72f'}`
        };

        res.json(data);
    } catch (error) {
        console.error('Widget data error:', error);
        res.status(500).json({ error: 'Failed to load widget data' });
    }
});

// PUBLIC: Embeddable JavaScript SDK snippet
router.get('/embed.js', async (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
(function() {
  var scriptTag = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  await db.query('COMMIT');
        } catch (e) { await db.query('ROLLBACK'); throw e; }
  var locId = scriptTag.getAttribute('data-location-id') || 'ef9b1224-1b18-4137-825d-0693d8dcd72f';
  var position = scriptTag.getAttribute('data-position') || 'bottom-right';

  var host = 'https://madverse-l7jo.onrender.com';
  
  fetch(host + '/api/widget/data/' + locId)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var badge = document.createElement('div');
      badge.id = 'madverse-floating-badge';
      badge.style.position = 'fixed';
      badge.style.bottom = position.includes('top') ? 'auto' : '20px';
      badge.style.top = position.includes('top') ? '20px' : 'auto';
      badge.style.right = position.includes('left') ? 'auto' : '20px';
      badge.style.left = position.includes('left') ? '20px' : 'auto';
      badge.style.zIndex = '999999';
      badge.style.backgroundColor = '#ffffff';
      badge.style.border = '1px solid #e2e8f0';
      badge.style.borderRadius = '50px';
      badge.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08)';
      badge.style.padding = '8px 18px 8px 12px';
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.gap = '10px';
      badge.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      badge.style.cursor = 'pointer';
      badge.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

      badge.onmouseover = function() { badge.style.transform = 'translateY(-2px)'; };
      badge.onmouseout = function() { badge.style.transform = 'translateY(0)'; };

      badge.innerHTML = [
        '<svg width="24" height="24" viewBox="0 0 24 24">',
          '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>',
          '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>',
          '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>',
          '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>',
        '</svg>',
        '<div>',
          '<div style="display:flex;align-items:center;gap:4px;">',
            '<span style="font-weight:800;font-size:13px;color:#1e293b;">4.9</span>',
            '<span style="color:#f59e0b;font-size:13px;letter-spacing:1px;">★★★★★</span>',
            '<span style="font-size:10px;color:#64748b;font-weight:600;">(' + data.reviewCount + ')</span>',
          '</div>',
          '<div style="font-size:11px;color:#0f766e;font-weight:700;">' + data.businessName + '</div>',
        '</div>'
      ].join('');

      badge.onclick = function() {
        window.open(data.reviewUrl, '_blank');
      };

      document.body.appendChild(badge);
    })
    .catch(function(err) {
      console.warn('Madverse widget load error:', err);
    });
await db.query('COMMIT');
        } catch (e) { await db.query('ROLLBACK'); throw e; }
    `);
});

module.exports = router;
