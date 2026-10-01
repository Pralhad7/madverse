const express = require('express');
const { getDB } = require('../db/init');
const auth = require('../middleware/auth');

const router = express.Router();

// PUBLIC: Customer sends private note to business owner
router.post('/private', (req, res) => {
    try {
        const { locationId, rating = 3, customerName = '', customerContact = '', message } = req.body;

        if (!message || String(message).trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const safeRating = Math.max(1, Math.min(5, Number(rating) || 3));
        const safeName = String(customerName || '').trim().slice(0, 100);
        const safeContact = String(customerContact || '').trim().slice(0, 100);
        const safeMessage = String(message).trim().slice(0, 1000);

        // Resolve active location ID
        let targetLocationId = locationId ? String(locationId).trim() : '';
        const locCheck = getDB().prepare('SELECT id FROM locations WHERE id = ?').get(targetLocationId);
        if (!locCheck) {
            const fallbackLoc = getDB().prepare('SELECT id FROM locations ORDER BY updated_at DESC, created_at DESC LIMIT 1').get();
            if (fallbackLoc) {
                targetLocationId = fallbackLoc.id;
            }
        }

        if (targetLocationId) {
            getDB().prepare(`
                INSERT INTO private_feedbacks (location_id, rating, customer_name, customer_contact, message)
                VALUES (?, ?, ?, ?, ?)
            `).run(targetLocationId, safeRating, safeName, safeContact, safeMessage);

            // Log event
            try {
                getDB().prepare('INSERT INTO analytics_events (location_id, event_type, language) VALUES (?, ?, ?)')
                  .run(targetLocationId, 'manager_feedback_submitted', 'en');
            } catch (_) {}
        }

        res.json({ success: true, message: 'Private feedback delivered to management' });
    } catch (error) {
        console.error('Private feedback error:', error);
        res.status(500).json({ error: 'Failed to record feedback' });
    }
});

// AUTH: Business owner views private feedbacks
router.get('/private', auth, (req, res) => {
    try {
        const feedbacks = getDB().prepare(`
            SELECT f.*, l.name as location_name
            FROM private_feedbacks f
            JOIN locations l ON f.location_id = l.id
            WHERE l.business_id = ?
            ORDER BY f.created_at DESC
            LIMIT 50
        `).all(req.user.business_id);

        res.json(feedbacks);
    } catch (error) {
        console.error('Fetch private feedbacks error:', error);
        res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
});

// AUTH: Update private feedback status (e.g., resolved, contacted)
router.patch('/private/:id/status', auth, (req, res) => {
    try {
        const { status = 'resolved' } = req.body;
        const validStatuses = ['pending', 'contacted', 'resolved'];
        const safeStatus = validStatuses.includes(status) ? status : 'resolved';
        
        getDB().prepare(`
            UPDATE private_feedbacks 
            SET status = ? 
            WHERE id = ?
        `).run(safeStatus, req.params.id);

        res.json({ success: true, status: safeStatus });
    } catch (error) {
        console.error('Update feedback status error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
