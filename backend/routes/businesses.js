const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/init');
const auth = require('../middleware/auth');

const router = express.Router();
const rateLimit = require('express-rate-limit');
const JWT_SECRET = process.env.JWT_SECRET || 'madverse-default-production-secret-key-change-me';

// Brute-force protection for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Protection against registration abuse / account spamming
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many accounts created from this IP, please try again later.' }
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}){1,2}$/;

router.post('/', registerLimiter, async (req, res) => {
    try {
        const { name, category, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const trimmedEmail = String(email).trim().toLowerCase();
        if (!EMAIL_REGEX.test(trimmedEmail)) {
            return res.status(400).json({ error: 'Please provide a valid email address' });
        }

        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        const cleanName = String(name).trim().slice(0, 100);
        const cleanCategory = category ? String(category).trim().slice(0, 50) : 'retail';
        
        const checkEmail = (await db.query('SELECT id FROM admin_users WHERE email = $1', [trimmedEmail])).rows[0];
        if (checkEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const businessId = uuidv4();
        const userId = uuidv4();
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db.query('BEGIN');
        try {
            await db.query('INSERT INTO businesses (id, name, category) VALUES ($1, $2, $3)', [businessId, cleanName, cleanCategory]);
            await db.query('INSERT INTO admin_users (id, business_id, email, password_hash) VALUES ($1, $2, $3, $4)', [userId, businessId, trimmedEmail, passwordHash]);
        await db.query('COMMIT');
        } catch (e) { await db.query('ROLLBACK'); throw e; }

        const token = jwt.sign({ business_id: businessId, user_id: userId, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({ token, businessId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create business' });
    }
});

router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const trimmedEmail = String(email).trim().toLowerCase();
        const user = (await db.query('SELECT id, business_id, password_hash FROM admin_users WHERE email = $1', [trimmedEmail])).rows[0];
        
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const token = jwt.sign({ business_id: user.business_id, user_id: user.id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ token, businessId: user.business_id });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const business = (await db.query('SELECT id, name, category, logo_url, primary_color, secondary_color, language, tone, created_at FROM businesses WHERE id = $1', [req.user.business_id])).rows[0];
        if (!business) return res.status(404).json({ error: 'Business not found' });
        res.json(business);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

router.put('/me', auth, async (req, res) => {
    try {
        const { name, category, logo_url, primary_color, secondary_color, language, tone } = req.body;
        
        // Validate hex colors if provided
        if (primary_color && !HEX_COLOR_REGEX.test(primary_color)) {
            return res.status(400).json({ error: 'Primary color must be a valid hex code (e.g. #0D9488)' });
        }
        if (secondary_color && !HEX_COLOR_REGEX.test(secondary_color)) {
            return res.status(400).json({ error: 'Secondary color must be a valid hex code (e.g. #D97706)' });
        }
        if (logo_url && typeof logo_url === 'string' && logo_url.toLowerCase().startsWith('javascript:')) {
            return res.status(400).json({ error: 'Invalid logo URL' });
        }

        const cleanName = name ? String(name).trim().slice(0, 100) : undefined;
        const cleanCategory = category ? String(category).trim().slice(0, 50) : undefined;
        const cleanTone = tone ? String(tone).trim().slice(0, 50) : undefined;
        const cleanLang = language ? String(language).trim().slice(0, 10) : undefined;
        
        await db.query(`
            UPDATE businesses 
            SET name = COALESCE($1, name),
                category = COALESCE($2, category),
                logo_url = COALESCE($3, logo_url),
                primary_color = COALESCE($4, primary_color),
                secondary_color = COALESCE($5, secondary_color),
                language = COALESCE($6, language),
                tone = COALESCE($7, tone),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
        `, [cleanName, cleanCategory, logo_url, primary_color, secondary_color, cleanLang, cleanTone, req.user.business_id]);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

router.delete('/me', auth, async (req, res) => {
    try {
        await db.query('DELETE FROM businesses WHERE id = $1', [req.user.business_id]);
        res.json({ success: true, message: 'Business deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete business' });
    }
});

module.exports = router;
