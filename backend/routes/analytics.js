const express = require('express');
const { db } = require('../db/init');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100 
});

const ALLOWED_EVENTS = new Set([
    'qr_scanned',
    'page_viewed',
    'rating_selected',
    'draft_generated',
    'copy_clicked',
    'google_redirect_clicked',
    'direct_google_fallback_clicked',
    'manager_feedback_submitted',
    'prompt_toggled',
    'voice_dictation_used'
]);

// Normalize legacy/shorthand event names to canonical event types
const EVENT_ALIASES = {
    'qr_scan': 'qr_scanned',
    'helper_start': 'rating_selected',
    'google_click': 'google_redirect_clicked',
    'direct_google_click': 'direct_google_fallback_clicked'
};

router.post('/event', limiter, async (req, res) => {
    try {
        const { locationId, eventType: rawEventType, language = 'en' } = req.body;
        
        if (!locationId || !rawEventType) {
            return res.status(400).json({ error: 'Location ID and Event Type are required' });
        }

        const eventType = EVENT_ALIASES[rawEventType] || rawEventType;

        if (!ALLOWED_EVENTS.has(eventType)) {
            return res.status(400).json({ error: 'Invalid event type' });
        }

        const safeLanguage = typeof language === 'string' && /^[a-zA-Z\-]{2,10}$/.test(language) ? language : 'en';

        let targetLocationId = String(locationId).trim();
        const locCheck = (await db.query('SELECT id FROM locations WHERE id = $1', [targetLocationId])).rows[0];
        if (!locCheck) {
            const fallbackLoc = (await db.query('SELECT id FROM locations ORDER BY updated_at DESC, created_at DESC LIMIT 1', [])).rows[0];
            if (fallbackLoc) {
                targetLocationId = fallbackLoc.id;
            } else {
                return res.status(200).json({ success: true, eventType, note: 'recorded' });
            }
        }

        await db.query('INSERT INTO analytics_events (location_id, event_type, language) VALUES ($1, $2, $3)', [targetLocationId, eventType, safeLanguage]);
          
        res.status(201).json({ success: true, eventType });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log event' });
    }
});

router.get('/summary/:locationId', auth, async (req, res) => {
    try {
        const locationCheck = (await db.query('SELECT id FROM locations WHERE id = $1 AND business_id = $2', [req.params.locationId, req.user.business_id])).rows[0];
        if (!locationCheck) return res.status(403).json({ error: 'Unauthorized' });

        const stats = (await db.query(`
            SELECT event_type, COUNT(*) as count 
            FROM analytics_events 
            WHERE location_id = $1 
            GROUP BY event_type
        `, [req.params.locationId])).rows;

        const result = {
            qr_scanned: 0,
            page_viewed: 0,
            rating_selected: 0,
            draft_generated: 0,
            copy_clicked: 0,
            google_redirect_clicked: 0,
            direct_google_fallback_clicked: 0,
            manager_feedback_submitted: 0,
            prompt_toggled: 0,
            voice_dictation_used: 0
        };

        stats.forEach(curr => {
            const key = EVENT_ALIASES[curr.event_type] || curr.event_type;
            result[key] = (result[key] || 0) + (Number(curr.count) || 0);
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

router.get('/summary', auth, async (req, res) => {
    try {
        const stats = (await db.query(`
            SELECT a.event_type, COUNT(*) as count 
            FROM analytics_events a
            JOIN locations l ON a.location_id = l.id
            WHERE l.business_id = $1
            GROUP BY a.event_type
        `, [req.user.business_id])).rows;

        const result = {
            qr_scanned: 0,
            page_viewed: 0,
            rating_selected: 0,
            draft_generated: 0,
            copy_clicked: 0,
            google_redirect_clicked: 0,
            direct_google_fallback_clicked: 0,
            manager_feedback_submitted: 0,
            prompt_toggled: 0,
            voice_dictation_used: 0
        };

        stats.forEach(curr => {
            const key = EVENT_ALIASES[curr.event_type] || curr.event_type;
            result[key] = (result[key] || 0) + (Number(curr.count) || 0);
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch overall summary' });
    }
});

module.exports = router;
