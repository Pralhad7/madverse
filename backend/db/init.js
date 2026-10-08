const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/madverse',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

let initialized = false;

// Mock wrapper to make the transition easier for any files we missed
// (But our subagent is rewriting everything to use `db.query`)
const dbWrapper = {
    query: async (text, params) => {
        return await pool.query(text, params);
    },
    // Keep getDB() compatibility for now
    pool: pool
};

async function initDB() {
    if (initialized) return dbWrapper;

    try {
        await pool.query('SELECT NOW()'); // Test connection
        console.log('Connected to PostgreSQL Database.');
        
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute schema
        await pool.query(schemaSQL);
        console.log('Schema synchronized.');

        // Seed default category prompts if empty
        const promptCheck = await pool.query('SELECT COUNT(*) as count FROM category_prompts');
        if (parseInt(promptCheck.rows[0].count) === 0) {
            const categories = [
                {
                    category: 'restaurant',
                    prompts: [
                        { id: '1', text: 'Delicious food', type: 'positive' },
                        { id: '2', text: 'Friendly staff', type: 'positive' },
                        { id: '3', text: 'Great atmosphere', type: 'positive' },
                        { id: '4', text: 'Fast service', type: 'positive' },
                        { id: '5', text: 'Cold food', type: 'negative' },
                        { id: '6', text: 'Slow service', type: 'negative' }
                    ]
                },
                {
                    category: 'salon',
                    prompts: [
                        { id: 's1', text: 'Clean environment', type: 'positive' },
                        { id: 's2', text: 'Talented stylist', type: 'positive' },
                        { id: 's3', text: 'Relaxing experience', type: 'positive' },
                        { id: 's4', text: 'Not what I asked for', type: 'negative' },
                        { id: 's5', text: 'Late start', type: 'negative' },
                        { id: 's6', text: 'Overpriced', type: 'negative' }
                    ]
                },
                {
                    category: 'auto_repair',
                    prompts: [
                        { id: 'a1', text: 'Honest pricing', type: 'positive' },
                        { id: 'a2', text: 'Quick repair', type: 'positive' },
                        { id: 'a3', text: 'Knowledgeable mechanics', type: 'positive' },
                        { id: 'a4', text: 'Took too long', type: 'negative' },
                        { id: 'a5', text: 'Unexpected charges', type: 'negative' },
                        { id: 'a6', text: 'Issue not fixed', type: 'negative' }
                    ]
                },
                {
                    category: 'retail',
                    prompts: [
                        { id: 'rt1', text: 'Great selection', type: 'positive' },
                        { id: 'rt2', text: 'Helpful staff', type: 'positive' },
                        { id: 'rt3', text: 'Good prices', type: 'positive' },
                        { id: 'rt4', text: 'Out of stock', type: 'negative' },
                        { id: 'rt5', text: 'Unhelpful staff', type: 'negative' },
                        { id: 'rt6', text: 'Long checkout line', type: 'negative' }
                    ]
                },
                {
                    category: 'travel',
                    prompts: [
                        { id: 't1', text: 'Great customer service', type: 'positive' },
                        { id: 't2', text: 'Smooth booking process', type: 'positive' },
                        { id: 't3', text: 'Helpful & polite staff', type: 'positive' },
                        { id: 't4', text: 'Hassle-free holiday planning', type: 'positive' },
                        { id: 't5', text: 'Prompt communication', type: 'positive' },
                        { id: 't6', text: 'Highly recommended', type: 'positive' },
                        { id: 't7', text: 'Could be faster', type: 'negative' },
                        { id: 't8', text: 'Booking delayed', type: 'negative' }
                    ]
                }
            ];

            for (const c of categories) {
                await pool.query('INSERT INTO category_prompts (category, prompts_json) VALUES ($1, $2)', [c.category, JSON.stringify(c.prompts)]);
            }
            console.log('Seeded category prompts.');
        }

        // Migration logic for defaults
        const anyLoc = await pool.query('SELECT id FROM locations LIMIT 1');
        if (anyLoc.rows.length === 0) {
            const biz = await pool.query('SELECT id FROM businesses LIMIT 1');
            const bizId = biz.rows.length > 0 ? biz.rows[0].id : '09bb176e-a2b0-422c-afc8-2a0c3495ecbf';
            
            if (biz.rows.length === 0) {
                await pool.query(
                    `INSERT INTO businesses (id, name, category, logo_url, primary_color, secondary_color, tone) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [bizId, 'MadVerse', 'travel', '/logo.png', '#0D9488', '#D97706', 'helpful & friendly']
                );
            }
            
            await pool.query(
                `INSERT INTO locations (id, business_id, name, address, google_review_link, is_active, qr_code_url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    'ef9b1224-1b18-4137-825d-0693d8dcd72f', bizId, 'Trident Net Holidays',
                    '3rd Floor, Hari Om Chamber, B/46, New Link Rd, Veera Desai Industrial Estate, Andheri West, Mumbai, Maharashtra 400053',
                    'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai',
                    true, 'https://madverse-l7jo.onrender.com/review/ef9b1224-1b18-4137-825d-0693d8dcd72f'
                ]
            );
            console.log('Seeded Trident Net Holidays location.');
        }

        const staffCheck = await pool.query('SELECT COUNT(*) as count FROM staff_members');
        if (parseInt(staffCheck.rows[0].count) === 0) {
            const biz = await pool.query('SELECT id FROM businesses LIMIT 1');
            const bId = biz.rows.length > 0 ? biz.rows[0].id : '09bb176e-a2b0-422c-afc8-2a0c3495ecbf';
            const defaultStaff = [
                { id: 'staff-1', name: 'Pralhad Pawar', role: 'Founder & Head of Tours' },
                { id: 'staff-2', name: 'Sneha Sharma', role: 'Visa & Flight Specialist' },
                { id: 'staff-3', name: 'Amit Kulkarni', role: 'Custom Holiday Planner' }
            ];
            for (const s of defaultStaff) {
                await pool.query(
                    'INSERT INTO staff_members (id, business_id, name, role, is_active) VALUES ($1, $2, $3, $4, true)',
                    [s.id, bId, s.name, s.role]
                );
            }
            console.log('Seeded default staff members.');
        }

        initialized = true;
        return dbWrapper;
    } catch (e) {
        console.error('PostgreSQL Initialization Error:', e);
        process.exit(1);
    }
}

module.exports = { initDB, getDB: () => dbWrapper, db: dbWrapper };
