const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.join(__dirname, 'data', 'biolink.db');
const db = new DatabaseSync(dbPath);

const updates = {
  username: 'alpay',
  display_name: 'Alpay',
  bio: '',
  location: 'turkiga',
  badges: JSON.stringify(['diamond']),
  typewriter_phrases: JSON.stringify(['server.alpay.fun/', 'alpay.fun']),
  bg_blur: '0',
  bg_overlay_opacity: '0.2',
  particles_effect: 'none',
  cursor_trail: '0',
  accent_color: '#a855f7',
  card_blur: '0',
  card_opacity: '0',
  click_to_enter_text: '[ TIKLA VE GİRİŞ YAP ]'
};

const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries(updates)) {
  stmt.run(k, v);
}

// Reseed clean links matching the screenshot
db.prepare('DELETE FROM links').run();
const initialLinks = [
  { title: 'Instagram', url: 'https://instagram.com', is_social: 1, icon_type: 'preset', icon_value: 'instagram', sort_order: 1, glow_color: '#ffffff' },
  { title: 'GitHub', url: 'https://github.com', is_social: 1, icon_type: 'preset', icon_value: 'github', sort_order: 2, glow_color: '#ffffff' },
  { title: 'TikTok', url: 'https://tiktok.com', is_social: 1, icon_type: 'preset', icon_value: 'tiktok', sort_order: 3, glow_color: '#ffffff' },
  { title: 'Spotify', url: 'https://spotify.com', is_social: 1, icon_type: 'preset', icon_value: 'spotify', sort_order: 4, glow_color: '#ffffff' },
  { title: 'SoundCloud', url: 'https://soundcloud.com', is_social: 1, icon_type: 'preset', icon_value: 'soundcloud', sort_order: 5, glow_color: '#ffffff' },
  { title: 'Badge', url: '#', is_social: 1, icon_type: 'preset', icon_value: 'shield', sort_order: 6, glow_color: '#38bdf8' },
  { title: 'YouTube', url: 'https://youtube.com', is_social: 1, icon_type: 'preset', icon_value: 'youtube', sort_order: 7, glow_color: '#ffffff' },
  { title: 'X (Twitter)', url: 'https://x.com', is_social: 1, icon_type: 'preset', icon_value: 'twitter', sort_order: 8, glow_color: '#ffffff' },
  { title: 'Twitch', url: 'https://twitch.tv', is_social: 1, icon_type: 'preset', icon_value: 'twitch', sort_order: 9, glow_color: '#ffffff' },
  { title: 'Steam', url: 'https://steamcommunity.com', is_social: 1, icon_type: 'preset', icon_value: 'steam', sort_order: 10, glow_color: '#ffffff' },
  { title: 'Mail', url: 'mailto:contact@alpay.fun', is_social: 1, icon_type: 'preset', icon_value: 'envelope', sort_order: 11, glow_color: '#ffffff' }
];

const insertLinkStmt = db.prepare(`
  INSERT INTO links (title, url, subtitle, is_social, icon_type, icon_value, sort_order, glow_color)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const l of initialLinks) {
  insertLinkStmt.run(l.title, l.url, l.subtitle || '', l.is_social, l.icon_type, l.icon_value, l.sort_order, l.glow_color);
}

console.log('✅ SQLite Database updated with exact screenshot settings and links');
