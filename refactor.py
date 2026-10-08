import os
import re

routes_dir = './backend/routes'
server_file = './backend/server.js'

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Replace (req, res) => with async (req, res) => in router and app definitions
    content = re.sub(
        r'(router\.(get|post|put|delete|patch)\([^,]+,\s*(?:[a-zA-Z0-9_]+,\s*)?)\(req,\s*res\)\s*=>',
        r'\1async (req, res) =>',
        content
    )
    content = re.sub(
        r'(app\.(get|post|put|delete|patch)\([^,]+,\s*(?:[a-zA-Z0-9_]+,\s*)?)\(req,\s*res\)\s*=>',
        r'\1async (req, res) =>',
        content
    )

    # Replace getDB import with db
    content = re.sub(r'const\s*\{\s*getDB\s*\}\s*=\s*require\((.*?)\);', r'const { db } = require(\1);', content)

    # 2. Replace getDB().prepare(...).get|all|run(...)
    def repl_query(match):
        query_str = match.group(1)
        method = match.group(2)
        args = match.group(3).strip()

        count = 1
        def repl_q(m):
            nonlocal count
            res = f'${count}'
            count += 1
            return res
            
        new_query_str = re.sub(r'\?', repl_q, query_str)
        arr_args = f'[{args}]' if args else '[]'
        
        if method == 'get':
            return f"(await db.query({new_query_str}, {arr_args})).rows[0]"
        elif method == 'all':
            return f"(await db.query({new_query_str}, {arr_args})).rows"
        elif method == 'run':
            return f"await db.query({new_query_str}, {arr_args})"

    content = re.sub(r'getDB\(\)\.prepare\(\s*([\s\S]*?)\s*\)\.(get|all|run)\(([\s\S]*?)\)', repl_query, content)

    # Also handle getDB().transaction(() => { ... })();
    content = content.replace("getDB().transaction(() => {", "await db.query('BEGIN');\n        try {")
    content = content.replace("})();", "await db.query('COMMIT');\n        } catch (e) { await db.query('ROLLBACK'); throw e; }")

    with open(filepath, 'w') as f:
        f.write(content)

for filename in os.listdir(routes_dir):
    if filename.endswith('.js'):
        process_file(os.path.join(routes_dir, filename))

process_file(server_file)
