const express = require('express');
const { db } = require('../db/init');
const auth = require('../middleware/auth');

const router = express.Router();

// PUBLIC: Customer sends private note to business owner
router.post('/private', async (req, res) => {
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
        const locCheck = (await db.query('SELECT id FROM locations WHERE id = $1', [targetLocationId])).rows[0];
        if (!locCheck) {
            const fallbackLoc = (await db.query('SELECT id FROM locations ORDER BY updated_at DESC, created_at DESC LIMIT 1', [])).rows[0];
            if (fallbackLoc) {
                targetLocationId = fallbackLoc.id;
            }
        }

        if (targetLocationId) {
            await db.query(`
                INSERT INTO private_feedbacks (location_id, rating, customer_name, customer_contact, message)
                VALUES ($1, $2, $3, $4, $5)
            `, [targetLocationId, safeRating, safeName, safeContact, safeMessage]);

            // Log event
            try {
                await db.query('INSERT INTO analytics_events (location_id, event_type, language) VALUES ($1, $2, $3)', 
                  [targetLocationId, 'manager_feedback_submitted', 'en']);
            } catch (_) {}
        }

        res.json({ success: true, message: 'Private feedback delivered to management' });
    } catch (error) {
        console.error('Private feedback error:', error);
        res.status(500).json({ error: 'Failed to record feedback' });
    }
});

// AUTH: Business owner views private feedbacks
router.get('/private', auth, async (req, res) => {
    try {
        const feedbacks = (await db.query(`
            SELECT f.*, l.name as location_name
            FROM private_feedbacks f
            JOIN locations l ON f.location_id = l.id
            WHERE l.business_id = $4
            ORDER BY f.created_at DESC
            LIMIT 50
        `, [req.user.business_id])).rows;

        res.json(feedbacks);
    } catch (error) {
        console.error('Fetch private feedbacks error:', error);
        res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
});

// AUTH: Update private feedback status (e.g., resolved, contacted)
router.patch('/private/:id/status', auth, async (req, res) => {
    try {
        const { status = 'resolved' } = req.body;
        const validStatuses = ['pending', 'contacted', 'resolved'];
        const safeStatus = validStatuses.includes(status) ? status : 'resolved';
        
        await db.query(`
            UPDATE private_feedbacks 
            SET status = $1 
            WHERE id = $2
        `, [safeStatus, req.params.id]);

        res.json({ success: true, status: safeStatus });
    } catch (error) {
        console.error('Update feedback status error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
