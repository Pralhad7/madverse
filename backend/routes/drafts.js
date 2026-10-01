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
        
        const reqId = locationId ? String(locationId).trim() : '';

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

        // 1. Try finding requested location by ID
        let data = null;
        if (reqId && reqId !== 'undefined' && reqId !== 'null' && reqId !== 'default') {
            data = getDB().prepare(`
                SELECT l.id as locationId, l.name as locationName, l.google_review_link, b.name as businessName, b.category, b.tone 
                FROM locations l 
                LEFT JOIN businesses b ON l.business_id = b.id 
                WHERE l.id = ? AND l.is_active = 1
            `).get(reqId);
        }

        // 2. Resilient fallback: active location in DB
        if (!data) {
            data = getDB().prepare(`
                SELECT l.id as locationId, l.name as locationName, l.google_review_link, b.name as businessName, b.category, b.tone 
                FROM locations l 
                LEFT JOIN businesses b ON l.business_id = b.id 
                WHERE l.is_active = 1
                ORDER BY l.updated_at DESC, l.created_at DESC
                LIMIT 1
            `).get();
        }

        // 3. Any location in DB
        if (!data) {
            data = getDB().prepare(`
                SELECT l.id as locationId, l.name as locationName, l.google_review_link, b.name as businessName, b.category, b.tone 
                FROM locations l 
                LEFT JOIN businesses b ON l.business_id = b.id 
                LIMIT 1
            `).get();
        }

        // 4. Safe fallback if DB is empty
        if (!data) {
            data = {
                locationId: reqId || 'ef9b1224-1b18-4137-825d-0693d8dcd72f',
                locationName: 'Trident Net Holidays',
                google_review_link: 'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai',
                businessName: 'Trident Net Holidays',
                category: 'travel',
                tone: 'helpful & friendly'
            };
        }

        const draftsArray = await generateDrafts({
            businessName: data.businessName || 'Trident Net Holidays',
            businessCategory: data.category || 'travel',
            locationName: data.locationName || 'Trident Net Holidays',
            starRating: safeRating,
            selectedPrompts: safePrompts,
            customDetails: safeCustomDetails,
            language: safeLanguage,
            tone: data.tone || 'helpful & friendly'
        });

        // Log analytics safely without throwing on foreign key constraint
        try {
            const locExists = getDB().prepare('SELECT id FROM locations WHERE id = ?').get(data.locationId);
            if (locExists) {
                getDB().prepare('INSERT INTO analytics_events (location_id, event_type, language) VALUES (?, ?, ?)')
                  .run(data.locationId, 'draft_generated', safeLanguage);
            }
        } catch (_) {}

        const formattedDrafts = (draftsArray || []).map(item => ({
            id: item.id || uuidv4(),
            tone: item.tone || 'Suggested Draft',
            badge: item.badge || 'AI Draft',
            text: typeof item === 'string' ? item : item.text
        }));

        res.json({ drafts: formattedDrafts, googleReviewLink: data.google_review_link });
    } catch (error) {
        console.error('Draft generation error:', error);
        // Even on error, generate fallback review variants with full multilingual support
        const { createFallbackVariants } = require('../services/ai');
        const fallbackDrafts = createFallbackVariants({
            businessName: (data && data.businessName) || 'Trident Net Holidays',
            locationName: (data && data.locationName) || 'Mumbai',
            starRating: req.body?.starRating || 5,
            selectedPrompts: req.body?.selectedPrompts || [],
            customDetails: req.body?.customDetails || '',
            language: req.body?.language || 'en'
        });
        res.json({
            drafts: fallbackDrafts,
            googleReviewLink: (data && data.google_review_link) || 'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai'
        });
    }
});

// AI Google Review Reply Generator for Small Business Owners
router.post('/reply', async (req, res) => {
    try {
        const { reviewText, starRating = 5, businessName = 'Trident Net Holidays', locationName = 'Mumbai' } = req.body;
        const { generateOwnerReplies } = require('../services/ai');
        const replies = await generateOwnerReplies({
            businessName,
            locationName,
            customerReview: reviewText,
            starRating: Number(starRating) || 5
        });
        res.json({ replies });
    } catch (error) {
        console.error('Reply generation error:', error);
        res.status(500).json({ error: 'Failed to generate replies' });
    }
});

module.exports = router;
