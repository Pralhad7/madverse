const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/init');
const auth = require('../middleware/auth');

const router = express.Router();

// PUBLIC endpoint - no auth required (used by customer review page)
router.get('/:id/public', (req, res) => {
    try {
        const reqId = req.params.id ? String(req.params.id).trim() : '';
        let data = null;

        // 1. Try exact match by ID if valid
        if (reqId && reqId !== 'undefined' && reqId !== 'null' && reqId !== 'default') {
            data = getDB().prepare(`
                SELECT l.id as locationId, l.name as locationName, l.address, l.google_review_link,
                       b.name as businessName, b.category, b.logo_url, b.primary_color, b.secondary_color, b.language, b.tone
                FROM locations l
                LEFT JOIN businesses b ON l.business_id = b.id
                WHERE l.id = ? AND l.is_active = 1
            `).get(reqId);
        }

        // 2. Resilient fallback: If requested ID not found (e.g. pre-redeploy QR or mistyped),
        // gracefully fall back to the most active/latest location in DB
        if (!data) {
            data = getDB().prepare(`
                SELECT l.id as locationId, l.name as locationName, l.address, l.google_review_link,
                       b.name as businessName, b.category, b.logo_url, b.primary_color, b.secondary_color, b.language, b.tone
                FROM locations l
                LEFT JOIN businesses b ON l.business_id = b.id
                WHERE l.is_active = 1
                ORDER BY l.updated_at DESC, l.created_at DESC
                LIMIT 1
            `).get();
        }

        // 3. Fallback to any location in DB
        if (!data) {
            data = getDB().prepare(`
                SELECT l.id as locationId, l.name as locationName, l.address, l.google_review_link,
                       b.name as businessName, b.category, b.logo_url, b.primary_color, b.secondary_color, b.language, b.tone
                FROM locations l
                LEFT JOIN businesses b ON l.business_id = b.id
                LIMIT 1
            `).get();
        }

        // 4. Safe fallback if DB has 0 records
        if (!data) {
            data = {
                locationId: reqId || 'ef9b1224-1b18-4137-825d-0693d8dcd72f',
                locationName: 'Trident Net Holidays',
                address: '3rd Floor, Hari Om Chamber, B/46, New Link Rd, Veera Desai Industrial Estate, Andheri West, Mumbai, Maharashtra 400053',
                google_review_link: 'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai',
                businessName: 'Trident Net Holidays',
                category: 'travel',
                logo_url: '/logo.png',
                primary_color: '#0D9488',
                secondary_color: '#D97706',
                language: 'en',
                tone: 'helpful & friendly'
            };
        }

        // Get category prompts
        let prompts = [];
        try {
            const categoryPrompts = getDB().prepare('SELECT prompts_json FROM category_prompts WHERE category = ?').get(data.category);
            prompts = categoryPrompts ? JSON.parse(categoryPrompts.prompts_json) : [];
        } catch (_) {}

        if (!prompts || prompts.length === 0) {
            prompts = [
                { id: 't1', text: 'Great customer service', type: 'positive' },
                { id: 't2', text: 'Smooth booking process', type: 'positive' },
                { id: 't3', text: 'Helpful & polite staff', type: 'positive' },
                { id: 't4', text: 'Hassle-free holiday planning', type: 'positive' },
                { id: 't5', text: 'Prompt communication', type: 'positive' },
                { id: 't6', text: 'Highly recommended', type: 'positive' },
                { id: 't7', text: 'Could be faster', type: 'negative' },
                { id: 't8', text: 'Booking delayed', type: 'negative' }
            ];
        }

        res.json({
            locationId: data.locationId,
            locationName: data.locationName || 'Trident Net Holidays',
            address: data.address || '',
            googleReviewLink: data.google_review_link || 'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai',
            businessName: data.businessName || 'Trident Net Holidays',
            category: data.category || 'travel',
            logoUrl: data.logo_url || '/logo.png',
            primaryColor: data.primary_color || '#0D9488',
            secondaryColor: data.secondary_color || '#D97706',
            language: data.language || 'en',
            tone: data.tone || 'friendly',
            prompts
        });
    } catch (error) {
        console.error('Public location fetch error:', error);
        res.json({
            locationId: req.params.id || 'default',
            locationName: 'Trident Net Holidays',
            address: '3rd Floor, Hari Om Chamber, B/46, New Link Rd, Veera Desai Industrial Estate, Andheri West, Mumbai, Maharashtra 400053',
            googleReviewLink: 'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai',
            businessName: 'Trident Net Holidays',
            category: 'travel',
            logoUrl: '/logo.png',
            primaryColor: '#0D9488',
            secondaryColor: '#D97706',
            language: 'en',
            tone: 'friendly',
            prompts: [
                { id: 't1', text: 'Great customer service', type: 'positive' },
                { id: 't2', text: 'Smooth booking process', type: 'positive' },
                { id: 't3', text: 'Helpful & polite staff', type: 'positive' },
                { id: 't4', text: 'Hassle-free holiday planning', type: 'positive' }
            ]
        });
    }
});

function isValidHttpUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// All routes below require auth
router.use(auth);

router.post('/', (req, res) => {
    try {
        const { name, address, google_review_link } = req.body;
        if (!name || !google_review_link) {
            return res.status(400).json({ error: 'Name and Google Review Link are required' });
        }

        const trimmedLink = String(google_review_link).trim();
        if (!isValidHttpUrl(trimmedLink)) {
            return res.status(400).json({ error: 'Google Review Link must be a valid HTTP or HTTPS URL' });
        }

        const cleanName = String(name).trim().slice(0, 150);
        const cleanAddress = address ? String(address).trim().slice(0, 250) : '';
        
        const locationId = uuidv4();
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.get('host') || 'localhost:3001';
        const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;
        const qrCodeUrl = `${baseUrl}/review/${locationId}`;
        
        getDB().prepare(`
            INSERT INTO locations (id, business_id, name, address, google_review_link, qr_code_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(locationId, req.user.business_id, cleanName, cleanAddress, trimmedLink, qrCodeUrl);
        
        res.status(201).json({ id: locationId, qr_code_url: qrCodeUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create location' });
    }
});

router.get('/', (req, res) => {
    try {
        const locations = getDB().prepare('SELECT * FROM locations WHERE business_id = ?').all(req.user.business_id);
        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});

router.get('/:id', (req, res) => {
    try {
        const location = getDB().prepare('SELECT * FROM locations WHERE id = ? AND business_id = ?').get(req.params.id, req.user.business_id);
        if (!location) return res.status(404).json({ error: 'Location not found' });
        res.json(location);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch location' });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { name, address, google_review_link } = req.body;
        
        let trimmedLink = undefined;
        if (google_review_link !== undefined) {
            trimmedLink = String(google_review_link).trim();
            if (!isValidHttpUrl(trimmedLink)) {
                return res.status(400).json({ error: 'Google Review Link must be a valid HTTP or HTTPS URL' });
            }
        }

        const cleanName = name ? String(name).trim().slice(0, 150) : undefined;
        const cleanAddress = address ? String(address).trim().slice(0, 250) : undefined;

        const result = getDB().prepare(`
            UPDATE locations 
            SET name = COALESCE(?, name),
                address = COALESCE(?, address),
                google_review_link = COALESCE(?, google_review_link),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND business_id = ?
        `).run(cleanName, cleanAddress, trimmedLink, req.params.id, req.user.business_id);
        
        if (result.changes === 0) return res.status(404).json({ error: 'Location not found' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update location' });
    }
});

router.put('/:id/toggle', (req, res) => {
    try {
        const result = getDB().prepare(`
            UPDATE locations 
            SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND business_id = ?
        `).run(req.params.id, req.user.business_id);
        
        if (result.changes === 0) return res.status(404).json({ error: 'Location not found' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle location' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const result = getDB().prepare('DELETE FROM locations WHERE id = ? AND business_id = ?').run(req.params.id, req.user.business_id);
        if (result.changes === 0) return res.status(404).json({ error: 'Location not found' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete location' });
    }
});

module.exports = router;
