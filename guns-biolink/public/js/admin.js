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

  // --- Login Form Submission ---
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        errorEl.style.display = 'none';
        showDashboard();
        showToast('Giriş başarılı!', 'success');
      } else {
        errorEl.textContent = data.error || 'Giriş başarısız.';
        errorEl.style.display = 'block';
      }
    } catch (err) {
      errorEl.textContent = 'Sunucuya bağlanılamadı.';
      errorEl.style.display = 'block';
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
    await Promise.all([loadSettings(), loadLinks(), loadAnalytics()]);
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

  function populateSettingsForms(s) {
    // 1. Profile Form
    document.getElementById('setting-avatar-url').value = s.avatar_url || '';
    document.getElementById('avatar-preview-img').src = s.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';
    document.getElementById('setting-display-name').value = s.display_name || '';
    document.getElementById('setting-username').value = s.username ? s.username.replace(/^@/, '') : '';
    document.getElementById('setting-location').value = s.location || '';
    document.getElementById('setting-avatar-glow').value = s.avatar_glow || '#8b5cf6';
    document.getElementById('setting-avatar-glow-text').value = s.avatar_glow || '#8b5cf6';
    document.getElementById('setting-bio').value = s.bio || '';

    // Badges
    let badges = [];
    try { badges = typeof s.badges === 'string' ? JSON.parse(s.badges) : (s.badges || []); } catch {}
    document.querySelectorAll('input[name="badges"]').forEach(cb => {
      cb.checked = badges.includes(cb.value);
    });

    // 2. Background Form
    document.getElementById('setting-bg-type').value = s.bg_type || 'video';
    document.getElementById('setting-bg-url').value = s.bg_url || '';
    document.getElementById('setting-bg-blur').value = s.bg_blur || 5;
    document.getElementById('blur-val-label').textContent = `${s.bg_blur || 5}px`;
    document.getElementById('setting-bg-overlay').value = s.bg_overlay_opacity !== undefined ? s.bg_overlay_opacity : 0.6;
    document.getElementById('overlay-val-label').textContent = `%${Math.round((s.bg_overlay_opacity || 0.6) * 100)}`;
    document.getElementById('setting-enter-text').value = s.click_to_enter_text || '[ TIKLA VE GİRİŞ YAP ]';
    document.getElementById('setting-enter-overlay-enabled').checked = String(s.enter_overlay_enabled) !== '0';

    // 3. Audio Form
    document.getElementById('setting-audio-url').value = s.audio_url || '';
    document.getElementById('setting-audio-title').value = s.audio_title || '';
    document.getElementById('setting-audio-artist').value = s.audio_artist || '';
    document.getElementById('setting-audio-autoplay').checked = String(s.audio_autoplay) === '1' || s.audio_autoplay === true;
    document.getElementById('setting-show-audio-player').checked = String(s.show_audio_player) !== '0';

    // 4. Typewriter Form
    let phrases = ['Software Developer 💻', 'Building the Future ⚡'];
    try { phrases = typeof s.typewriter_phrases === 'string' ? JSON.parse(s.typewriter_phrases) : (s.typewriter_phrases || phrases); } catch {}
    renderPhrasesList(phrases);

    document.getElementById('setting-type-speed').value = s.typewriter_speed || 75;
    document.getElementById('type-speed-val').textContent = `${s.typewriter_speed || 75}ms`;
    document.getElementById('setting-delete-speed').value = s.typewriter_delete_speed || 40;
    document.getElementById('delete-speed-val').textContent = `${s.typewriter_delete_speed || 40}ms`;
    document.getElementById('setting-type-delay').value = s.typewriter_delay || 1800;
    document.getElementById('delay-val-label').textContent = `${s.typewriter_delay || 1800}ms`;

    // 5. Theme Form
    document.getElementById('setting-accent-color').value = s.accent_color || '#8b5cf6';
    document.getElementById('setting-accent-color-text').value = s.accent_color || '#8b5cf6';
    document.getElementById('setting-particles-effect').value = s.particles_effect || 'snow';
    document.getElementById('setting-card-blur').value = s.card_blur || 20;
    document.getElementById('card-blur-val').textContent = `${s.card_blur || 20}px`;
    document.getElementById('setting-card-opacity').value = s.card_opacity || 0.55;
    document.getElementById('card-opacity-val').textContent = `%${Math.round((s.card_opacity || 0.55) * 100)}`;
    document.getElementById('setting-cursor-trail').checked = String(s.cursor_trail) === '1' || s.cursor_trail === true;
    document.getElementById('setting-show-view-counter').checked = String(s.show_view_counter) !== '0';
  }

  // --- Dynamic Color Input Sync ---
  syncColorInputs('setting-avatar-glow', 'setting-avatar-glow-text');
  syncColorInputs('setting-accent-color', 'setting-accent-color-text');
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
      } else {
        showToast('Kaydetme hatası oluştu!', 'error');
      }
    } catch {
      showToast('Sunucu hatası!', 'error');
    }
  }

  // 1. Profile Form Save
  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const badges = Array.from(document.querySelectorAll('input[name="badges"]:checked')).map(cb => cb.value);

    const payload = {
      avatar_url: document.getElementById('setting-avatar-url').value,
      display_name: document.getElementById('setting-display-name').value,
      username: document.getElementById('setting-username').value,
      location: document.getElementById('setting-location').value,
      avatar_glow: document.getElementById('setting-avatar-glow').value,
      bio: document.getElementById('setting-bio').value,
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
      audio_title: document.getElementById('setting-audio-title').value,
      audio_artist: document.getElementById('setting-audio-artist').value,
      audio_autoplay: document.getElementById('setting-audio-autoplay').checked ? '1' : '0',
      show_audio_player: document.getElementById('setting-show-audio-player').checked ? '1' : '0'
    };
    saveSettingsPayload(payload);
  });

  // 4. Typewriter Form Save
  document.getElementById('typewriter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const phraseInputs = document.querySelectorAll('.phrase-input');
    const phrases = Array.from(phraseInputs).map(inp => inp.value.trim()).filter(v => v.length > 0);

    const payload = {
      typewriter_phrases: JSON.stringify(phrases),
      typewriter_speed: document.getElementById('setting-type-speed').value,
      typewriter_delete_speed: document.getElementById('setting-delete-speed').value,
      typewriter_delay: document.getElementById('setting-type-delay').value
    };
    saveSettingsPayload(payload);
  });

  // 5. Theme Form Save
  document.getElementById('theme-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      accent_color: document.getElementById('setting-accent-color').value,
      particles_effect: document.getElementById('setting-particles-effect').value,
      card_blur: document.getElementById('setting-card-blur').value,
      card_opacity: parseFloat(document.getElementById('setting-card-opacity').value),
      cursor_trail: document.getElementById('setting-cursor-trail').checked ? '1' : '0',
      show_view_counter: document.getElementById('setting-show-view-counter').checked ? '1' : '0'
    };
    saveSettingsPayload(payload);
  });

  // --- Typewriter Dynamic Phrase List ---
  const phrasesContainer = document.getElementById('phrases-list-container');
  const addPhraseBtn = document.getElementById('add-phrase-btn');

  function renderPhrasesList(phrases) {
    phrasesContainer.innerHTML = '';
    phrases.forEach((phrase) => {
      addPhraseRow(phrase);
    });
  }

  function addPhraseRow(val = '') {
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

  addPhraseBtn.addEventListener('click', () => addPhraseRow(''));

  // --- File Upload Handlers (Avatar, Background, Audio, Custom Icon) ---
  setupFileUpload('avatar-file-input', (url) => {
    document.getElementById('setting-avatar-url').value = url;
    document.getElementById('avatar-preview-img').src = url;
    showToast('Avatar yüklendi!', 'success');
  });

  setupFileUpload('bg-file-input', (url) => {
    document.getElementById('setting-bg-url').value = url;
    showToast('Arka plan medyası yüklendi!', 'success');
  });

  setupFileUpload('audio-file-input', (url) => {
    document.getElementById('setting-audio-url').value = url;
    showToast('Ses dosyası yüklendi!', 'success');
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
    if (link.glow_color) {
      item.style.setProperty('--link-color', link.glow_color);
    }

    let iconHtml = '';
    if (link.icon_type === 'custom_image' && link.icon_value) {
      iconHtml = `<img src="${link.icon_value}" alt="${link.title}">`;
    } else {
      const iconClass = ICON_MAP[link.icon_value] || 'fa-solid fa-link';
      iconHtml = `<i class="${iconClass}"></i>`;
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
