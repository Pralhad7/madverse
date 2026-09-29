const express = require('express');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const { getDB } = require('../db/init');
const { generateDrafts } = require('../services/ai');

const router = express.Router();

// Limit draft generation per IP to mitigate AI quota exhaustion & server load
const draftLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Draft generation limit reached. Please wait a few minutes before trying again.' }
});

router.post('/generate', draftLimiter, async (req, res) => {
    try {
        const { locationId, starRating, selectedPrompts = [], language = 'en', customDetails = '' } = req.body;
        
        if (!locationId || typeof locationId !== 'string') {
            return res.status(400).json({ error: 'Location ID is required' });
        }

        // Validate starRating
        const parsedRating = Number(starRating);
        const safeRating = (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) ? Math.round(parsedRating) : 5;

        // Sanitize and bound customDetails
        const safeCustomDetails = typeof customDetails === 'string' 
            ? customDetails.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, 400) 
            : '';

        // Validate and bound selectedPrompts array
        const safePrompts = Array.isArray(selectedPrompts)
            ? selectedPrompts.slice(0, 15).filter(p => typeof p === 'string').map(p => p.trim().slice(0, 100))
            : [];

        // Validate language string
        const safeLanguage = typeof language === 'string' && /^[a-zA-Z\-]{2,10}$/.test(language) ? language : 'en';

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
            starRating: safeRating,
            selectedPrompts: safePrompts,
            customDetails: safeCustomDetails,
            language: safeLanguage,
            tone: data.tone
        });

        // Log analytics
        getDB().prepare('INSERT INTO analytics_events (location_id, event_type, language) VALUES (?, ?, ?)')
          .run(locationId, 'draft_generated', safeLanguage);

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
