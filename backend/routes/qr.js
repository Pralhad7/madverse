const express = require('express');
const { getDB } = require('../db/init');
const qrService = require('../services/qr');

const router = express.Router();

/**
 * Helper to dynamically resolve target URL so QR code points to the real host domain
 */
function getTargetUrl(req, locationId) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.get('host') || 'localhost:3001';
    return process.env.BASE_URL 
        ? `${process.env.BASE_URL}/review/${locationId}`
        : `${protocol}://${host}/review/${locationId}`;
}

// PUBLIC endpoint: returns raw PNG image for <img src="..." /> tags
router.get('/image/:locationId', async (req, res) => {
    try {
        const location = getDB().prepare(`
            SELECT l.id, l.name, l.qr_code_url, b.primary_color 
            FROM locations l 
            LEFT JOIN businesses b ON l.business_id = b.id 
            WHERE l.id = ?
        `).get(req.params.locationId);
        
        if (!location) return res.status(404).json({ error: 'Location not found' });
        
        const targetUrl = getTargetUrl(req, location.id);
        const safeColor = location.primary_color && /^#[0-9a-fA-F]{3,6}$/.test(location.primary_color)
            ? location.primary_color 
            : '#0D9488';
        const buffer = await qrService.generateQRBuffer(targetUrl, { color: safeColor });
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(buffer);
    } catch (error) {
        console.error('QR image generation error:', error);
        res.status(500).json({ error: 'Failed to generate QR image' });
    }
});

// Dual-mode endpoint: returns JSON { dataUrl } if JSON requested, or raw image/png if requested by <img>
router.get('/generate/:locationId', async (req, res) => {
    try {
        const location = getDB().prepare(`
            SELECT l.id, l.name, l.qr_code_url, b.primary_color 
            FROM locations l 
            LEFT JOIN businesses b ON l.business_id = b.id 
            WHERE l.id = ?
        `).get(req.params.locationId);
        
        if (!location) return res.status(404).json({ error: 'Location not found' });
        
        const targetUrl = getTargetUrl(req, location.id);
        const safeColor = location.primary_color && /^#[0-9a-fA-F]{3,6}$/.test(location.primary_color)
            ? location.primary_color 
            : '#0D9488';

        // If client accepts JSON, return JSON base64 dataUrl
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            const dataUrl = await qrService.generateQRCode(targetUrl, { color: safeColor });
            return res.json({ dataUrl });
        }
        
        // Otherwise return raw PNG stream for <img> tags
        const buffer = await qrService.generateQRBuffer(targetUrl, { color: safeColor });
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(buffer);
    } catch (error) {
        console.error('QR code generation error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

// Download endpoint: returns downloadable attachment with custom filename
router.get('/download/:locationId', async (req, res) => {
    try {
        const location = getDB().prepare(`
            SELECT l.id, l.name, b.primary_color 
            FROM locations l 
            LEFT JOIN businesses b ON l.business_id = b.id 
            WHERE l.id = ?
        `).get(req.params.locationId);
        
        if (!location) return res.status(404).json({ error: 'Location not found' });
        
        const targetUrl = getTargetUrl(req, location.id);
        const safeColor = location.primary_color && /^#[0-9a-fA-F]{3,6}$/.test(location.primary_color)
            ? location.primary_color 
            : '#0D9488';
        const buffer = await qrService.generateQRBuffer(targetUrl, { color: safeColor });
        
        const safeName = (location.name || 'qr-code').replace(/[^a-zA-Z0-9_-]/g, '_');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}-review-qr.png"`);
        res.send(buffer);
    } catch (error) {
        console.error('QR download error:', error);
        res.status(500).json({ error: 'Failed to download QR code' });
    }
});

module.exports = router;
