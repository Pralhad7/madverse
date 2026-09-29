const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/init');
const auth = require('../middleware/auth');

const router = express.Router();

// PUBLIC endpoint - no auth required (used by customer review page)
router.get('/:id/public', (req, res) => {
    try {
        const data = getDB().prepare(`
            SELECT l.id as locationId, l.name as locationName, l.address, l.google_review_link,
                   b.name as businessName, b.category, b.logo_url, b.primary_color, b.secondary_color, b.language, b.tone
            FROM locations l
            JOIN businesses b ON l.business_id = b.id
            WHERE l.id = ? AND l.is_active = 1
        `).get(req.params.id);

        if (!data) return res.status(404).json({ error: 'Location not found or inactive' });

        // Get category prompts
        const categoryPrompts = getDB().prepare('SELECT prompts_json FROM category_prompts WHERE category = ?').get(data.category);
        const prompts = categoryPrompts ? JSON.parse(categoryPrompts.prompts_json) : [];

        res.json({
            locationId: data.locationId,
            locationName: data.locationName,
            address: data.address,
            googleReviewLink: data.google_review_link,
            businessName: data.businessName,
            category: data.category,
            logoUrl: data.logo_url,
            primaryColor: data.primary_color,
            secondaryColor: data.secondary_color,
            language: data.language,
            tone: data.tone,
            prompts
        });
    } catch (error) {
        console.error('Public location fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch location info' });
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
