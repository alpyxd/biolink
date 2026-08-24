const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// --- SQLite Database Setup ---
const dbPath = path.join(DATA_DIR, 'biolink.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance
db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    session_token TEXT,
    token_expiry INTEGER
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    icon_type TEXT DEFAULT 'preset', -- 'preset', 'custom_image', 'none'
    icon_value TEXT DEFAULT 'globe',
    is_social INTEGER DEFAULT 0,    -- 1 = social icon bar, 0 = custom card link
    sort_order INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    glow_color TEXT DEFAULT '#8b5cf6',
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,       -- 'page_view', 'link_click'
    target_id INTEGER DEFAULT 0,    -- link id if link_click
    ip_hash TEXT NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    created_at INTEGER DEFAULT (unixepoch())
  );
`);

// Password hashing helpers
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return check === hash;
}

// Seed initial Admin & Settings if empty
const adminExists = db.prepare('SELECT id FROM admin WHERE username = ?').get('admin');
if (!adminExists) {
  const { hash, salt } = hashPassword('admin123');
  db.prepare('INSERT INTO admin (id, username, password_hash, salt) VALUES (1, ?, ?, ?)').run('admin', hash, salt);
  console.log('✅ Default Admin account created (User: admin / Pass: admin123)');
}

const defaultSettings = {
  // Profile
  username: 'alpay',
  display_name: 'Alpay',
  bio: '',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  avatar_glow: '#8b5cf6',
  badges: JSON.stringify(['diamond']),
  location: 'turkiga',

  // Background
  bg_type: 'video', // 'video', 'gif', 'image', 'color'
  bg_url: 'https://assets.mixkit.co/videos/preview/mixkit-cyber-city-street-traffic-at-night-41584-large.mp4',
  bg_blur: '0',
  bg_overlay_opacity: '0.3',

  // Audio / Music
  audio_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  audio_title: 'Midnight Resonance',
  audio_artist: 'Audio',
  audio_autoplay: '1',
  show_audio_player: '1',

  // Typewriter
  typewriter_phrases: JSON.stringify([
    'server.alpay.fun/',
    'alpay.fun',
    'developer & friend'
  ]),
  typewriter_speed: '85',
  typewriter_delete_speed: '45',
  typewriter_delay: '2000',
  typewriter_loop: '1',

  // Theme & Effects
  accent_color: '#a855f7',
  card_blur: '12',
  card_opacity: '0.45',
  particles_effect: 'none', // 'snow', 'stars', 'fireflies', 'rain', 'none'
  cursor_trail: '0',
  show_view_counter: '1',
  click_to_enter_text: '[ TIKLA VE GİRİŞ YAP ]',
  enter_overlay_enabled: '1'
};

const insertSettingStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [key, val] of Object.entries(defaultSettings)) {
  insertSettingStmt.run(key, typeof val === 'string' ? val : String(val));
}

// Seed default links if table is empty
const linksCount = db.prepare('SELECT COUNT(*) as count FROM links').get().count;
if (linksCount === 0) {
  const initialLinks = [
    { title: 'Instagram', url: 'https://instagram.com', is_social: 1, icon_type: 'preset', icon_value: 'instagram', sort_order: 1, glow_color: '#E1306C' },
    { title: 'GitHub', url: 'https://github.com', is_social: 1, icon_type: 'preset', icon_value: 'github', sort_order: 2, glow_color: '#ffffff' },
    { title: 'TikTok', url: 'https://tiktok.com', is_social: 1, icon_type: 'preset', icon_value: 'tiktok', sort_order: 3, glow_color: '#ff0050' },
    { title: 'Spotify', url: 'https://spotify.com', is_social: 1, icon_type: 'preset', icon_value: 'spotify', sort_order: 4, glow_color: '#1DB954' },
    { title: 'SoundCloud', url: 'https://soundcloud.com', is_social: 1, icon_type: 'preset', icon_value: 'soundcloud', sort_order: 5, glow_color: '#ff5500' },
    { title: 'Discord', url: 'https://discord.gg', is_social: 1, icon_type: 'preset', icon_value: 'discord', sort_order: 6, glow_color: '#5865F2' },
    { title: 'YouTube', url: 'https://youtube.com', is_social: 1, icon_type: 'preset', icon_value: 'youtube', sort_order: 7, glow_color: '#FF0000' },
    { title: 'X (Twitter)', url: 'https://x.com', is_social: 1, icon_type: 'preset', icon_value: 'twitter', sort_order: 8, glow_color: '#ffffff' },
    { title: 'Twitch', url: 'https://twitch.tv', is_social: 1, icon_type: 'preset', icon_value: 'twitch', sort_order: 9, glow_color: '#9146FF' },
    { title: 'Steam', url: 'https://steamcommunity.com', is_social: 1, icon_type: 'preset', icon_value: 'steam', sort_order: 10, glow_color: '#171a21' },
    { title: 'Mail', url: 'mailto:contact@alpay.fun', is_social: 1, icon_type: 'preset', icon_value: 'envelope', sort_order: 11, glow_color: '#38bdf8' }
  ];

  const insertLinkStmt = db.prepare(`
    INSERT INTO links (title, url, subtitle, is_social, icon_type, icon_value, sort_order, glow_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const l of initialLinks) {
    insertLinkStmt.run(l.title, l.url, l.subtitle || '', l.is_social, l.icon_type, l.icon_value, l.sort_order, l.glow_color);
  }
  console.log('✅ Default biolink social icons seeded');
}

// Helpers
function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const obj = {};
  for (const r of rows) {
    try {
      obj[r.key] = JSON.parse(r.value);
    } catch {
      obj[r.key] = r.value;
    }
  }
  return obj;
}

function updateSettings(settingsObj) {
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(settingsObj)) {
    const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
    stmt.run(k, valStr);
  }
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;
  rc.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
}

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + 'salt_biolink_2026').digest('hex').substring(0, 16);
}

function verifyAuth(req) {
  const cookies = parseCookies(req);
  const token = cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return false;

  const admin = db.prepare('SELECT id, username, token_expiry FROM admin WHERE session_token = ?').get(token);
  if (!admin) return false;

  if (admin.token_expiry && admin.token_expiry < Date.now()) {
    return false;
  }
  return admin;
}

// Zero-dependency Multipart Parser for file uploads
function parseMultipart(buffer, boundary) {
  const boundaryBuffer = Buffer.from('--' + boundary);
  const parts = [];
  let start = buffer.indexOf(boundaryBuffer);

  while (start !== -1) {
    const nextStart = buffer.indexOf(boundaryBuffer, start + boundaryBuffer.length);
    if (nextStart === -1) break;

    const partBuffer = buffer.subarray(start + boundaryBuffer.length, nextStart);
    const headerEnd = partBuffer.indexOf('\r\n\r\n');
    if (headerEnd !== -1) {
      const headerString = partBuffer.subarray(0, headerEnd).toString('utf8');
      const bodyBuffer = partBuffer.subarray(headerEnd + 4, partBuffer.length - 2); // strip trailing \r\n

      const nameMatch = headerString.match(/name="([^"]+)"/);
      const filenameMatch = headerString.match(/filename="([^"]+)"/);
      const contentTypeMatch = headerString.match(/Content-Type:\s*([^\r\n]+)/i);

      if (nameMatch) {
        parts.push({
          name: nameMatch[1],
          filename: filenameMatch ? filenameMatch[1] : null,
          contentType: contentTypeMatch ? contentTypeMatch[1] : null,
          data: bodyBuffer
        });
      }
    }
    start = nextStart;
  }
  return parts;
}

// Request Body Reader
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Static file server with range request support for video/audio streaming
function serveStatic(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const total = stats.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType
      });

      const fileStream = fs.createReadStream(filePath, { start, end });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': total,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
}

// JSON responder
function sendJSON(res, data, statusCode = 200, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    ...headers
  });
  res.end(JSON.stringify(data));
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method;

  // CORS headers
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  try {
    // ==========================================
    // 🌐 PUBLIC API ENDPOINTS
    // ==========================================

    // GET /api/profile -> Returns full biolink payload & records visit
    if (pathname === '/api/profile' && method === 'GET') {
      const settings = getSettings();
      const links = db.prepare(`
        SELECT id, title, url, subtitle, icon_type, icon_value, is_social, sort_order, clicks, glow_color
        FROM links
        WHERE is_active = 1
        ORDER BY sort_order ASC, id ASC
      `).all();

      // Record visitor view (deduplicated by 30-minute window per IP)
      const ip = getClientIp(req);
      const ipHash = hashIp(ip);
      const userAgent = req.headers['user-agent'] || '';
      const referrer = req.headers['referer'] || '';
      const thirtyMinsAgo = Math.floor(Date.now() / 1000) - (30 * 60);

      const recentVisit = db.prepare(`
        SELECT id FROM analytics
        WHERE ip_hash = ? AND event_type = 'page_view' AND created_at > ?
      `).get(ipHash, thirtyMinsAgo);

      if (!recentVisit) {
        db.prepare(`
          INSERT INTO analytics (event_type, ip_hash, user_agent, referrer, created_at)
          VALUES ('page_view', ?, ?, ?, unixepoch())
        `).run(ipHash, userAgent, referrer);
      }

      const totalViews = db.prepare(`SELECT COUNT(*) as count FROM analytics WHERE event_type = 'page_view'`).get().count;
      const uniqueViews = db.prepare(`SELECT COUNT(DISTINCT ip_hash) as count FROM analytics WHERE event_type = 'page_view'`).get().count;

      return sendJSON(res, {
        settings,
        links,
        analytics: {
          total_views: totalViews,
          unique_views: uniqueViews
        }
      });
    }

    // POST /api/analytics/click -> Records link click
    if (pathname === '/api/analytics/click' && method === 'POST') {
      const bodyRaw = await readBody(req);
      let payload = {};
      try { payload = JSON.parse(bodyRaw.toString()); } catch {}

      const linkId = parseInt(payload.link_id, 10);
      if (linkId) {
        db.prepare('UPDATE links SET clicks = clicks + 1 WHERE id = ?').run(linkId);
        const ipHash = hashIp(getClientIp(req));
        db.prepare(`
          INSERT INTO analytics (event_type, target_id, ip_hash, user_agent, referrer, created_at)
          VALUES ('link_click', ?, ?, ?, ?, unixepoch())
        `).run(linkId, ipHash, req.headers['user-agent'] || '', req.headers['referer'] || '');
      }
      return sendJSON(res, { success: true });
    }

    // POST /api/auth/login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const bodyRaw = await readBody(req);
      let payload = {};
      try { payload = JSON.parse(bodyRaw.toString()); } catch {}

      const { username, password } = payload;
      const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username);

      if (!admin || !verifyPassword(password, admin.password_hash, admin.salt)) {
        return sendJSON(res, { error: 'Geçersiz kullanıcı adı veya şifre!' }, 401);
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

      db.prepare('UPDATE admin SET session_token = ?, token_expiry = ? WHERE id = ?').run(token, expiry, admin.id);

      return sendJSON(res, {
        success: true,
        token,
        username: admin.username
      }, 200, {
        'Set-Cookie': `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`
      });
    }

    // POST /api/auth/logout
    if (pathname === '/api/auth/logout' && method === 'POST') {
      const cookies = parseCookies(req);
      const token = cookies.auth_token;
      if (token) {
        db.prepare('UPDATE admin SET session_token = NULL, token_expiry = NULL WHERE session_token = ?').run(token);
      }
      return sendJSON(res, { success: true }, 200, {
        'Set-Cookie': 'auth_token=; Path=/; HttpOnly; Max-Age=0'
      });
    }

    // ==========================================
    // 🛡️ PROTECTED ADMIN API ENDPOINTS
    // ==========================================
    if (pathname.startsWith('/api/admin/')) {
      const auth = verifyAuth(req);
      if (!auth) {
        return sendJSON(res, { error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, 401);
      }

      // GET /api/admin/me
      if (pathname === '/api/admin/me' && method === 'GET') {
        return sendJSON(res, { authenticated: true, username: auth.username });
      }

      // POST /api/admin/password
      if (pathname === '/api/admin/password' && method === 'POST') {
        const bodyRaw = await readBody(req);
        let payload = {};
        try { payload = JSON.parse(bodyRaw.toString()); } catch {}

        const { current_password, new_password } = payload;
        const admin = db.prepare('SELECT * FROM admin WHERE id = ?').get(auth.id);

        if (!verifyPassword(current_password, admin.password_hash, admin.salt)) {
          return sendJSON(res, { error: 'Mevcut şifreniz hatalı!' }, 400);
        }

        if (!new_password || new_password.length < 6) {
          return sendJSON(res, { error: 'Yeni şifre en az 6 karakter olmalıdır!' }, 400);
        }

        const { hash, salt } = hashPassword(new_password);
        db.prepare('UPDATE admin SET password_hash = ?, salt = ? WHERE id = ?').run(hash, salt, auth.id);

        return sendJSON(res, { success: true, message: 'Şifreniz başarıyla güncellendi.' });
      }

      // GET /api/admin/settings
      if (pathname === '/api/admin/settings' && method === 'GET') {
        return sendJSON(res, getSettings());
      }

      // PUT /api/admin/settings
      if (pathname === '/api/admin/settings' && method === 'PUT') {
        const bodyRaw = await readBody(req);
        let payload = {};
        try { payload = JSON.parse(bodyRaw.toString()); } catch {}

        updateSettings(payload);
        return sendJSON(res, { success: true, settings: getSettings() });
      }

      // GET /api/admin/links
      if (pathname === '/api/admin/links' && method === 'GET') {
        const links = db.prepare('SELECT * FROM links ORDER BY sort_order ASC, id ASC').all();
        return sendJSON(res, links);
      }

      // POST /api/admin/links -> Create link
      if (pathname === '/api/admin/links' && method === 'POST') {
        const bodyRaw = await readBody(req);
        let payload = {};
        try { payload = JSON.parse(bodyRaw.toString()); } catch {}

        const { title, url, subtitle, icon_type, icon_value, is_social, glow_color } = payload;
        if (!title || !url) {
          return sendJSON(res, { error: 'Başlık ve URL zorunludur!' }, 400);
        }

        const maxOrder = db.prepare('SELECT MAX(sort_order) as max_order FROM links').get().max_order || 0;
        const result = db.prepare(`
          INSERT INTO links (title, url, subtitle, icon_type, icon_value, is_social, sort_order, glow_color, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `).run(
          title,
          url,
          subtitle || '',
          icon_type || 'preset',
          icon_value || 'globe',
          is_social ? 1 : 0,
          maxOrder + 1,
          glow_color || '#8b5cf6'
        );

        const newLink = db.prepare('SELECT * FROM links WHERE id = ?').get(result.lastInsertRowid);
        return sendJSON(res, { success: true, link: newLink });
      }

      // PUT /api/admin/links/:id -> Update link
      const linkMatch = pathname.match(/^\/api\/admin\/links\/(\d+)$/);
      if (linkMatch && method === 'PUT') {
        const linkId = parseInt(linkMatch[1], 10);
        const bodyRaw = await readBody(req);
        let payload = {};
        try { payload = JSON.parse(bodyRaw.toString()); } catch {}

        const { title, url, subtitle, icon_type, icon_value, is_social, is_active, glow_color } = payload;
        db.prepare(`
          UPDATE links
          SET title = ?, url = ?, subtitle = ?, icon_type = ?, icon_value = ?, is_social = ?, is_active = ?, glow_color = ?
          WHERE id = ?
        `).run(
          title,
          url,
          subtitle || '',
          icon_type || 'preset',
          icon_value || 'globe',
          is_social ? 1 : 0,
          is_active !== undefined ? (is_active ? 1 : 0) : 1,
          glow_color || '#8b5cf6',
          linkId
        );

        const updated = db.prepare('SELECT * FROM links WHERE id = ?').get(linkId);
        return sendJSON(res, { success: true, link: updated });
      }

      // DELETE /api/admin/links/:id -> Delete link
      if (linkMatch && method === 'DELETE') {
        const linkId = parseInt(linkMatch[1], 10);
        db.prepare('DELETE FROM links WHERE id = ?').run(linkId);
        return sendJSON(res, { success: true });
      }

      // POST /api/admin/links/reorder -> Reorder links
      if (pathname === '/api/admin/links/reorder' && method === 'POST') {
        const bodyRaw = await readBody(req);
        let payload = {};
        try { payload = JSON.parse(bodyRaw.toString()); } catch {}

        const { ordered_ids } = payload;
        if (Array.isArray(ordered_ids)) {
          const updateOrderStmt = db.prepare('UPDATE links SET sort_order = ? WHERE id = ?');
          ordered_ids.forEach((id, index) => {
            updateOrderStmt.run(index + 1, parseInt(id, 10));
          });
        }
        return sendJSON(res, { success: true });
      }

      // POST /api/admin/upload -> File uploader
      if (pathname === '/api/admin/upload' && method === 'POST') {
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        if (!boundaryMatch) {
          return sendJSON(res, { error: 'Geçersiz form verisi (boundary bulunamadı).' }, 400);
        }

        const boundary = boundaryMatch[1] || boundaryMatch[2];
        const bodyBuffer = await readBody(req);
        const parts = parseMultipart(bodyBuffer, boundary);

        const filePart = parts.find(p => p.filename && p.data && p.data.length > 0);
        if (!filePart) {
          return sendJSON(res, { error: 'Yüklenecek dosya bulunamadı!' }, 400);
        }

        // Clean & sanitize file name
        const rawExt = path.extname(filePart.filename).toLowerCase();
        const safeExt = ['.mp4', '.webm', '.gif', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.mp3', '.wav', '.ogg'].includes(rawExt)
          ? rawExt
          : '.bin';

        const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`;
        const filePath = path.join(UPLOADS_DIR, fileName);

        fs.writeFileSync(filePath, filePart.data);

        return sendJSON(res, {
          success: true,
          url: `/uploads/${fileName}`,
          original_name: filePart.filename,
          size: filePart.data.length
        });
      }

      // GET /api/admin/analytics -> Analytics overview & timeline
      if (pathname === '/api/admin/analytics' && method === 'GET') {
        const totalViews = db.prepare(`SELECT COUNT(*) as count FROM analytics WHERE event_type = 'page_view'`).get().count;
        const uniqueVisitors = db.prepare(`SELECT COUNT(DISTINCT ip_hash) as count FROM analytics WHERE event_type = 'page_view'`).get().count;
        const totalClicks = db.prepare(`SELECT COUNT(*) as count FROM analytics WHERE event_type = 'link_click'`).get().count;

        // Daily visits for the last 7 days
        const dailyStats = db.prepare(`
          SELECT strftime('%Y-%m-%d', datetime(created_at, 'unixepoch')) as day,
                 COUNT(*) as views,
                 COUNT(DISTINCT ip_hash) as unique_views
          FROM analytics
          WHERE event_type = 'page_view' AND created_at > unixepoch() - (7 * 86400)
          GROUP BY day
          ORDER BY day ASC
        `).all();

        // Top clicked links
        const topLinks = db.prepare(`
          SELECT id, title, url, is_social, icon_value, clicks
          FROM links
          ORDER BY clicks DESC
          LIMIT 10
        `).all();

        // Recent activity
        const recentEvents = db.prepare(`
          SELECT event_type, target_id, created_at, referrer, user_agent
          FROM analytics
          ORDER BY created_at DESC
          LIMIT 20
        `).all();

        return sendJSON(res, {
          total_views: totalViews,
          unique_visitors: uniqueVisitors,
          total_clicks: totalClicks,
          daily_stats: dailyStats,
          top_links: topLinks,
          recent_events: recentEvents
        });
      }

      // POST /api/admin/analytics/reset
      if (pathname === '/api/admin/analytics/reset' && method === 'POST') {
        db.prepare('DELETE FROM analytics').run();
        db.prepare('UPDATE links SET clicks = 0').run();
        return sendJSON(res, { success: true, message: 'İstatistikler başarıyla sıfırlandı.' });
      }

      // GET /api/admin/export -> Full backup JSON
      if (pathname === '/api/admin/export' && method === 'GET') {
        const backup = {
          version: '1.0.0',
          exported_at: new Date().toISOString(),
          settings: getSettings(),
          links: db.prepare('SELECT * FROM links').all()
        };
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="guns_biolink_backup.json"'
        });
        return res.end(JSON.stringify(backup, null, 2));
      }

      // POST /api/admin/import -> Full backup restore
      if (pathname === '/api/admin/import' && method === 'POST') {
        const bodyRaw = await readBody(req);
        let payload = {};
        try { payload = JSON.parse(bodyRaw.toString()); } catch {
          return sendJSON(res, { error: 'Geçersiz JSON dosyası!' }, 400);
        }

        if (payload.settings) {
          updateSettings(payload.settings);
        }

        if (Array.isArray(payload.links)) {
          db.prepare('DELETE FROM links').run();
          const insertStmt = db.prepare(`
            INSERT INTO links (id, title, url, subtitle, icon_type, icon_value, is_social, sort_order, clicks, is_active, glow_color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const l of payload.links) {
            insertStmt.run(l.id, l.title, l.url, l.subtitle || '', l.icon_type || 'preset', l.icon_value || 'globe', l.is_social ? 1 : 0, l.sort_order || 0, l.clicks || 0, l.is_active !== undefined ? l.is_active : 1, l.glow_color || '#8b5cf6');
          }
        }

        return sendJSON(res, { success: true, message: 'Yedek başarıyla yüklendi.' });
      }
    }

    // ==========================================
    // 📁 STATIC FILES SERVING
    // ==========================================

    // Uploaded files: /uploads/*
    if (pathname.startsWith('/uploads/')) {
      const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
      const filePath = path.join(ROOT_DIR, safePath);
      return serveStatic(req, res, filePath);
    }

    // Public frontend assets
    let requestedFile = pathname === '/' ? 'index.html' : pathname;
    if (requestedFile === '/admin' || requestedFile === '/admin/') {
      requestedFile = 'admin.html';
    }

    const safePublicPath = path.normalize(requestedFile).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(PUBLIC_DIR, safePublicPath);

    if (!fs.existsSync(filePath)) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    return serveStatic(req, res, filePath);

  } catch (err) {
    console.error('Server error:', err);
    return sendJSON(res, { error: 'Internal Server Error', details: err.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 GUNS.LOL BIOLINK SERVER RUNNING`);
  console.log(`🌐 Public Biolink : http://localhost:${PORT}/`);
  console.log(`⚙️  Admin Paneli   : http://localhost:${PORT}/admin`);
  console.log(`🔑 Varsayılan Giriş: admin / admin123`);
  console.log(`======================================================\n`);
});
