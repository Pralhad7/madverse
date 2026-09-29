const express = require('express');
const { getDB } = require('../db/init');
const auth = require('../middleware/auth');
const qrService = require('../services/qr');

const router = express.Router();
router.use(auth);

router.get('/generate/:locationId', async (req, res) => {
    try {
        const location = getDB().prepare(`
            SELECT l.qr_code_url, b.primary_color 
            FROM locations l 
            JOIN businesses b ON l.business_id = b.id 
            WHERE l.id = ? AND l.business_id = ?
        `).get(req.params.locationId, req.user.business_id);
        
        if (!location) return res.status(404).json({ error: 'Location not found' });
        
        const dataUrl = await qrService.generateQRCode(location.qr_code_url, { color: location.primary_color });
        res.json({ dataUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

router.get('/download/:locationId', async (req, res) => {
    try {
        const location = getDB().prepare(`
            SELECT l.qr_code_url, b.primary_color 
            FROM locations l 
            JOIN businesses b ON l.business_id = b.id 
            WHERE l.id = ? AND l.business_id = ?
        `).get(req.params.locationId, req.user.business_id);
        
        if (!location) return res.status(404).json({ error: 'Location not found' });
        
        const buffer = await qrService.generateQRBuffer(location.qr_code_url, { color: location.primary_color });
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="qr-code-${req.params.locationId}.png"`);
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to download QR code' });
    }
});

module.exports = router;
