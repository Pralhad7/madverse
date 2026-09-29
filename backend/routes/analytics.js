const express = require('express');
const { getDB } = require('../db/init');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100 
});

router.post('/event', limiter, (req, res) => {
    try {
        const { locationId, eventType, language = 'en' } = req.body;
        
        if (!locationId || !eventType) {
            return res.status(400).json({ error: 'Location ID and Event Type are required' });
        }

        getDB().prepare('INSERT INTO analytics_events (location_id, event_type, language) VALUES (?, ?, ?)')
          .run(locationId, eventType, language);
          
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log event' });
    }
});

router.get('/summary/:locationId', auth, (req, res) => {
    try {
        const locationCheck = getDB().prepare('SELECT id FROM locations WHERE id = ? AND business_id = ?').get(req.params.locationId, req.user.business_id);
        if (!locationCheck) return res.status(403).json({ error: 'Unauthorized' });

        const stats = getDB().prepare(`
            SELECT event_type, COUNT(*) as count 
            FROM analytics_events 
            WHERE location_id = ? 
            GROUP BY event_type
        `).all(req.params.locationId);

        const result = stats.reduce((acc, curr) => {
            acc[curr.event_type] = curr.count;
            return acc;
        }, {});

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

router.get('/summary', auth, (req, res) => {
    try {
        const stats = getDB().prepare(`
            SELECT a.event_type, COUNT(*) as count 
            FROM analytics_events a
            JOIN locations l ON a.location_id = l.id
            WHERE l.business_id = ?
            GROUP BY a.event_type
        `).all(req.user.business_id);

        const result = stats.reduce((acc, curr) => {
            acc[curr.event_type] = curr.count;
            return acc;
        }, {});

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch overall summary' });
    }
});

module.exports = router;
