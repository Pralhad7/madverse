const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db/init');
const auth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'madverse-default-production-secret-key-change-me';

router.post('/', async (req, res) => {
    try {
        const { name, category, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        
        const checkEmail = getDB().prepare('SELECT id FROM admin_users WHERE email = ?').get(email);
        if (checkEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const businessId = uuidv4();
        const userId = uuidv4();
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        getDB().transaction(() => {
            getDB().prepare('INSERT INTO businesses (id, name, category) VALUES (?, ?, ?)').run(businessId, name, category || 'retail');
            getDB().prepare('INSERT INTO admin_users (id, business_id, email, password_hash) VALUES (?, ?, ?, ?)').run(userId, businessId, email, passwordHash);
        })();

        const token = jwt.sign({ business_id: businessId, user_id: userId, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({ token, businessId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create business' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = getDB().prepare('SELECT id, business_id, password_hash FROM admin_users WHERE email = ?').get(email);
        
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ business_id: user.business_id, user_id: user.id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ token, businessId: user.business_id });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

router.get('/me', auth, (req, res) => {
    try {
        const business = getDB().prepare('SELECT id, name, category, logo_url, primary_color, secondary_color, language, tone, created_at FROM businesses WHERE id = ?').get(req.user.business_id);
        if (!business) return res.status(404).json({ error: 'Business not found' });
        res.json(business);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

router.put('/me', auth, (req, res) => {
    try {
        const { name, category, logo_url, primary_color, secondary_color, language, tone } = req.body;
        
        getDB().prepare(`
            UPDATE businesses 
            SET name = COALESCE(?, name),
                category = COALESCE(?, category),
                logo_url = COALESCE(?, logo_url),
                primary_color = COALESCE(?, primary_color),
                secondary_color = COALESCE(?, secondary_color),
                language = COALESCE(?, language),
                tone = COALESCE(?, tone),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(name, category, logo_url, primary_color, secondary_color, language, tone, req.user.business_id);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

router.delete('/me', auth, (req, res) => {
    try {
        getDB().prepare('DELETE FROM businesses WHERE id = ?').run(req.user.business_id);
        res.json({ success: true, message: 'Business deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete business' });
    }
});

module.exports = router;
