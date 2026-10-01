const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db/init');
const auth = require('../middleware/auth');

const router = express.Router();

// PUBLIC: Get active staff for review screen
router.get('/public/:locationId', (req, res) => {
    try {
        const { locationId } = req.params;
        let staff = [];

        // Check if location exists
        const loc = getDB().prepare('SELECT business_id FROM locations WHERE id = ?').get(locationId);
        const bizId = loc ? loc.business_id : null;

        if (bizId) {
            staff = getDB().prepare(`
                SELECT id, name, role 
                FROM staff_members 
                WHERE business_id = ? AND is_active = 1
                ORDER BY created_at ASC
            `).all(bizId);
        }

        // Fallback default staff if none found
        if (!staff || staff.length === 0) {
            staff = [
                { id: 'staff-1', name: 'Pralhad Pawar', role: 'Founder & Head of Tours' },
                { id: 'staff-2', name: 'Sneha Sharma', role: 'Visa & Flight Specialist' },
                { id: 'staff-3', name: 'Amit Kulkarni', role: 'Custom Holiday Planner' }
            ];
        }

        res.json(staff);
    } catch (error) {
        console.error('Fetch public staff error:', error);
        res.json([
            { id: 'staff-1', name: 'Pralhad Pawar', role: 'Founder & Head of Tours' },
            { id: 'staff-2', name: 'Sneha Sharma', role: 'Visa & Flight Specialist' }
        ]);
    }
});

// AUTH: Get staff for business admin
router.get('/', auth, (req, res) => {
    try {
        const staff = getDB().prepare(`
            SELECT * FROM staff_members 
            WHERE business_id = ? 
            ORDER BY is_active DESC, created_at ASC
        `).all(req.user.business_id);
        res.json(staff);
    } catch (error) {
        console.error('Fetch staff error:', error);
        res.status(500).json({ error: 'Failed to fetch staff members' });
    }
});

// AUTH: Add new staff member
router.post('/', auth, (req, res) => {
    try {
        const { name, role = 'Staff' } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Staff name is required' });
        }

        const id = uuidv4();
        getDB().prepare(`
            INSERT INTO staff_members (id, business_id, name, role, is_active)
            VALUES (?, ?, ?, ?, 1)
        `).run(id, req.user.business_id, name.trim(), role.trim());

        const newStaff = getDB().prepare('SELECT * FROM staff_members WHERE id = ?').get(id);
        res.status(201).json(newStaff);
    } catch (error) {
        console.error('Add staff error:', error);
        res.status(500).json({ error: 'Failed to add staff member' });
    }
});

// AUTH: Delete staff member
router.delete('/:id', auth, (req, res) => {
    try {
        getDB().prepare(`
            DELETE FROM staff_members 
            WHERE id = ? AND business_id = ?
        `).run(req.params.id, req.user.business_id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({ error: 'Failed to delete staff member' });
    }
});

// AUTH: Staff Performance Leaderboard
router.get('/leaderboard', auth, (req, res) => {
    try {
        const staff = getDB().prepare(`
            SELECT id, name, role FROM staff_members 
            WHERE business_id = ? AND is_active = 1
        `).all(req.user.business_id);

        // Fetch WhatsApp invites count per staff
        const invitesPerStaff = getDB().prepare(`
            SELECT staff_name, COUNT(*) as count 
            FROM whatsapp_invites 
            WHERE staff_name IS NOT NULL AND staff_name != ''
            GROUP BY staff_name
        `).all();

        const inviteMap = {};
        invitesPerStaff.forEach(i => { inviteMap[i.staff_name] = i.count; });

        const leaderboard = staff.map(s => {
            const invitesSent = inviteMap[s.name] || 0;
            return {
                id: s.id,
                name: s.name,
                role: s.role,
                invitesSent,
                ratingScore: 5.0,
                badge: invitesSent > 5 ? 'Top Performer 🏆' : 'Active Specialist ⭐'
            };
        });

        res.json(leaderboard);
    } catch (error) {
        console.error('Staff leaderboard error:', error);
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});

module.exports = router;
