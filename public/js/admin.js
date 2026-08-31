// Guns Biolink Admin Dashboard Controller
document.addEventListener('DOMContentLoaded', () => {
  let currentSettings = {};
  let currentLinks = [];
  let viewsChart = null;
  let selectedIconType = 'preset';
  let selectedPresetIcon = 'discord';

  // Comprehensive Icon Mapping Dictionary
  const ICON_MAP = {
    snapchat: 'fa-brands fa-snapchat',
    youtube: 'fa-brands fa-youtube',
    discord: 'fa-brands fa-discord',
    spotify: 'fa-brands fa-spotify',
    instagram: 'fa-brands fa-instagram',
    twitter: 'fa-brands fa-x-twitter',
    tiktok: 'fa-brands fa-tiktok',
    telegram: 'fa-brands fa-telegram',
    soundcloud: 'fa-brands fa-soundcloud',
    paypal: 'fa-brands fa-paypal',
    github: 'fa-brands fa-github',
    roblox: 'fa-solid fa-cube',
    cashapp: 'fa-solid fa-dollar-sign',
    venmo: 'fa-solid fa-v',
    playstation: 'fa-brands fa-playstation',
    xbox: 'fa-brands fa-xbox',
    applemusic: 'fa-brands fa-apple',

    gitlab: 'fa-brands fa-gitlab',
    twitch: 'fa-brands fa-twitch',
    reddit: 'fa-brands fa-reddit-alien',
    vk: 'fa-brands fa-vk',
    ngl: 'fa-solid fa-mask',
    bluesky: 'fa-solid fa-cloud',
    linkedin: 'fa-brands fa-linkedin-in',
    steam: 'fa-brands fa-steam',
    kick: 'fa-solid fa-bolt',
    pinterest: 'fa-brands fa-pinterest-p',
    coffee: 'fa-solid fa-mug-hot',

    facebook: 'fa-brands fa-facebook-f',
    threads: 'fa-brands fa-threads',
    patreon: 'fa-brands fa-patreon',
    signal: 'fa-solid fa-comment-dots',
    bitcoin: 'fa-brands fa-bitcoin',
    ethereum: 'fa-brands fa-ethereum',
    litecoin: 'fa-solid fa-litecoin-sign',
    solana: 'fa-solid fa-cubes',
    monero: 'fa-brands fa-monero',
    envelope: 'fa-solid fa-envelope',
    shield: 'fa-solid fa-shield-halved',
    globe: 'fa-solid fa-globe',
    gamepad: 'fa-solid fa-gamepad',
    code: 'fa-solid fa-code',
    music: 'fa-solid fa-music',
    heart: 'fa-solid fa-heart'
  };

  // Brand / Official Logo Colors Dictionary
  const BRAND_COLOR_MAP = {
    snapchat: '#FFFC00',
    youtube: '#FF0000',
    discord: '#5865F2',
    spotify: '#1DB954',
    instagram: '#E1306C',
    twitter: '#ffffff',
    tiktok: '#ff0050',
    telegram: '#229ED9',
    soundcloud: '#FF5500',
    paypal: '#0079C1',
    github: '#ffffff',
    roblox: '#ffffff',
    cashapp: '#00D632',
    venmo: '#008CFF',
    playstation: '#003791',
    xbox: '#107C10',
    applemusic: '#FA243C',
    gitlab: '#FC6D26',
    twitch: '#9146FF',
    reddit: '#FF4500',
    vk: '#0077FF',
    ngl: '#ff5555',
    bluesky: '#0285FF',
    linkedin: '#0A66C2',
    steam: '#ffffff',
    kick: '#53FC18',
    pinterest: '#E60023',
    coffee: '#FFDD00',
    facebook: '#1877F2',
    threads: '#ffffff',
    patreon: '#FF424D',
    signal: '#3A76F0',
    bitcoin: '#F7931A',
    ethereum: '#627EEA',
    litecoin: '#345D9D',
    solana: '#14F195',
    monero: '#FF6600',
    envelope: '#ffffff',
    shield: '#38bdf8',
    globe: '#ffffff',
    gamepad: '#a855f7',
    code: '#22c55e',
    music: '#ec4899',
    heart: '#ef4444'
  };

  // --- Auth Check ---
  checkAuth();

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin/me');
      if (res.ok) {
        showDashboard();
      } else {
        showLogin();
      }
    } catch {
      showLogin();
    }
  }

  function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-app').style.display = 'none';
  }

  function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-app').style.display = 'flex';
    loadAllData();
  }

  // --- Password Reveal Toggle ---
  const togglePassBtn = document.getElementById('toggle-pass-btn');
  const passInput = document.getElementById('login-password');
  const passIcon = document.getElementById('toggle-pass-icon');
  if (togglePassBtn && passInput && passIcon) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      passIcon.className = isPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
  }

  // --- Login Form Submission ---
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');
    const submitBtn = document.getElementById('login-submit-btn');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Doğrulanıyor...</span>';
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        if (errorEl) errorEl.style.display = 'none';
        showDashboard();
        showToast('Giriş başarılı! Hoş geldiniz.', 'success');
        if (password === 'admin123') {
          setTimeout(() => {
            showToast('⚠️ Güvenlik: Varsayılan şifre (admin123) aktif! Lütfen Güvenlik & Yedekleme sekmesinden şifrenizi güncelleyin.', 'error');
          }, 1200);
        }
      } else {
        const msg = data.error || 'Hatalı kullanıcı adı veya şifre!';
        if (errorText) errorText.textContent = msg;
        if (errorEl) {
          errorEl.style.display = 'flex';
          // Re-trigger shake animation
          errorEl.style.animation = 'none';
          errorEl.offsetHeight; /* trigger reflow */
          errorEl.style.animation = null;
        }
      }
    } catch (err) {
      const msg = 'Sunucuya bağlanılamadı.';
      if (errorText) errorText.textContent = msg;
      if (errorEl) errorEl.style.display = 'flex';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Yönetim Paneline Giriş Yap</span><i class="fa-solid fa-arrow-right-to-bracket"></i>';
      }
    }
  });

  // --- Logout ---
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    showLogin();
    showToast('Çıkış yapıldı.', 'success');
  });

  // --- Tab Navigation ---
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');

      if (targetId === 'tab-dashboard') {
        loadAnalytics();
      } else if (targetId === 'tab-security') {
        loadSecurityLogs();
      }
    });
  });

  // --- Toggle Live Preview ---
  const togglePreviewBtn = document.getElementById('toggle-preview-btn');
  const previewSidebar = document.getElementById('preview-sidebar');
  togglePreviewBtn.addEventListener('click', () => {
    previewSidebar.classList.toggle('hidden');
  });

  // Refresh Preview Frame
  const refreshPreviewBtn = document.getElementById('refresh-preview-btn');
  const previewIframe = document.getElementById('preview-iframe');
  function reloadPreview() {
    if (previewIframe) {
      previewIframe.src = '/?t=' + Date.now();
    }
  }
  refreshPreviewBtn.addEventListener('click', reloadPreview);

  // --- Load All Data ---
  async function loadAllData() {
    await Promise.all([loadSettings(), loadLinks(), loadAnalytics(), loadSecurityLogs()]);
    initSortable();
  }

  // --- Load Settings ---
  async function loadSettings() {
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) return;
      currentSettings = await res.json();
      populateSettingsForms(currentSettings);
    } catch (e) {
      console.error('Settings load error', e);
    }
  }

  function safeSet(id, prop, val) {
    const el = document.getElementById(id);
    if (el) el[prop] = val;
  }
  function safeText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function populateSettingsForms(s) {
    if (!s) return;

    // 1. Profile Form
    safeSet('setting-avatar-url', 'value', s.avatar_url || '');
    safeSet('avatar-preview-img', 'src', s.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400');
    safeSet('setting-favicon-url', 'value', s.favicon_url || '');
    if (s.favicon_url) {
      safeSet('favicon-preview-img', 'src', s.favicon_url);
    }
    safeSet('setting-display-name', 'value', s.display_name || '');
    safeSet('setting-username', 'value', s.username ? s.username.replace(/^@/, '') : '');
    safeSet('setting-location', 'value', s.location || '');
    safeSet('setting-avatar-glow-enabled', 'checked', String(s.avatar_glow_enabled) !== '0');
    safeSet('setting-avatar-glow', 'value', s.avatar_glow || '#8b5cf6');
    safeSet('setting-avatar-glow-text', 'value', s.avatar_glow || '#8b5cf6');
    safeSet('setting-bio', 'value', s.bio || '');

    // Badges
    let badges = [];
    try { badges = typeof s.badges === 'string' ? JSON.parse(s.badges) : (s.badges || []); } catch {}
    document.querySelectorAll('input[name="badges"]').forEach(cb => {
      cb.checked = Array.isArray(badges) && badges.includes(cb.value);
    });

    // 2. Background Form
    safeSet('setting-bg-type', 'value', s.bg_type || 'video');
    safeSet('setting-bg-url', 'value', s.bg_url || '');
    safeSet('setting-bg-blur', 'value', s.bg_blur !== undefined ? s.bg_blur : 5);
    safeText('blur-val-label', `${s.bg_blur !== undefined ? s.bg_blur : 5}px`);
    safeSet('setting-bg-overlay', 'value', s.bg_overlay_opacity !== undefined ? s.bg_overlay_opacity : 0.6);
    safeText('overlay-val-label', `%${Math.round((s.bg_overlay_opacity !== undefined ? s.bg_overlay_opacity : 0.6) * 100)}`);
    safeSet('setting-enter-text', 'value', s.click_to_enter_text || '[ TIKLA VE GİRİŞ YAP ]');
    safeSet('setting-enter-text-profile', 'value', s.click_to_enter_text || '[ TIKLA VE GİRİŞ YAP ]');
    safeSet('setting-enter-overlay-enabled', 'checked', String(s.enter_overlay_enabled) !== '0');

    // 3. Audio Form
    safeSet('setting-audio-url', 'value', s.audio_url || '');
    safeSet('setting-audio-cover-url', 'value', s.audio_cover_url || '');
    safeSet('setting-audio-title', 'value', s.audio_title || '');
    safeSet('setting-audio-artist', 'value', s.audio_artist || '');
    safeSet('setting-audio-autoplay', 'checked', String(s.audio_autoplay) === '1' || s.audio_autoplay === true);
    safeSet('setting-show-audio-player', 'checked', String(s.show_audio_player) !== '0');
    const audVol = (s.audio_volume !== undefined && s.audio_volume !== '') ? s.audio_volume : 50;
    safeSet('setting-audio-volume', 'value', audVol);
    safeText('audio-volume-val', `%${audVol}`);

    // 4. Typewriter Form
    let phrases = ['server.alpay.fun', 'alpay.fun'];
    try { phrases = typeof s.typewriter_phrases === 'string' ? JSON.parse(s.typewriter_phrases) : (s.typewriter_phrases || phrases); } catch {}
    renderPhrasesList(phrases);

    // Tab Title & Tab Typewriter
    safeSet('setting-tab-title', 'value', s.tab_title || '');
    safeSet('setting-tab-typewriter-enabled', 'checked', String(s.tab_typewriter_enabled) !== '0');
    let tabPhrases = ['alpay.fun', 'server.alpay.fun', 'cyber biolink'];
    try {
      tabPhrases = typeof s.tab_typewriter_phrases === 'string' ? JSON.parse(s.tab_typewriter_phrases) : (s.tab_typewriter_phrases || tabPhrases);
    } catch {}
    renderTabPhrasesList(tabPhrases);

    safeSet('setting-type-speed', 'value', s.typewriter_speed || 75);
    safeText('type-speed-val', `${s.typewriter_speed || 75}ms`);
    safeSet('setting-delete-speed', 'value', s.typewriter_delete_speed || 40);
    safeText('delete-speed-val', `${s.typewriter_delete_speed || 40}ms`);
    safeSet('setting-type-delay', 'value', s.typewriter_delay || 1800);
    safeText('delay-val-label', `${s.typewriter_delay || 1800}ms`);

    // 5. Theme Form
    safeSet('setting-accent-color', 'value', s.accent_color || '#8b5cf6');
    safeSet('setting-accent-color-text', 'value', s.accent_color || '#8b5cf6');
    safeSet('setting-particles-effect', 'value', s.particles_effect || 'snow');
    safeSet('setting-show-card', 'checked', String(s.show_card) !== '0');
    safeSet('setting-card-blur', 'value', s.card_blur !== undefined ? s.card_blur : 25);
    safeText('card-blur-val', `${s.card_blur !== undefined ? s.card_blur : 25}px`);
    safeSet('setting-card-opacity', 'value', s.card_opacity !== undefined ? s.card_opacity : 0.15);
    safeText('card-opacity-val', `%${Math.round((s.card_opacity !== undefined ? s.card_opacity : 0.15) * 100)}`);
    safeSet('setting-cursor-trail', 'checked', String(s.cursor_trail) === '1' || s.cursor_trail === true);
    safeSet('setting-show-view-counter', 'checked', String(s.show_view_counter) !== '0');

    // 6. Link Appearance Form
    const colorMode = s.link_color_mode || 'original';
    safeSet('setting-link-color-mode', 'value', colorMode);
    safeSet('setting-link-custom-color', 'value', s.link_custom_color || '#ffffff');
    safeSet('setting-link-custom-color-text', 'value', s.link_custom_color || '#ffffff');
    safeSet('setting-link-glow-enabled', 'checked', String(s.link_glow_enabled) !== '0');
    const customColorGrp = document.getElementById('link-custom-color-group');
    if (customColorGrp) {
      customColorGrp.style.display = (colorMode === 'custom') ? 'block' : 'none';
    }
  }

  // Link Color Mode Switch
  const linkColorModeSelect = document.getElementById('setting-link-color-mode');
  if (linkColorModeSelect) {
    linkColorModeSelect.addEventListener('change', (e) => {
      const grp = document.getElementById('link-custom-color-group');
      if (grp) grp.style.display = (e.target.value === 'custom') ? 'block' : 'none';
    });
  }

  // Sync enter text inputs
  const enterBgInp = document.getElementById('setting-enter-text');
  const enterProfInp = document.getElementById('setting-enter-text-profile');
  if (enterBgInp && enterProfInp) {
    enterBgInp.addEventListener('input', () => { enterProfInp.value = enterBgInp.value; });
    enterProfInp.addEventListener('input', () => { enterBgInp.value = enterProfInp.value; });
  }

  // --- Dynamic Color Input Sync ---
  syncColorInputs('setting-avatar-glow', 'setting-avatar-glow-text');
  syncColorInputs('setting-accent-color', 'setting-accent-color-text');
  syncColorInputs('setting-link-custom-color', 'setting-link-custom-color-text');
  syncColorInputs('modal-link-glow', 'modal-link-glow-text');

  function syncColorInputs(pickerId, textId) {
    const picker = document.getElementById(pickerId);
    const text = document.getElementById(textId);
    if (!picker || !text) return;

    picker.addEventListener('input', () => { text.value = picker.value; });
    text.addEventListener('input', () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(text.value)) {
        picker.value = text.value;
      }
    });
  }

  // --- Sliders Label Sync ---
  document.getElementById('setting-bg-blur').addEventListener('input', (e) => {
    document.getElementById('blur-val-label').textContent = `${e.target.value}px`;
  });
  document.getElementById('setting-bg-overlay').addEventListener('input', (e) => {
    document.getElementById('overlay-val-label').textContent = `%${Math.round(e.target.value * 100)}`;
  });
  document.getElementById('setting-type-speed').addEventListener('input', (e) => {
    document.getElementById('type-speed-val').textContent = `${e.target.value}ms`;
  });
  document.getElementById('setting-delete-speed').addEventListener('input', (e) => {
    document.getElementById('delete-speed-val').textContent = `${e.target.value}ms`;
  });
  document.getElementById('setting-type-delay').addEventListener('input', (e) => {
    document.getElementById('delay-val-label').textContent = `${e.target.value}ms`;
  });
  document.getElementById('setting-card-blur').addEventListener('input', (e) => {
    document.getElementById('card-blur-val').textContent = `${e.target.value}px`;
  });
  document.getElementById('setting-card-opacity').addEventListener('input', (e) => {
    document.getElementById('card-opacity-val').textContent = `%${Math.round(e.target.value * 100)}`;
  });
  const audVolInput = document.getElementById('setting-audio-volume');
  if (audVolInput) {
    audVolInput.addEventListener('input', (e) => {
      document.getElementById('audio-volume-val').textContent = `%${e.target.value}`;
    });
  }

  // --- Save Settings Helper ---
  async function saveSettingsPayload(payload) {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Ayarlar başarıyla kaydedildi!', 'success');
        reloadPreview();
        await loadSettings(); // Re-populate form with fresh server values
      } else {
        showToast('Kaydetme hatası oluştu!', 'error');
      }
    } catch {
      showToast('Sunucu hatası!', 'error');
    }
  }

  // ==========================================
  // 💾 SETTINGS FORMS SUBMISSION HANDLERS
  // ==========================================

  // 1. Profile Form Save
  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const badges = Array.from(document.querySelectorAll('input[name="badges"]:checked')).map(cb => cb.value);
    const enterVal = document.getElementById('setting-enter-text-profile')?.value || document.getElementById('setting-enter-text')?.value;

    const payload = {
      avatar_url: document.getElementById('setting-avatar-url').value,
      favicon_url: document.getElementById('setting-favicon-url') ? document.getElementById('setting-favicon-url').value : '',
      display_name: document.getElementById('setting-display-name').value,
      username: document.getElementById('setting-username').value,
      location: document.getElementById('setting-location').value,
      avatar_glow_enabled: document.getElementById('setting-avatar-glow-enabled').checked ? '1' : '0',
      avatar_glow: document.getElementById('setting-avatar-glow').value,
      bio: document.getElementById('setting-bio').value,
      click_to_enter_text: enterVal,
      badges: JSON.stringify(badges)
    };
    saveSettingsPayload(payload);
  });

  // 2. Background Form Save
  document.getElementById('background-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      bg_type: document.getElementById('setting-bg-type').value,
      bg_url: document.getElementById('setting-bg-url').value,
      bg_blur: document.getElementById('setting-bg-blur').value,
      bg_overlay_opacity: parseFloat(document.getElementById('setting-bg-overlay').value),
      click_to_enter_text: document.getElementById('setting-enter-text').value,
      enter_overlay_enabled: document.getElementById('setting-enter-overlay-enabled').checked ? '1' : '0'
    };
    saveSettingsPayload(payload);
  });

  // 3. Audio Form Save
  document.getElementById('audio-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      audio_url: document.getElementById('setting-audio-url').value,
      audio_cover_url: document.getElementById('setting-audio-cover-url').value,
      audio_title: document.getElementById('setting-audio-title').value,
      audio_artist: document.getElementById('setting-audio-artist').value,
      audio_autoplay: document.getElementById('setting-audio-autoplay').checked ? '1' : '0',
      show_audio_player: document.getElementById('setting-show-audio-player').checked ? '1' : '0',
      audio_volume: document.getElementById('setting-audio-volume') ? document.getElementById('setting-audio-volume').value : '50'
    };
    saveSettingsPayload(payload);
  });

  // 4. Typewriter Form Save
  document.getElementById('typewriter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const phraseInputs = document.querySelectorAll('.phrase-input');
    const phrases = Array.from(phraseInputs).map(inp => inp.value.trim()).filter(v => v.length > 0);

    const tabPhraseInputs = document.querySelectorAll('.tab-phrase-input');
    const tabPhrases = Array.from(tabPhraseInputs).map(inp => inp.value.trim()).filter(v => v.length > 0);

    const payload = {
      typewriter_phrases: JSON.stringify(phrases),
      typewriter_speed: document.getElementById('setting-type-speed').value,
      typewriter_delete_speed: document.getElementById('setting-delete-speed').value,
      typewriter_delay: document.getElementById('setting-type-delay').value,
      tab_title: document.getElementById('setting-tab-title') ? document.getElementById('setting-tab-title').value : '',
      tab_typewriter_enabled: document.getElementById('setting-tab-typewriter-enabled')?.checked ? '1' : '0',
      tab_typewriter_phrases: JSON.stringify(tabPhrases)
    };
    saveSettingsPayload(payload);
  });

  // 5. Theme Form Save
  document.getElementById('theme-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      accent_color: document.getElementById('setting-accent-color').value,
      particles_effect: document.getElementById('setting-particles-effect').value,
      show_card: document.getElementById('setting-show-card').checked ? '1' : '0',
      card_blur: document.getElementById('setting-card-blur').value,
      card_opacity: parseFloat(document.getElementById('setting-card-opacity').value),
      cursor_trail: document.getElementById('setting-cursor-trail').checked ? '1' : '0',
      show_view_counter: document.getElementById('setting-show-view-counter').checked ? '1' : '0'
    };
    saveSettingsPayload(payload);
  });

  // 6. Link Appearance Form Save
  const linkAppearanceForm = document.getElementById('link-appearance-form');
  if (linkAppearanceForm) {
    linkAppearanceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        link_color_mode: document.getElementById('setting-link-color-mode').value,
        link_custom_color: document.getElementById('setting-link-custom-color').value,
        link_glow_enabled: document.getElementById('setting-link-glow-enabled').checked ? '1' : '0'
      };
      saveSettingsPayload(payload);
    });
  }

  // --- Typewriter Dynamic Phrase List (Profile) ---
  const phrasesContainer = document.getElementById('phrases-list-container');
  const addPhraseBtn = document.getElementById('add-phrase-btn');

  function renderPhrasesList(phrases) {
    if (!phrasesContainer) return;
    phrasesContainer.innerHTML = '';
    (phrases || []).forEach((phrase) => {
      addPhraseRow(phrase);
    });
  }

  function addPhraseRow(val = '') {
    if (!phrasesContainer) return;
    const row = document.createElement('div');
    row.className = 'phrase-row';
    row.innerHTML = `
      <input type="text" class="form-control phrase-input" value="${escapeHtml(val)}" placeholder="Yazılacak metin...">
      <button type="button" class="btn-icon btn-remove-phrase" title="Sil"><i class="fa-solid fa-trash"></i></button>
    `;
    row.querySelector('.btn-remove-phrase').addEventListener('click', () => {
      row.remove();
    });
    phrasesContainer.appendChild(row);
  }

  if (addPhraseBtn) {
    addPhraseBtn.addEventListener('click', () => addPhraseRow(''));
  }

  // --- Typewriter Dynamic Phrase List (Browser Tab Title) ---
  const tabPhrasesContainer = document.getElementById('tab-phrases-list-container');
  const addTabPhraseBtn = document.getElementById('add-tab-phrase-btn');

  function renderTabPhrasesList(phrases) {
    if (!tabPhrasesContainer) return;
    tabPhrasesContainer.innerHTML = '';
    (phrases || []).forEach((phrase) => {
      addTabPhraseRow(phrase);
    });
  }

  function addTabPhraseRow(val = '') {
    if (!tabPhrasesContainer) return;
    const row = document.createElement('div');
    row.className = 'phrase-row';
    row.innerHTML = `
      <input type="text" class="form-control tab-phrase-input" value="${escapeHtml(val)}" placeholder="Sekmede yazılacak metin...">
      <button type="button" class="btn-icon btn-remove-phrase" title="Sil"><i class="fa-solid fa-trash"></i></button>
    `;
    row.querySelector('.btn-remove-phrase').addEventListener('click', () => {
      row.remove();
    });
    tabPhrasesContainer.appendChild(row);
  }

  if (addTabPhraseBtn) {
    addTabPhraseBtn.addEventListener('click', () => addTabPhraseRow(''));
  }

  // --- File Upload Handlers (Avatar, Favicon, Background, Audio, Custom Icon) ---
  setupFileUpload('avatar-file-input', (url) => {
    document.getElementById('setting-avatar-url').value = url;
    document.getElementById('avatar-preview-img').src = url;
    showToast('Avatar yüklendi!', 'success');
  });

  setupFileUpload('favicon-file-input', (url) => {
    document.getElementById('setting-favicon-url').value = url;
    const prev = document.getElementById('favicon-preview-img');
    if (prev) prev.src = url;
    showToast('Favicon yüklendi!', 'success');
  });

  const favUrlInp = document.getElementById('setting-favicon-url');
  if (favUrlInp) {
    favUrlInp.addEventListener('input', (e) => {
      const prev = document.getElementById('favicon-preview-img');
      if (prev && e.target.value.trim()) {
        prev.src = e.target.value.trim();
      }
    });
  }

  setupFileUpload('bg-file-input', (url) => {
    document.getElementById('setting-bg-url').value = url;
    showToast('Arka plan medyası yüklendi!', 'success');
  });

  setupFileUpload('audio-file-input', (url) => {
    document.getElementById('setting-audio-url').value = url;
    showToast('Ses dosyası yüklendi!', 'success');
  });

  setupFileUpload('audio-cover-file-input', (url) => {
    document.getElementById('setting-audio-cover-url').value = url;
    showToast('Albüm kapağı yüklendi!', 'success');
  });

  setupFileUpload('link-icon-file-input', (url) => {
    document.getElementById('modal-custom-icon-url').value = url;
    showToast('Logo/İkon yüklendi!', 'success');
  });

  function setupFileUpload(inputId, onSuccess) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        showToast('Yükleniyor...', 'info');
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (res.ok && data.url) {
          onSuccess(data.url);
        } else {
          showToast(data.error || 'Yükleme başarısız!', 'error');
        }
      } catch {
        showToast('Dosya yüklenirken hata oluştu!', 'error');
      }
    });
  }

  // --- Load Links & Render Sortable Lists ---
  async function loadLinks() {
    try {
      const res = await fetch('/api/admin/links');
      if (!res.ok) return;
      currentLinks = await res.json();
      renderAdminLinks(currentLinks);
    } catch (e) {
      console.error('Links load error', e);
    }
  }

  function renderAdminLinks(links) {
    const socialList = document.getElementById('social-links-sortable');
    const customList = document.getElementById('custom-links-sortable');
    socialList.innerHTML = '';
    customList.innerHTML = '';

    const socialLinks = links.filter(l => l.is_social === 1);
    const customLinks = links.filter(l => l.is_social === 0);

    socialLinks.forEach(link => {
      socialList.appendChild(createLinkItemElement(link));
    });

    customLinks.forEach(link => {
      customList.appendChild(createLinkItemElement(link));
    });
  }

  function createLinkItemElement(link) {
    const item = document.createElement('div');
    item.className = 'sortable-link-item';
    item.setAttribute('data-id', link.id);
    
    // Dynamic color preview based on current mode
    let itemColor = '#ffffff';
    const colorMode = currentSettings.link_color_mode || 'original';
    if (colorMode === 'original') {
      if (link.icon_type === 'preset' && BRAND_COLOR_MAP[link.icon_value]) {
        itemColor = BRAND_COLOR_MAP[link.icon_value];
      } else {
        itemColor = link.glow_color || '#ffffff';
      }
    } else {
      itemColor = currentSettings.link_custom_color || '#ffffff';
    }
    item.style.setProperty('--link-color', itemColor);

    let iconHtml = '';
    if (link.icon_type === 'custom_image' && link.icon_value) {
      iconHtml = `<img src="${link.icon_value}" alt="${link.title}">`;
    } else {
      const iconClass = ICON_MAP[link.icon_value] || 'fa-solid fa-link';
      iconHtml = `<i class="${iconClass}" style="color: ${itemColor};"></i>`;
    }

    item.innerHTML = `
      <div class="link-item-left">
        <i class="fa-solid fa-grip-vertical drag-handle"></i>
        <div class="link-item-icon">${iconHtml}</div>
        <div class="link-item-details">
          <span class="link-item-title">${escapeHtml(link.title)}</span>
          <span class="link-item-url">${escapeHtml(link.url)}</span>
        </div>
      </div>

      <div class="link-item-actions">
        <span class="link-clicks-badge" title="Tıklanma Sayısı"><i class="fa-solid fa-arrow-pointer"></i> ${link.clicks || 0}</span>
        <button type="button" class="btn-icon btn-edit-link" title="Düzenle"><i class="fa-solid fa-pen-to-square"></i></button>
        <button type="button" class="btn-icon btn-delete-link" title="Sil"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    item.querySelector('.btn-edit-link').addEventListener('click', () => openEditLinkModal(link));
    item.querySelector('.btn-delete-link').addEventListener('click', () => deleteLink(link.id));

    return item;
  }

  // --- SortableJS Initialization ---
  function initSortable() {
    const socialList = document.getElementById('social-links-sortable');
    const customList = document.getElementById('custom-links-sortable');

    new Sortable(socialList, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      onEnd: () => persistReorder()
    });

    new Sortable(customList, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      onEnd: () => persistReorder()
    });
  }

  async function persistReorder() {
    const socialIds = Array.from(document.querySelectorAll('#social-links-sortable .sortable-link-item')).map(el => el.getAttribute('data-id'));
    const customIds = Array.from(document.querySelectorAll('#custom-links-sortable .sortable-link-item')).map(el => el.getAttribute('data-id'));
    const allIds = [...socialIds, ...customIds];

    try {
      const res = await fetch('/api/admin/links/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordered_ids: allIds })
      });
      if (res.ok) {
        showToast('Link sıralaması güncellendi!', 'success');
        reloadPreview();
      }
    } catch {
      showToast('Sıralama kaydedilemedi!', 'error');
    }
  }

  // --- Link Modal (Add / Edit) ---
  const linkModal = document.getElementById('link-modal');
  const openAddLinkBtn = document.getElementById('open-add-link-modal-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelLinkBtn = document.getElementById('cancel-link-btn');
  const linkForm = document.getElementById('link-form');

  openAddLinkBtn.addEventListener('click', () => {
    openAddLinkModal();
  });

  closeModalBtn.addEventListener('click', () => { linkModal.style.display = 'none'; });
  cancelLinkBtn.addEventListener('click', () => { linkModal.style.display = 'none'; });

  function openAddLinkModal() {
    document.getElementById('modal-title').textContent = 'Yeni Link Ekle';
    document.getElementById('modal-link-id').value = '';
    document.getElementById('modal-link-type').value = '0';
    document.getElementById('modal-link-title').value = '';
    document.getElementById('modal-link-subtitle').value = '';
    document.getElementById('modal-link-url').value = '';
    document.getElementById('modal-link-glow').value = '#8b5cf6';
    document.getElementById('modal-link-glow-text').value = '#8b5cf6';
    document.getElementById('modal-custom-icon-url').value = '';

    selectedIconType = 'preset';
    selectedPresetIcon = 'discord';
    setPresetIconTabActive();
    linkModal.style.display = 'flex';
  }

  function openEditLinkModal(link) {
    document.getElementById('modal-title').textContent = 'Linki Düzenle';
    document.getElementById('modal-link-id').value = link.id;
    document.getElementById('modal-link-type').value = link.is_social ? '1' : '0';
    document.getElementById('modal-link-title').value = link.title;
    document.getElementById('modal-link-subtitle').value = link.subtitle || '';
    document.getElementById('modal-link-url').value = link.url;
    document.getElementById('modal-link-glow').value = link.glow_color || '#8b5cf6';
    document.getElementById('modal-link-glow-text').value = link.glow_color || '#8b5cf6';

    if (link.icon_type === 'custom_image') {
      selectedIconType = 'custom_image';
      document.getElementById('modal-custom-icon-url').value = link.icon_value || '';
      setCustomIconTabActive();
    } else {
      selectedIconType = 'preset';
      selectedPresetIcon = link.icon_value || 'globe';
      setPresetIconTabActive();
    }

    linkModal.style.display = 'flex';
  }

  // Icon selector tabs inside modal
  const btnPresetIcons = document.getElementById('btn-preset-icons');
  const btnCustomIcon = document.getElementById('btn-custom-icon');
  const presetGrid = document.getElementById('preset-icons-grid');
  const customBox = document.getElementById('custom-icon-box');

  btnPresetIcons.addEventListener('click', () => {
    selectedIconType = 'preset';
    setPresetIconTabActive();
  });

  btnCustomIcon.addEventListener('click', () => {
    selectedIconType = 'custom_image';
    setCustomIconTabActive();
  });

  function setPresetIconTabActive() {
    btnPresetIcons.classList.add('active');
    btnCustomIcon.classList.remove('active');
    presetGrid.style.display = 'grid';
    customBox.style.display = 'none';

    document.querySelectorAll('.icon-choice').forEach(ic => {
      ic.classList.toggle('active', ic.getAttribute('data-icon') === selectedPresetIcon);
    });
  }

  function setCustomIconTabActive() {
    btnCustomIcon.classList.add('active');
    btnPresetIcons.classList.remove('active');
    customBox.style.display = 'block';
    presetGrid.style.display = 'none';
  }

  document.querySelectorAll('.icon-choice').forEach(ic => {
    ic.addEventListener('click', () => {
      document.querySelectorAll('.icon-choice').forEach(c => c.classList.remove('active'));
      ic.classList.add('active');
      selectedPresetIcon = ic.getAttribute('data-icon');
      if (BRAND_COLOR_MAP[selectedPresetIcon]) {
        document.getElementById('modal-link-glow').value = BRAND_COLOR_MAP[selectedPresetIcon];
        document.getElementById('modal-link-glow-text').value = BRAND_COLOR_MAP[selectedPresetIcon];
      }
    });
  });

  // Link Form Submit (Create or Update)
  linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('modal-link-id').value;
    const is_social = parseInt(document.getElementById('modal-link-type').value, 10);
    const title = document.getElementById('modal-link-title').value.trim();
    const subtitle = document.getElementById('modal-link-subtitle').value.trim();
    const url = document.getElementById('modal-link-url').value.trim();
    const glow_color = document.getElementById('modal-link-glow').value;

    let icon_type = selectedIconType;
    let icon_value = selectedIconType === 'custom_image'
      ? document.getElementById('modal-custom-icon-url').value.trim()
      : selectedPresetIcon;

    if (!title || !url) {
      showToast('Başlık ve URL zorunludur!', 'error');
      return;
    }

    const payload = {
      title,
      subtitle,
      url,
      is_social,
      icon_type,
      icon_value,
      glow_color
    };

    try {
      const endpoint = id ? `/api/admin/links/${id}` : '/api/admin/links';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        linkModal.style.display = 'none';
        showToast(id ? 'Link güncellendi!' : 'Yeni link eklendi!', 'success');
        await loadLinks();
        reloadPreview();
      } else {
        const err = await res.json();
        showToast(err.error || 'Kaydetme hatası!', 'error');
      }
    } catch {
      showToast('Sunucu hatası!', 'error');
    }
  });

  async function deleteLink(id) {
    if (!confirm('Bu bağlantıyı silmek istediğinizden emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/links/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Link silindi.', 'success');
        await loadLinks();
        reloadPreview();
      }
    } catch {
      showToast('Silme işlemi başarısız!', 'error');
    }
  }

  // --- Load Analytics ---
  async function loadAnalytics() {
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) return;
      const data = await res.json();

      document.getElementById('stat-total-views').textContent = data.total_views || 0;
      document.getElementById('stat-unique-visitors').textContent = data.unique_visitors || 0;
      document.getElementById('stat-total-clicks').textContent = data.total_clicks || 0;

      // Render Top Links Table
      const tbody = document.getElementById('top-links-tbody');
      tbody.innerHTML = '';
      if (data.top_links && data.top_links.length > 0) {
        data.top_links.forEach(l => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><span class="brand-badge">${l.is_social ? 'Sosyal' : 'Özel Link'}</span></td>
            <td><strong>${escapeHtml(l.title)}</strong></td>
            <td><a href="${escapeHtml(l.url)}" target="_blank" style="color: var(--text-muted); text-decoration: none;">${escapeHtml(l.url)}</a></td>
            <td><strong style="color: var(--accent); font-family: var(--font-mono);">${l.clicks || 0} tık</strong></td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Henüz tıklama kaydı yok.</td></tr>';
      }

      // Render Views Line Chart
      renderAnalyticsChart(data.daily_stats || []);
    } catch (e) {
      console.error('Analytics load error', e);
    }
  }

  function renderAnalyticsChart(dailyStats) {
    const canvas = document.getElementById('views-chart');
    if (!canvas) return;

    const labels = dailyStats.map(s => s.day);
    const viewsData = dailyStats.map(s => s.views);
    const uniqueData = dailyStats.map(s => s.unique_views);

    if (labels.length === 0) {
      // Empty mock days for clean visual
      const today = new Date().toISOString().split('T')[0];
      labels.push(today);
      viewsData.push(0);
      uniqueData.push(0);
    }

    if (viewsChart) {
      viewsChart.destroy();
    }

    viewsChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Toplam Görüntülenme',
            data: viewsData,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#38bdf8'
          },
          {
            label: 'Tekil Ziyaretçi',
            data: uniqueData,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#8b5cf6'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'Outfit' } }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b' }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', stepSize: 1 }
          }
        }
      }
    });
  }

  // --- Password Change ---
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const current_password = document.getElementById('pass-current').value;
    const new_password = document.getElementById('pass-new').value;

    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password, new_password })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Şifre güncellendi!', 'success');
        document.getElementById('pass-current').value = '';
        document.getElementById('pass-new').value = '';
      } else {
        showToast(data.error || 'Şifre değiştirilemedi!', 'error');
      }
    } catch {
      showToast('Sunucu hatası!', 'error');
    }
  });

  // --- Backup Import ---
  document.getElementById('import-file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    try {
      const json = JSON.parse(text);
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json)
      });
      if (res.ok) {
        showToast('Yedek başarıyla geri yüklendi!', 'success');
        await loadAllData();
        reloadPreview();
      } else {
        showToast('Yedek yüklenemedi!', 'error');
      }
    } catch {
      showToast('Geçersiz JSON dosyası!', 'error');
    }
  });

  // --- Reset Analytics ---
  document.getElementById('reset-analytics-btn').addEventListener('click', async () => {
    if (!confirm('Tüm istatistikleri sıfırlamak istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/admin/analytics/reset', { method: 'POST' });
      if (res.ok) {
        showToast('İstatistikler sıfırlandı.', 'success');
        await loadAnalytics();
      }
    } catch {
      showToast('Sıfırlama başarısız!', 'error');
    }
  });

  // --- Security Audit Logs ---
  async function loadSecurityLogs() {
    try {
      const res = await fetch('/api/admin/security/logs');
      if (!res.ok) return;
      const data = await res.json();

      const failedEl = document.getElementById('sec-stat-failed');
      const successEl = document.getElementById('sec-stat-success');
      const lockedEl = document.getElementById('sec-stat-locked');
      const tbody = document.getElementById('security-logs-tbody');

      if (failedEl) failedEl.textContent = data.stats?.total_failed || 0;
      if (successEl) successEl.textContent = data.stats?.total_successful || 0;
      if (lockedEl) lockedEl.textContent = data.stats?.currently_locked || 0;

      if (!tbody) return;
      tbody.innerHTML = '';

      if (data.logs && data.logs.length > 0) {
        data.logs.forEach(log => {
          const tr = document.createElement('tr');

          // Status badge
          let badgeHtml = '';
          if (log.event_type === 'failed_login') {
            badgeHtml = '<span class="status-badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-xmark"></i> Hatalı Şifre</span>';
          } else if (log.event_type === 'rate_limited') {
            badgeHtml = '<span class="status-badge" style="background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-ban"></i> Kilitlendi (IP)</span>';
          } else if (log.event_type === 'successful_login') {
            badgeHtml = '<span class="status-badge" style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-check"></i> Başarılı Giriş</span>';
          } else {
            badgeHtml = `<span class="status-badge" style="background: rgba(148, 163, 184, 0.2); color: #94a3b8; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem;">${escapeHtml(log.event_type)}</span>`;
          }

          // Date format
          const dateStr = log.created_at ? new Date(log.created_at * 1000).toLocaleString('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
          }) : '-';

          // User Agent simplification
          const device = formatDevice(log.user_agent);

          tr.innerHTML = `
            <td>${badgeHtml}</td>
            <td style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-muted);">${escapeHtml(dateStr)}</td>
            <td><strong style="font-family: var(--font-mono); color: #38bdf8;">${escapeHtml(log.ip_address)}</strong></td>
            <td><span style="font-weight: 600; color: #f1f5f9;">${escapeHtml(log.username_attempted || '-')}</span></td>
            <td><span style="font-size: 0.8rem; color: var(--text-muted);" title="${escapeHtml(log.user_agent || '')}"><i class="fa-solid fa-display" style="margin-right: 4px;"></i>${escapeHtml(device)}</span></td>
            <td style="font-size: 0.82rem; color: #cbd5e1;">${escapeHtml(log.details || '')}</td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">Henüz kaydedilmiş güvenlik olayı veya hatalı giriş denemesi yok.</td></tr>';
      }
    } catch (e) {
      console.error('Security logs load error', e);
    }
  }

  function formatDevice(ua) {
    if (!ua) return 'Bilinmiyor';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('iPhone')) return 'iPhone (iOS)';
    if (ua.includes('iPad')) return 'iPad (iPadOS)';
    if (ua.includes('Android')) return 'Android Cihaz';
    if (ua.includes('Macintosh')) return 'Mac OS';
    if (ua.includes('Linux')) return 'Linux PC';
    if (ua.includes('curl') || ua.includes('Postman') || ua.includes('python')) return 'Bot / Script';
    return 'Web Tarayıcısı';
  }

  // Refresh Security Logs Button
  const refreshSecBtn = document.getElementById('refresh-security-logs-btn');
  if (refreshSecBtn) {
    refreshSecBtn.addEventListener('click', async () => {
      refreshSecBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      await loadSecurityLogs();
      refreshSecBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Yenile';
      showToast('Güvenlik günlüğü yenilendi.', 'info');
    });
  }

  // Clear Security Logs Button
  const clearSecBtn = document.getElementById('clear-security-logs-btn');
  if (clearSecBtn) {
    clearSecBtn.addEventListener('click', async () => {
      if (!confirm('Tüm güvenlik ve hatalı giriş kayıtlarını temizlemek istediğinizden emin misiniz?')) return;
      try {
        const res = await fetch('/api/admin/security/logs/clear', { method: 'POST' });
        if (res.ok) {
          showToast('Güvenlik günlüğü temizlendi.', 'success');
          await loadSecurityLogs();
        } else {
          showToast('Temizleme işlemi başarısız!', 'error');
        }
      } catch {
        showToast('Sunucu hatası!', 'error');
      }
    });
  }

  // --- Toast Notification Helper ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `<i class="${iconClass}"></i><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
