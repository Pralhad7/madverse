const express = require('express');
const { db } = require('../db/init');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper to clean international/Indian phone numbers
function formatPhoneNumber(phone) {
    let cleaned = String(phone || '').replace(/[^0-9]/g, '');
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned; // Default Indian 10-digit mobile
    }
    return cleaned;
}

// Templates library
function getTemplates({ customerName, businessName, locationName, serviceName, staffName, reviewUrl }) {
    const name = customerName ? customerName.trim() : 'Valued Guest';
    const biz = businessName || 'Trident Net Holidays';
    const srv = serviceName || 'travel service';
    const staff = staffName ? ` (${staffName})` : '';

    return {
        warm: `Hi ${name}! 🙏 Thank you so much for choosing ${biz} for your ${srv}. We hope you had a truly wonderful experience! Could you take 10 seconds to share your feedback on Google? It helps our small team grow and means everything to us: ⭐⭐⭐⭐⭐\n\n👉 ${reviewUrl}`,
        
        post_trip: `Dear ${name}, welcome back! ✈️ The entire team at ${biz}${staff} hopes you had an unforgettable trip. We would love to hear your thoughts—please tap below to leave us a quick Google review:\n\n👉 ${reviewUrl}\n\nThank you for traveling with us!`,
        
        visa: `Hi ${name}! 📄 Great news regarding your ${srv} with ${biz}. We strive to provide fast, reliable assistance. Could you kindly rate our service with a quick 5-star review on Google?\n\n👉 ${reviewUrl}\n\nWe truly appreciate your support!`,
        
        concise: `Hi ${name}, thank you for visiting ${biz} (${locationName})! Please take 10 seconds to rate us on Google: ⭐⭐⭐⭐⭐\n\n👉 ${reviewUrl}`
    };
}

// PUBLIC/AUTH: Send/Generate WhatsApp Review Invitation
router.post('/invite', async (req, res) => {
    try {
        const { 
            locationId, 
            customerName = '', 
            customerPhone, 
            serviceName = 'Holiday Tour & Travel', 
            staffName = '', 
            templateKey = 'warm',
            customMessage = '' 
        } = req.body;

        if (!customerPhone || String(customerPhone).trim().length < 6) {
            return res.status(400).json({ error: 'Valid customer phone number is required' });
        }

        const cleanPhone = formatPhoneNumber(customerPhone);

        // Fetch location details
        let loc = null;
        if (locationId) {
            loc = (await db.query(`
                SELECT l.*, b.name as business_name, b.category 
                FROM locations l 
                JOIN businesses b ON l.business_id = b.id 
                WHERE l.id = $1
            `, [locationId])).rows[0];
        }

        if (!loc) {
            loc = (await db.query(`
                SELECT l.*, b.name as business_name, b.category 
                FROM locations l 
                JOIN businesses b ON l.business_id = b.id 
                ORDER BY l.updated_at DESC, l.created_at DESC 
                LIMIT 1
            `, [])).rows[0];
        }

        const businessName = loc?.business_name || 'Trident Net Holidays';
        const locationName = loc?.name || 'Mumbai';
        const targetLocId = loc?.id || 'ef9b1224-1b18-4137-825d-0693d8dcd72f';
        
        // Custom URL with tracking parameters
        const staffParam = staffName ? `&staff=${encodeURIComponent(staffName)}` : '';
        const nameParam = customerName ? `&cname=${encodeURIComponent(customerName)}` : '';
        const reviewUrl = `https://madverse-l7jo.onrender.com/review/${targetLocId}?source=wa${staffParam}${nameParam}`;

        const templates = getTemplates({
            customerName,
            businessName,
            locationName,
            serviceName,
            staffName,
            reviewUrl
        });

        const messageText = customMessage && customMessage.trim().length > 0 
            ? customMessage.trim() + `\n\n👉 ${reviewUrl}`
            : (templates[templateKey] || templates.warm);

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

        // Record in whatsapp_invites table
        try {
            await db.query(`
                INSERT INTO whatsapp_invites (location_id, customer_name, customer_phone, service_name, staff_name, status)
                VALUES ($1, $2, $3, $4, $5, 'sent')
            `, [targetLocId, customerName, cleanPhone, serviceName, staffName]);

            await db.query('INSERT INTO analytics_events (location_id, event_type, language) VALUES ($1, $2, $3)', 
              [targetLocId, 'whatsapp_invite_created', 'en']);
        } catch (dbErr) {
            console.error('DB save error for whatsapp invite:', dbErr.message);
        }

        res.json({
            success: true,
            whatsappUrl: waUrl,
            message: messageText,
            cleanPhone,
            reviewUrl,
            customerName
        });
    } catch (error) {
        console.error('WhatsApp invite error:', error);
        res.status(500).json({ error: 'Failed to generate WhatsApp invite' });
    }
});

// AUTH: Get recent invites for dashboard
router.get('/invites', auth, async (req, res) => {
    try {
        const invites = (await db.query(`
            SELECT w.*, l.name as location_name 
            FROM whatsapp_invites w
            JOIN locations l ON w.location_id = l.id
            WHERE l.business_id = $4
            ORDER BY w.created_at DESC
            LIMIT 50
        `, [req.user.business_id])).rows;

        res.json(invites);
    } catch (error) {
        console.error('Get invites error:', error);
        res.status(500).json({ error: 'Failed to fetch invites' });
    }
});

module.exports = router;
