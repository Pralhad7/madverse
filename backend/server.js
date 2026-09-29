require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { initDB } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(express.json());

// Start server after DB is ready
async function start() {
    await initDB();

    // Health check endpoint for cloud load balancers & monitoring
    app.get('/health', (req, res) => res.json({ status: 'ok', app: 'MadVerse', timestamp: new Date().toISOString() }));
    app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'MadVerse', timestamp: new Date().toISOString() }));

    // Routes (loaded after DB init)
    app.use('/api/businesses', require('./routes/businesses'));
    app.use('/api/locations', require('./routes/locations'));
    app.use('/api/qr', require('./routes/qr'));
    app.use('/api/drafts', require('./routes/drafts'));
    app.use('/api/analytics', require('./routes/analytics'));

    // Serve static frontend in production
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../frontend/dist')));
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
        });
    }

    // Error handler
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Something broke!' });
    });

    app.listen(PORT, () => {
        console.log(`MadVerse backend running on http://localhost:${PORT}`);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
