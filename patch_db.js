const fs = require('fs');
let code = fs.readFileSync('src/lib/db.ts', 'utf8');

code = code.replace(/import\s+\{\s*DatabaseSync\s*\}\s+from\s+'node:sqlite'/, '');
code = code.replace(/import\s+fs\s+from\s+'node:fs'/, '');
code = code.replace(/import\s+path\s+from\s+'node:path'/, '');
code = code.replace(/import\s+crypto\s+from\s+'node:crypto'/, '');

code = code.replace(/const db = new DatabaseSync\(dbPath\)/, `
  // Dynamic imports to prevent Cloudflare Pages bundling errors
  const { DatabaseSync } = require('node:sqlite');
  const fs = require('node:fs');
  const path = require('node:path');
  const crypto = require('node:crypto');
  
  const db = new DatabaseSync(dbPath)`);

// Wait, let's just make it a big replace for initDatabase
