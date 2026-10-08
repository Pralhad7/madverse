const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/init');
const auth = require('../middleware/auth');

const router = express.Router();

// PUBLIC: Get active staff for review screen
router.get('/public/:locationId', async (req, res) => {
    try {
        const { locationId } = req.params;
        let staff = [];

        // Check if location exists
        const loc = (await db.query('SELECT business_id FROM locations WHERE id = $1', [locationId])).rows[0];
        const bizId = loc ? loc.business_id : null;

        if (bizId) {
            staff = (await db.query(`
                SELECT id, name, role 
                FROM staff_members 
                WHERE business_id = $1 AND is_active = 1
                ORDER BY created_at ASC
            `, [bizId])).rows;
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
router.get('/', auth, async (req, res) => {
    try {
        const staff = (await db.query(`
            SELECT * FROM staff_members 
            WHERE business_id = $1 
            ORDER BY is_active DESC, created_at ASC
        `, [req.user.business_id])).rows;
        res.json(staff);
    } catch (error) {
        console.error('Fetch staff error:', error);
        res.status(500).json({ error: 'Failed to fetch staff members' });
    }
});

// AUTH: Add new staff member
router.post('/', auth, async (req, res) => {
    try {
        const { name, role = 'Staff' } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Staff name is required' });
        }

        const id = uuidv4();
        await db.query(`
            INSERT INTO staff_members (id, business_id, name, role, is_active)
            VALUES ($1, $2, $3, $4, 1)
        `, [id, req.user.business_id, name.trim(]), role.trim());

        const newStaff = (await db.query('SELECT * FROM staff_members WHERE id = $1', [id])).rows[0];
        res.status(201).json(newStaff);
    } catch (error) {
        console.error('Add staff error:', error);
        res.status(500).json({ error: 'Failed to add staff member' });
    }
});

// AUTH: Delete staff member
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.query(`
            DELETE FROM staff_members 
            WHERE id = $1 AND business_id = $2
        `, [req.params.id, req.user.business_id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({ error: 'Failed to delete staff member' });
    }
});

// AUTH: Staff Performance Leaderboard
router.get('/leaderboard', auth, async (req, res) => {
    try {
        const staff = (await db.query(`
            SELECT id, name, role FROM staff_members 
            WHERE business_id = $1 AND is_active = 1
        `, [req.user.business_id])).rows;

        // Fetch WhatsApp invites count per staff
        const invitesPerStaff = (await db.query(`
            SELECT staff_name, COUNT(*) as count 
            FROM whatsapp_invites 
            WHERE staff_name IS NOT NULL AND staff_name != ''
            GROUP BY staff_name
        `, [])).rows;

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
