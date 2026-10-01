const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'reviewcanvas.db');
const schemaPath = path.join(__dirname, 'schema.sql');

let db = null;
let initialized = false;

/**
 * Wrapper around sql.js to provide a better-sqlite3-like API
 * so existing route code works with minimal changes.
 */
class DBWrapper {
    constructor(sqlDb) {
        this._db = sqlDb;
    }

    prepare(sql) {
        const self = this;
        return {
            run(...params) {
                self._db.run(sql, params);
                const changes = self._db.getRowsModified();
                try { self.save(); } catch (_) {}
                return { changes };
            },
            get(...params) {
                const stmt = self._db.prepare(sql);
                stmt.bind(params);
                if (stmt.step()) {
                    const row = stmt.getAsObject();
                    stmt.free();
                    return row;
                }
                stmt.free();
                return undefined;
            },
            all(...params) {
                const results = [];
                const stmt = self._db.prepare(sql);
                stmt.bind(params);
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                return results;
            }
        };
    }

    exec(sql) {
        this._db.exec(sql);
    }

    pragma(pragmaStr) {
        this._db.exec(`PRAGMA ${pragmaStr};`);
    }

    transaction(fn) {
        const self = this;
        return function(...args) {
            self._db.exec('BEGIN TRANSACTION');
            try {
                fn(...args);
                self._db.exec('COMMIT');
            } catch (e) {
                self._db.exec('ROLLBACK');
                throw e;
            }
        };
    }

    /** Persist the database to disk */
    save() {
        const data = this._db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

async function initDB() {
    if (initialized) return db;

    const SQL = await initSqlJs();

    let sqlDb;
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        sqlDb = new SQL.Database(fileBuffer);
    } else {
        sqlDb = new SQL.Database();
    }

    db = new DBWrapper(sqlDb);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Run schema
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);

    // Seed category prompts
    const check = db.prepare('SELECT COUNT(*) as count FROM category_prompts').get();
    if (check.count === 0) {
        const categories = [
            {
                category: 'restaurant',
                prompts: [
                    { id: 'r1', text: 'Great food', type: 'positive' },
                    { id: 'r2', text: 'Excellent service', type: 'positive' },
                    { id: 'r3', text: 'Cozy atmosphere', type: 'positive' },
                    { id: 'r4', text: 'Food was cold', type: 'negative' },
                    { id: 'r5', text: 'Slow service', type: 'negative' },
                    { id: 'r6', text: 'Too noisy', type: 'negative' },
                    { id: 'r7', text: 'Overpriced', type: 'negative' },
                    { id: 'r8', text: 'Good value', type: 'positive' }
                ]
            },
            {
                category: 'hotel',
                prompts: [
                    { id: 'h1', text: 'Clean room', type: 'positive' },
                    { id: 'h2', text: 'Friendly staff', type: 'positive' },
                    { id: 'h3', text: 'Great location', type: 'positive' },
                    { id: 'h4', text: 'Noisy room', type: 'negative' },
                    { id: 'h5', text: 'Uncomfortable bed', type: 'negative' },
                    { id: 'h6', text: 'Poor breakfast', type: 'negative' }
                ]
            },
            {
                category: 'clinic',
                prompts: [
                    { id: 'c1', text: 'Caring doctor', type: 'positive' },
                    { id: 'c2', text: 'Short wait time', type: 'positive' },
                    { id: 'c3', text: 'Clean facility', type: 'positive' },
                    { id: 'c4', text: 'Long wait time', type: 'negative' },
                    { id: 'c5', text: 'Rushed appointment', type: 'negative' },
                    { id: 'c6', text: 'Unfriendly staff', type: 'negative' }
                ]
            },
            {
                category: 'salon',
                prompts: [
                    { id: 's1', text: 'Great haircut', type: 'positive' },
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
            db.prepare('INSERT INTO category_prompts (category, prompts_json) VALUES (?, ?)').run(c.category, JSON.stringify(c.prompts));
        }
        console.log('Seeded category prompts.');
    } else {
        // Ensure travel prompts exist
        try {
            const hasTravel = db.prepare('SELECT id FROM category_prompts WHERE category = ?').get('travel');
            if (!hasTravel) {
                const travelPrompts = [
                    { id: 't1', text: 'Great customer service', type: 'positive' },
                    { id: 't2', text: 'Smooth booking process', type: 'positive' },
                    { id: 't3', text: 'Helpful & polite staff', type: 'positive' },
                    { id: 't4', text: 'Hassle-free holiday planning', type: 'positive' },
                    { id: 't5', text: 'Prompt communication', type: 'positive' },
                    { id: 't6', text: 'Highly recommended', type: 'positive' },
                    { id: 't7', text: 'Could be faster', type: 'negative' },
                    { id: 't8', text: 'Booking delayed', type: 'negative' }
                ];
                db.prepare('INSERT INTO category_prompts (category, prompts_json) VALUES (?, ?)').run('travel', JSON.stringify(travelPrompts));
            }
        } catch (_) {}
    }

    // Automatic migration to Trident Net Holidays & MadVerse
    try {
        const acmeBiz = db.prepare("SELECT * FROM businesses WHERE name = 'Acme Coffee' LIMIT 1").get();
        if (acmeBiz) {
            db.prepare(`UPDATE businesses 
                        SET name = 'MadVerse', category = 'travel', logo_url = '/logo.png', 
                            primary_color = '#0D9488', secondary_color = '#D97706', tone = 'helpful & friendly'
                        WHERE id = ?`).run(acmeBiz.id);
            console.log('Migrated legacy Acme Coffee business to MadVerse / Trident Net Holidays.');
        }

        const legacyLoc = db.prepare("SELECT * FROM locations WHERE name = 'Downtown Branch' OR google_review_link LIKE '%acme%' LIMIT 1").get();
        if (legacyLoc) {
            db.prepare(`UPDATE locations 
                        SET name = 'Trident Net Holidays', 
                            address = '3rd Floor, Hari Om Chamber, B/46, New Link Rd, Veera Desai Industrial Estate, Andheri West, Mumbai, Maharashtra 400053',
                            google_review_link = 'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai',
                            is_active = 1
                        WHERE id = ?`).run(legacyLoc.id);
            console.log('Migrated legacy Downtown Branch to Trident Net Holidays.');
        }

        // Ensure at least one active location exists
        const anyLoc = db.prepare("SELECT * FROM locations LIMIT 1").get();
        if (!anyLoc) {
            const biz = db.prepare("SELECT id FROM businesses LIMIT 1").get();
            const bizId = biz ? biz.id : '09bb176e-a2b0-422c-afc8-2a0c3495ecbf';
            if (!biz) {
                db.prepare(`INSERT INTO businesses (id, name, category, logo_url, primary_color, secondary_color, tone) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
                    bizId,
                    'MadVerse',
                    'travel',
                    '/logo.png',
                    '#0D9488',
                    '#D97706',
                    'helpful & friendly'
                );
            }
            db.prepare(`INSERT INTO locations (id, business_id, name, address, google_review_link, is_active, qr_code_url)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
                'ef9b1224-1b18-4137-825d-0693d8dcd72f',
                bizId,
                'Trident Net Holidays',
                '3rd Floor, Hari Om Chamber, B/46, New Link Rd, Veera Desai Industrial Estate, Andheri West, Mumbai, Maharashtra 400053',
                'https://www.google.com/maps/search/?api=1&query=Trident+Net+Holidays+Mumbai',
                1,
                'https://madverse-l7jo.onrender.com/review/ef9b1224-1b18-4137-825d-0693d8dcd72f'
            );
            console.log('Seeded Trident Net Holidays location.');
        }
    } catch (e) {
        console.error('MadVerse seed error:', e.message);
    }

    // Save to disk after init
    db.save();

    // Auto-save every 30 seconds
    setInterval(() => {
        if (db) db.save();
    }, 30000);

    initialized = true;
    console.log('Database initialized.');
    return db;
}

// Export both the async init function and a getter
module.exports = { initDB, getDB: () => db };
