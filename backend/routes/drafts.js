const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/init');
const { generateDrafts } = require('../services/ai');

const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { locationId, starRating, selectedPrompts = [], language = 'en', customDetails = '' } = req.body;
        
        if (!locationId) return res.status(400).json({ error: 'Location ID is required' });

        const data = getDB().prepare(`
            SELECT l.name as locationName, l.google_review_link, b.name as businessName, b.category, b.tone 
            FROM locations l 
            JOIN businesses b ON l.business_id = b.id 
            WHERE l.id = ? AND l.is_active = 1
        `).get(locationId);

        if (!data) return res.status(404).json({ error: 'Location not found or inactive' });

        const draftsArray = await generateDrafts({
            businessName: data.businessName,
            businessCategory: data.category,
            locationName: data.locationName,
            starRating,
            selectedPrompts,
            customDetails,
            language,
            tone: data.tone
        });

        // Log analytics
        getDB().prepare('INSERT INTO analytics_events (location_id, event_type, language) VALUES (?, ?, ?)')
          .run(locationId, 'draft_generated', language);

        const formattedDrafts = draftsArray.map(item => ({
            id: item.id || uuidv4(),
            tone: item.tone || 'Suggested Draft',
            badge: item.badge || 'AI Draft',
            text: typeof item === 'string' ? item : item.text
        }));

        res.json({ drafts: formattedDrafts, googleReviewLink: data.google_review_link });
    } catch (error) {
        console.error('Draft generation error:', error);
        res.status(500).json({ error: 'Failed to generate drafts' });
    }
});

module.exports = router;
