require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { initDB } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable trust proxy for cloud deployment (Render, Railway, Cloud Run, Nginx, Ngrok)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({ 
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(cors());
app.use(express.json({ limit: '50kb' })); // Mitigate Large JSON payload DoS

// Global rate limiting for API routes (300 requests per 15 minutes per IP)
const rateLimit = require('express-rate-limit');
const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', globalApiLimiter);

// Start server after DB is ready
async function start() {
    await initDB();

    // Warn if running with default JWT secret in production
    if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change-me'))) {
        console.warn('⚠️ SECURITY WARNING: JWT_SECRET is unset or using a default placeholder! Set a secure random string in production.');
    }

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

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`MadVerse backend running on 0.0.0.0:${PORT}`);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
