const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const secret = process.env.JWT_SECRET || 'madverse-default-production-secret-key-change-me';
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // Contains business_id, user_id, role
        next();
    } catch (e) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = auth;
