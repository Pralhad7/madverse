import os
import re

for filename in os.listdir('backend/routes'):
    if filename.endswith('.js'):
        path = os.path.join('backend/routes', filename)
        with open(path, 'r') as f:
            content = f.read()

        # Fix getDB().prepare -> await db.query
        content = content.replace("getDB().prepare('SELECT id FROM locations WHERE id = $4 AND business_id = $5', [req.params.locationId, req.user.business_id])).rows[0];", "(await db.query('SELECT id FROM locations WHERE id = $1 AND business_id = $2', [req.params.locationId, req.user.business_id])).rows[0];")
        
        content = content.replace("getDB().prepare('INSERT INTO analytics_events (location_id, event_type, language) VALUES (?, ?, ?)')", "await db.query('INSERT INTO analytics_events (location_id, event_type, language) VALUES ($1, $2, $3)', ")
        
        content = content.replace("const feedbacks = getDB().prepare(`", "const feedbacks = (await db.query(`")
        content = content.replace(".all(req.user.business_id);", ", [req.user.business_id])).rows;")
        
        content = content.replace("const invites = getDB().prepare(`", "const invites = (await db.query(`")

        with open(path, 'w') as f:
            f.write(content)
