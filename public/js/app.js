// alpay.fun Biolink Client Logic
let profileSettings = null;

// Global smooth enter function
window.enterBiolink = function() {
  const enterOverlay = document.getElementById('enter-overlay');
  if (enterOverlay && !enterOverlay.classList.contains('fading') && !enterOverlay.classList.contains('hidden')) {
    enterOverlay.classList.add('fading');
    setTimeout(() => {
      enterOverlay.classList.add('hidden');
      enterOverlay.style.display = 'none';
    }, 850);
  }

  // Play audio safely
  const bgAudio = document.getElementById('bg-audio');
  const audioWidgetIcon = document.getElementById('audio-widget-icon');
  const audioCoverIcon = document.getElementById('audio-cover-icon');
  const audioCoverWrap = document.getElementById('audio-cover-wrap');
  const audioFloatingIcon = document.getElementById('audio-icon');
  const eqBars = document.getElementById('equalizer-bars');

  if (bgAudio && bgAudio.src && (!profileSettings || String(profileSettings.audio_autoplay) !== '0')) {
    const initVolPct = (profileSettings && profileSettings.audio_volume !== undefined && profileSettings.audio_volume !== '') ? parseFloat(profileSettings.audio_volume) : 50;
    bgAudio.volume = Math.max(0, Math.min(1, initVolPct / 100));
    bgAudio.play().then(() => {
      if (audioWidgetIcon) audioWidgetIcon.className = 'fa-solid fa-pause';
      if (audioCoverIcon) audioCoverIcon.className = 'fa-solid fa-pause';
      if (audioCoverWrap) audioCoverWrap.classList.add('spinning');
      if (audioFloatingIcon) audioFloatingIcon.className = 'fa-solid fa-volume-high';
      if (eqBars) eqBars.classList.remove('paused');
    }).catch(err => {
      console.log('Audio autoplay prevented by browser policy:', err);
      if (audioWidgetIcon) audioWidgetIcon.className = 'fa-solid fa-play';
      if (audioCoverIcon) audioCoverIcon.className = 'fa-solid fa-play';
      if (audioCoverWrap) audioCoverWrap.classList.remove('spinning');
      if (audioFloatingIcon) audioFloatingIcon.className = 'fa-solid fa-volume-xmark';
      if (eqBars) eqBars.classList.add('paused');
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  let profileData = null;
  let typewriterTimeout = null;
  let typewriterIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  // Browser Tab Title Typewriter State
  let tabTypewriterTimeout = null;
  let tabPhraseIndex = 0;
  let tabCharIndex = 0;
  let tabIsDeleting = false;

  // Canvas engine state (must be declared before any await so they're initialized before use)
  let cursorRafId = null;
  let cursorCanvasRafId = null;
  let cursorResizeHandler = null;
  let particleAnimationId = null;
  let particleResizeHandler = null;

  // Comprehensive Icon Mapping Dictionary
  const ICON_MAP = {
    // Row 1 & Popular Socials
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

    // Row 2 & Streaming / Dev
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

    // Row 3 & Crypto / Payments
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

  // Distinct Badges Mapping
  const BADGE_MAP = {
    diamond: { icon: 'fa-solid fa-gem', color: '#c084fc', title: 'Elmas (Diamond)' },
    verified: { icon: 'fa-solid fa-circle-check', color: '#38bdf8', title: 'Doğrulanmış' },
    vip: { icon: 'fa-solid fa-shield-halved', color: '#fbbf24', title: 'VIP' },
    crown: { icon: 'fa-solid fa-crown', color: '#f59e0b', title: 'Crown / Sahip' },
    sparkles: { icon: 'fa-solid fa-wand-magic-sparkles', color: '#ec4899', title: 'Parıltı' },
    flame: { icon: 'fa-solid fa-fire-flame-curved', color: '#f97316', title: 'Alev' }
  };

  // Attach click listener to overlay immediately
  const enterOverlay = document.getElementById('enter-overlay');
  if (enterOverlay) {
    enterOverlay.addEventListener('click', window.enterBiolink);
  }

  // --- Fetch Profile Data ---
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Profil verisi alınamadı');
    profileData = await res.json();
    initBiolink(profileData);
  } catch (err) {
    console.error('API Error:', err);
  }

  // --- Initialize Biolink Elements ---
  function initBiolink(data) {
    if (!data) return;
    const { settings, links, analytics } = data;
    profileSettings = settings;

    // 0. Update Enter Overlay Immediately
    const enterText = document.getElementById('enter-text');
    if (enterText) {
      enterText.textContent = settings.click_to_enter_text || '[ TIKLA VE GİRİŞ YAP ]';
    }
    if (String(settings.enter_overlay_enabled) === '0') {
      const ov = document.getElementById('enter-overlay');
      if (ov) {
        ov.classList.add('hidden');
        ov.style.display = 'none';
      }
    }

    // 1. Accent & Theme Colors
    const accent = (settings.accent_color && settings.accent_color !== '#000000' && settings.accent_color !== '#000')
      ? settings.accent_color
      : '#a855f7';
    document.documentElement.style.setProperty('--accent-color', accent);
    document.documentElement.style.setProperty('--accent-glow', `${accent}66`);

    // 2. Avatar & Toggleable Avatar Glow
    const avatarImg = document.getElementById('avatar-img');
    const avatarBox = document.getElementById('avatar-box');
    const isGlowEnabled = String(settings.avatar_glow_enabled) !== '0';
    const glowColor = settings.avatar_glow || accent;

    document.documentElement.style.setProperty('--avatar-glow', glowColor);
    document.documentElement.style.setProperty('--avatar-glow-shadow', `${glowColor}88`);
    document.documentElement.style.setProperty('--avatar-glow-ambient', `${glowColor}33`);

    if (avatarBox) {
      if (isGlowEnabled) {
        avatarBox.className = 'avatar-box with-glow';
      } else {
        avatarBox.className = 'avatar-box no-glow';
      }
    }

    if (avatarImg) {
      avatarImg.src = settings.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';
      avatarImg.onload = () => { avatarImg.style.opacity = '1'; };
      avatarImg.onerror = () => { avatarImg.style.opacity = '1'; };
    }

    // 3. macOS Liquid Glass Card Toggle & Blur
    const profileContainer = document.getElementById('profile-container');
    const isCardEnabled = String(settings.show_card) !== '0';
    const cardBlur = settings.card_blur !== undefined ? parseInt(settings.card_blur, 10) : 25;
    const cardOpacity = settings.card_opacity !== undefined ? parseFloat(settings.card_opacity) : 0.15;

    document.documentElement.style.setProperty('--card-blur', `${cardBlur}px`);
    document.documentElement.style.setProperty('--card-opacity', `${cardOpacity}`);

    if (profileContainer) {
      if (isCardEnabled) {
        profileContainer.classList.add('mac-liquid-glass');
      } else {
        profileContainer.classList.remove('mac-liquid-glass');
      }
      profileContainer.classList.add('loaded');
    }

    // Document Title, Favicon & Tab Typewriter
    setupTabTitleAndFavicon(settings);

    const nameEl = document.getElementById('display-name-text');
    if (nameEl) {
      nameEl.textContent = settings.display_name || 'Alpay';
    }

    // 4. Bio / Description
    const bioEl = document.getElementById('bio-text');
    if (bioEl) {
      if (settings.bio && settings.bio.trim() !== '') {
        bioEl.textContent = settings.bio;
        bioEl.style.display = 'block';
      } else {
        bioEl.style.display = 'none';
      }
    }

    // 5. Badges (Strict: Only render selected badges, NO fallback if empty!)
    const badgesContainer = document.getElementById('badges-container');
    if (badgesContainer) {
      badgesContainer.innerHTML = '';
      let parsedBadges = [];
      try {
        parsedBadges = typeof settings.badges === 'string' ? JSON.parse(settings.badges) : (settings.badges || []);
      } catch {
        parsedBadges = [];
      }

      if (Array.isArray(parsedBadges)) {
        parsedBadges.forEach(bKey => {
          const badge = BADGE_MAP[bKey];
          if (badge) {
            const badgeEl = document.createElement('span');
            badgeEl.className = 'badge-item';
            badgeEl.title = badge.title;
            badgeEl.style.setProperty('--badge-glow', `${badge.color}aa`);
            badgeEl.innerHTML = `<i class="${badge.icon}" style="color: ${badge.color};"></i>`;
            badgesContainer.appendChild(badgeEl);
          }
        });
      }
    }

    // 6. Background Media Setup
    setupBackground(settings);

    // 7. Typewriter Effect
    setupTypewriter(settings);

    // 8. Social & Custom Links
    if (Array.isArray(links)) {
      renderLinks(links, settings);
    }

    // 9. Audio Player Widget & Controls
    setupAudio(settings);

    // 10. Visitor Count & Location Stats
    const visitorBadge = document.getElementById('visitor-badge');
    if (visitorBadge) {
      if (String(settings.show_view_counter) !== '0') {
        visitorBadge.style.display = 'inline-flex';
        const vCount = document.getElementById('visitor-count');
        if (vCount) vCount.textContent = (analytics && analytics.total_views) || 1;
      } else {
        visitorBadge.style.display = 'none';
      }
    }

    const locBadge = document.getElementById('location-badge');
    if (locBadge) {
      if (settings.location && settings.location.trim() !== '') {
        locBadge.style.display = 'inline-flex';
        const locText = document.getElementById('location-text');
        if (locText) locText.textContent = settings.location;
      } else {
        locBadge.style.display = 'none';
      }
    }

    // 11. Atmospheric Particle Canvas Engine
    initParticles(settings.particles_effect || 'none', accent);

    // 12. Interactive Cursor Trail
    if (String(settings.cursor_trail) === '1' || settings.cursor_trail === true) {
      initCursorTrail(accent);
    } else {
      const cursor = document.getElementById('cursor-glow');
      if (cursor) {
        cursor.style.display = 'none';
        cursor.classList.remove('visible');
      }
      const cCanvas = document.getElementById('cursor-canvas');
      if (cCanvas) cCanvas.style.display = 'none';
    }
  }

  // --- Background Media Setup ---
  function setupBackground(settings) {
    const bgVideo = document.getElementById('bg-video');
    const bgImage = document.getElementById('bg-image');
    const bgOverlay = document.getElementById('bg-overlay');

    if (!bgVideo || !bgImage || !bgOverlay) return;

    const blurVal = settings.bg_blur ? `${settings.bg_blur}px` : '0px';
    const overlayOpacity = settings.bg_overlay_opacity !== undefined ? settings.bg_overlay_opacity : 0.25;
    bgOverlay.style.backgroundColor = `rgba(5, 6, 8, ${overlayOpacity})`;

    if (settings.bg_type === 'video' && settings.bg_url) {
      bgVideo.src = settings.bg_url;
      bgVideo.style.filter = `blur(${blurVal})`;
      bgVideo.classList.add('active');
      bgImage.classList.remove('active');
      bgVideo.play().catch(() => {});
    } else if ((settings.bg_type === 'image' || settings.bg_type === 'gif') && settings.bg_url) {
      bgImage.src = settings.bg_url;
      bgImage.style.filter = `blur(${blurVal})`;
      bgImage.classList.add('active');
      bgVideo.classList.remove('active');
    } else {
      bgVideo.classList.remove('active');
      bgImage.classList.remove('active');
      const bgCont = document.getElementById('bg-container');
      if (bgCont) bgCont.style.background = '#050608';
    }
  }

  // --- Typewriter Effect Engine ---
  function setupTypewriter(settings) {
    if (typewriterTimeout) clearTimeout(typewriterTimeout);

    let phrases = ['server.alpay.fun', 'alpay.fun'];
    try {
      if (typeof settings.typewriter_phrases === 'string') {
        phrases = JSON.parse(settings.typewriter_phrases);
      } else if (Array.isArray(settings.typewriter_phrases)) {
        phrases = settings.typewriter_phrases;
      }
    } catch {}

    const typewriterLine = document.getElementById('typewriter-line');
    if (!phrases || phrases.length === 0) {
      if (typewriterLine) typewriterLine.style.display = 'none';
      return;
    }
    if (typewriterLine) typewriterLine.style.display = 'flex';

    const typewriterEl = document.getElementById('typewriter-text');
    if (!typewriterEl) return;

    const typeSpeed = parseInt(settings.typewriter_speed, 10) || 75;
    const deleteSpeed = parseInt(settings.typewriter_delete_speed, 10) || 40;
    const delay = parseInt(settings.typewriter_delay, 10) || 1800;

    typewriterIndex = 0;
    charIndex = 0;
    isDeleting = false;

    function typeStep() {
      const currentPhrase = phrases[typewriterIndex % phrases.length];

      if (isDeleting) {
        charIndex--;
        typewriterEl.textContent = currentPhrase.substring(0, charIndex);
        if (charIndex <= 0) {
          isDeleting = false;
          typewriterIndex++;
          typewriterTimeout = setTimeout(typeStep, 350);
          return;
        }
        typewriterTimeout = setTimeout(typeStep, deleteSpeed);
      } else {
        charIndex++;
        typewriterEl.textContent = currentPhrase.substring(0, charIndex);
        if (charIndex >= currentPhrase.length) {
          isDeleting = true;
          typewriterTimeout = setTimeout(typeStep, delay);
          return;
        }
        typewriterTimeout = setTimeout(typeStep, typeSpeed);
      }
    }

    typeStep();
  }

  // --- Browser Tab Title & Favicon Engine ---
  function setupTabTitleAndFavicon(settings) {
    if (tabTypewriterTimeout) clearTimeout(tabTypewriterTimeout);

    // 1. Favicon Setup
    let faviconLink = document.getElementById('site-favicon') || document.querySelector("link[rel*='icon']");
    if (settings.favicon_url && settings.favicon_url.trim() !== '') {
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.id = 'site-favicon';
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = settings.favicon_url;
    }

    // 2. Tab Title & Typewriter
    const isTabTypewriter = String(settings.tab_typewriter_enabled) !== '0';
    const staticTitle = (settings.tab_title && settings.tab_title.trim() !== '')
      ? settings.tab_title
      : (settings.display_name ? `${settings.display_name} | alpay.fun` : 'alpay.fun');

    if (!isTabTypewriter) {
      document.title = staticTitle;
      return;
    }

    // Parse tab typewriter phrases
    let tabPhrases = [];
    try {
      if (typeof settings.tab_typewriter_phrases === 'string') {
        tabPhrases = JSON.parse(settings.tab_typewriter_phrases);
      } else if (Array.isArray(settings.tab_typewriter_phrases)) {
        tabPhrases = settings.tab_typewriter_phrases;
      }
    } catch {}

    // Fallback to profile phrases or staticTitle if tabPhrases is empty
    if (!tabPhrases || tabPhrases.length === 0) {
      try {
        if (typeof settings.typewriter_phrases === 'string') {
          tabPhrases = JSON.parse(settings.typewriter_phrases);
        } else if (Array.isArray(settings.typewriter_phrases)) {
          tabPhrases = settings.typewriter_phrases;
        }
      } catch {}
    }

    if (!tabPhrases || tabPhrases.length === 0) {
      tabPhrases = [staticTitle];
    }

    tabPhraseIndex = 0;
    tabCharIndex = 0;
    tabIsDeleting = false;

    const typeSpeed = parseInt(settings.typewriter_speed, 10) || 85;
    const deleteSpeed = parseInt(settings.typewriter_delete_speed, 10) || 45;
    const delay = parseInt(settings.typewriter_delay, 10) || 2000;

    function tabTypeStep() {
      const currentPhrase = tabPhrases[tabPhraseIndex % tabPhrases.length];

      if (tabIsDeleting) {
        tabCharIndex--;
        document.title = currentPhrase.substring(0, tabCharIndex) || ' ';
        if (tabCharIndex <= 0) {
          tabIsDeleting = false;
          tabPhraseIndex++;
          tabTypewriterTimeout = setTimeout(tabTypeStep, 350);
          return;
        }
        tabTypewriterTimeout = setTimeout(tabTypeStep, deleteSpeed);
      } else {
        tabCharIndex++;
        document.title = currentPhrase.substring(0, tabCharIndex);
        if (tabCharIndex >= currentPhrase.length) {
          tabIsDeleting = true;
          tabTypewriterTimeout = setTimeout(tabTypeStep, delay);
          return;
        }
        tabTypewriterTimeout = setTimeout(tabTypeStep, typeSpeed);
      }
    }

    tabTypeStep();
  }

  // --- Render Social & Custom Links ---
  function renderLinks(links, settings = {}) {
    const socialBar = document.getElementById('social-links-bar');
    const customContainer = document.getElementById('custom-links-container');
    if (socialBar) socialBar.innerHTML = '';
    if (customContainer) customContainer.innerHTML = '';

    const socialLinks = links.filter(l => l.is_social === 1);
    const customLinks = links.filter(l => l.is_social === 0);

    const colorMode = settings.link_color_mode || 'original'; // 'original' vs 'custom'
    const customColor = settings.link_custom_color || '#ffffff';
    const isGlowEnabled = String(settings.link_glow_enabled) !== '0';

    if (socialBar) {
      socialLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = sanitizeUrl(link.url);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.title = link.title;

        // Calculate icon color based on mode
        let iconColor = '#ffffff';
        if (colorMode === 'original') {
          if (link.icon_type === 'preset' && BRAND_COLOR_MAP[link.icon_value]) {
            iconColor = BRAND_COLOR_MAP[link.icon_value];
          } else {
            iconColor = link.glow_color || '#ffffff';
          }
        } else {
          iconColor = customColor;
        }

        a.className = `social-icon-link ${isGlowEnabled ? 'has-glow' : 'no-glow'}`;
        a.style.setProperty('--icon-color', iconColor);
        a.style.setProperty('--icon-glow', iconColor);

        if (link.icon_type === 'custom_image' && link.icon_value) {
          a.innerHTML = `<img src="${link.icon_value}" alt="${escapeHtml(link.title)}">`;
        } else {
          const iconClass = ICON_MAP[link.icon_value] || 'fa-solid fa-link';
          a.innerHTML = `<i class="${iconClass}"></i>`;
        }

        a.addEventListener('click', () => trackClick(link.id));
        socialBar.appendChild(a);
      });
    }

    if (customContainer) {
      customLinks.forEach(link => {
        const card = document.createElement('a');
        card.href = sanitizeUrl(link.url);
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        let linkColor = '#ffffff';
        if (colorMode === 'original') {
          if (link.icon_type === 'preset' && BRAND_COLOR_MAP[link.icon_value]) {
            linkColor = BRAND_COLOR_MAP[link.icon_value];
          } else {
            linkColor = link.glow_color || '#ffffff';
          }
        } else {
          linkColor = customColor;
        }

        card.className = `custom-link-card ${isGlowEnabled ? 'has-glow' : 'no-glow'}`;
        card.style.setProperty('--link-color', linkColor);
        card.style.setProperty('--link-glow', linkColor);

        let iconHtml = '';
        if (link.icon_type === 'custom_image' && link.icon_value) {
          iconHtml = `<img src="${link.icon_value}" alt="${escapeHtml(link.title)}">`;
        } else {
          const iconClass = ICON_MAP[link.icon_value] || 'fa-solid fa-arrow-up-right-from-square';
          iconHtml = `<i class="${iconClass}"></i>`;
        }

        card.innerHTML = `
          <div class="custom-link-left">
            <div class="custom-link-icon-box ${isGlowEnabled ? 'has-glow' : 'no-glow'}">
              ${iconHtml}
            </div>
            <div class="custom-link-texts">
              <span class="custom-link-title">${escapeHtml(link.title)}</span>
              ${link.subtitle ? `<span class="custom-link-subtitle">${escapeHtml(link.subtitle)}</span>` : ''}
            </div>
          </div>
          <i class="fa-solid fa-chevron-right custom-link-arrow"></i>
        `;

        card.addEventListener('click', () => trackClick(link.id));
        customContainer.appendChild(card);
      });
    }
  }

  const clickedRecently = new Set();

  function trackClick(linkId) {
    if (!linkId) return;
    // Do not track clicks if inside admin preview iframe
    if (window.self !== window.top) return;
    // Client-side debounce (1 minute per link)
    if (clickedRecently.has(linkId)) return;
    clickedRecently.add(linkId);
    setTimeout(() => clickedRecently.delete(linkId), 60000);

    try {
      fetch('/api/analytics/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_id: linkId })
      }).catch(() => {});
    } catch {}
  }

  // --- Audio Setup & Player Widget Controls ---
  function setupAudio(settings) {
    const bgAudio = document.getElementById('bg-audio');
    const audioWidget = document.getElementById('audio-player-widget');
    const audioWidgetBtn = document.getElementById('audio-widget-btn');
    const audioWidgetIcon = document.getElementById('audio-widget-icon');
    const audioCoverWrap = document.getElementById('audio-cover-wrap');
    const audioCoverImg = document.getElementById('audio-cover-img');
    const audioCoverIcon = document.getElementById('audio-cover-icon');
    const audioFloatingBtn = document.getElementById('floating-audio-btn');
    const audioFloatingIcon = document.getElementById('audio-icon');
    const trackTitle = document.getElementById('audio-track-title');
    const trackArtist = document.getElementById('audio-track-artist');
    const volSlider = document.getElementById('volume-slider');
    const eqBars = document.getElementById('equalizer-bars');

    if (!bgAudio) return;

    if (settings.audio_url && settings.audio_url.trim() !== '') {
      bgAudio.src = settings.audio_url;

      const initVolPct = (settings.audio_volume !== undefined && settings.audio_volume !== '') ? parseFloat(settings.audio_volume) : 50;
      const initialVolume = Math.max(0, Math.min(1, initVolPct / 100));
      bgAudio.volume = initialVolume;

      if (volSlider) {
        volSlider.value = initialVolume;
      }

      const title = settings.audio_title && settings.audio_title.trim() !== '' ? settings.audio_title : 'Audio Track';
      const artist = settings.audio_artist && settings.audio_artist.trim() !== '' ? settings.audio_artist : 'alpay.fun';

      if (trackTitle) trackTitle.textContent = title;
      if (trackArtist) trackArtist.textContent = artist;

      // Album Cover Art Setup
      if (settings.audio_cover_url && settings.audio_cover_url.trim() !== '') {
        if (audioCoverImg) audioCoverImg.src = settings.audio_cover_url;
        if (audioCoverWrap) audioCoverWrap.style.display = 'flex';
        if (audioWidgetBtn) audioWidgetBtn.style.display = 'none';
      } else {
        if (audioCoverWrap) audioCoverWrap.style.display = 'none';
        if (audioWidgetBtn) audioWidgetBtn.style.display = 'flex';
      }

      if (String(settings.show_audio_player) === '1') {
        if (audioWidget) audioWidget.style.display = 'flex';
        if (audioFloatingBtn) audioFloatingBtn.style.display = 'none';
      } else {
        if (audioWidget) audioWidget.style.display = 'none';
        if (audioFloatingBtn) audioFloatingBtn.style.display = 'flex';
      }

      // Volume Slider
      if (volSlider) {
        volSlider.addEventListener('input', (e) => {
          bgAudio.volume = parseFloat(e.target.value);
        });
      }

      // Play / Pause toggler helper
      const togglePlayback = (e) => {
        if (e) e.stopPropagation();
        if (bgAudio.paused) {
          bgAudio.play().then(() => {
            if (audioWidgetIcon) audioWidgetIcon.className = 'fa-solid fa-pause';
            if (audioCoverIcon) audioCoverIcon.className = 'fa-solid fa-pause';
            if (audioCoverWrap) audioCoverWrap.classList.add('spinning');
            if (audioFloatingIcon) audioFloatingIcon.className = 'fa-solid fa-volume-high';
            if (eqBars) eqBars.classList.remove('paused');
          }).catch(() => {});
        } else {
          bgAudio.pause();
          if (audioWidgetIcon) audioWidgetIcon.className = 'fa-solid fa-play';
          if (audioCoverIcon) audioCoverIcon.className = 'fa-solid fa-play';
          if (audioCoverWrap) audioCoverWrap.classList.remove('spinning');
          if (audioFloatingIcon) audioFloatingIcon.className = 'fa-solid fa-volume-xmark';
          if (eqBars) eqBars.classList.add('paused');
        }
      };

      if (audioWidgetBtn) audioWidgetBtn.onclick = togglePlayback;
      if (audioCoverWrap) audioCoverWrap.onclick = togglePlayback;
      if (audioFloatingBtn) audioFloatingBtn.onclick = togglePlayback;

      bgAudio.onended = () => {
        if (audioWidgetIcon) audioWidgetIcon.className = 'fa-solid fa-play';
        if (audioCoverIcon) audioCoverIcon.className = 'fa-solid fa-play';
        if (audioCoverWrap) audioCoverWrap.classList.remove('spinning');
        if (audioFloatingIcon) audioFloatingIcon.className = 'fa-solid fa-volume-xmark';
        if (eqBars) eqBars.classList.add('paused');
      };
    } else {
      if (audioWidget) audioWidget.style.display = 'none';
      if (audioFloatingBtn) audioFloatingBtn.style.display = 'none';
    }
  }
  // --- Smooth Cursor Glow Trail Engine ---

  function initCursorTrail(accentColor = '#a855f7') {
    const cursorGlow = document.getElementById('cursor-glow');
    const canvas = document.getElementById('cursor-canvas');

    if (cursorGlow) {
      cursorGlow.style.display = 'block';
      cursorGlow.classList.add('visible');
    }

    if (!canvas) return;
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    if (cursorResizeHandler) window.removeEventListener('resize', cursorResizeHandler);
    cursorResizeHandler = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', cursorResizeHandler);

    let mouseX = W / 2, mouseY = H / 2;
    let targetX = mouseX, targetY = mouseY;

    // Smooth trail: store recent positions
    const trail = [];
    const maxTrail = 28;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (cursorGlow && !cursorGlow.classList.contains('visible')) {
        cursorGlow.classList.add('visible');
      }
      trail.unshift({ x: e.clientX, y: e.clientY });
      if (trail.length > maxTrail) trail.pop();
    });

    window.addEventListener('mouseleave', () => {
      if (cursorGlow) cursorGlow.classList.remove('visible');
      trail.length = 0;
    });

    if (cursorRafId) cancelAnimationFrame(cursorRafId);
    if (cursorCanvasRafId) cancelAnimationFrame(cursorCanvasRafId);

    function tickCursor() {
      mouseX += (targetX - mouseX) * 0.15;
      mouseY += (targetY - mouseY) * 0.15;
      if (cursorGlow) {
        cursorGlow.style.left = `${mouseX}px`;
        cursorGlow.style.top = `${mouseY}px`;
      }
      cursorRafId = requestAnimationFrame(tickCursor);
    }
    tickCursor();

    // Render smooth fading trail
    function renderTrail() {
      ctx.clearRect(0, 0, W, H);

      if (trail.length > 2) {
        // Smooth gradient ribbon
        for (let i = 0; i < trail.length - 1; i++) {
          const p1 = trail[i];
          const p2 = trail[i + 1];
          const t = 1 - i / trail.length;

          // Soft outer glow stroke
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = t * 6 + 1;
          ctx.lineCap = 'round';
          ctx.globalAlpha = t * 0.35;
          ctx.shadowBlur = 18;
          ctx.shadowColor = accentColor;
          ctx.stroke();
          ctx.restore();

          // Inner bright core
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = t * 1.8 + 0.5;
          ctx.lineCap = 'round';
          ctx.globalAlpha = t * 0.6;
          ctx.stroke();
          ctx.restore();
        }

        // Soft glow dot at cursor head
        if (trail.length > 0) {
          const head = trail[0];
          ctx.save();
          const grad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 16);
          grad.addColorStop(0, accentColor + 'aa');
          grad.addColorStop(1, accentColor + '00');
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      cursorCanvasRafId = requestAnimationFrame(renderTrail);
    }
    renderTrail();
  }

  // --- Smooth Atmospheric Particle Engine ---

  function initParticles(type, accentColor = '#a855f7') {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    if (particleAnimationId) {
      cancelAnimationFrame(particleAnimationId);
      particleAnimationId = null;
    }
    if (particleResizeHandler) {
      window.removeEventListener('resize', particleResizeHandler);
      particleResizeHandler = null;
    }

    if (!type || type === 'none') {
      canvas.style.display = 'none';
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    particleResizeHandler = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', particleResizeHandler);

    const particles = [];

    // --- Per-type initialization ---
    if (type === 'snow') {
      for (let i = 0; i < 70; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 2.5 + 1,
          vy: Math.random() * 0.6 + 0.3,
          drift: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.4 + 0.2
        });
      }
    } else if (type === 'stars') {
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.8 + 0.6,
          alpha: Math.random() * 0.5 + 0.3,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.008
        });
      }
    } else if (type === 'fireflies') {
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 3 + 1.5,
          phase: Math.random() * Math.PI * 2,
          phaseX: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    } else if (type === 'rain') {
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          vy: Math.random() * 8 + 6,
          len: Math.random() * 16 + 10,
          alpha: Math.random() * 0.25 + 0.1
        });
      }
    } else if (type === 'matrix') {
      const colW = 22;
      const cols = Math.floor(W / colW);
      for (let c = 0; c < cols; c++) {
        particles.push({
          x: c * colW,
          y: Math.random() * -H,
          vy: Math.random() * 3 + 2,
          char: String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96)),
          trail: [],
          alpha: Math.random() * 0.5 + 0.3
        });
      }
    } else if (type === 'cosmic') {
      for (let i = 0; i < 45; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 4 + 2,
          hue: Math.floor(Math.random() * 60) + 250,
          phase: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.35 + 0.15
        });
      }
    }

    const t0 = performance.now();

    function render(now) {
      ctx.clearRect(0, 0, W, H);
      const t = (now - t0) / 1000;

      // ❄️ SNOW — soft drifting flakes
      if (type === 'snow') {
        particles.forEach(p => {
          p.y += p.vy;
          p.x += Math.sin(t * 0.5 + p.drift) * 0.4;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(255,255,255,0.5)';
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.y > H + 5) { p.y = -5; p.x = Math.random() * W; }
          if (p.x > W + 5) p.x = -5;
          if (p.x < -5) p.x = W + 5;
        });

      // ✨ STARS — gentle twinkling points
      } else if (type === 'stars') {
        particles.forEach(p => {
          const pulse = 0.3 + 0.7 * ((Math.sin(t * 1.5 + p.phase) + 1) / 2);

          ctx.save();
          ctx.globalAlpha = p.alpha * pulse;
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(255,255,255,0.6)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * (0.8 + pulse * 0.4), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

      // 🔥 FIREFLIES — warm floating orbs
      } else if (type === 'fireflies') {
        particles.forEach(p => {
          p.x += Math.sin(t * 0.7 + p.phaseX) * 0.5;
          p.y += Math.cos(t * 0.5 + p.phase) * 0.4 - 0.2;
          const glow = 0.3 + 0.7 * ((Math.sin(t * 2 + p.phase) + 1) / 2);

          ctx.save();
          ctx.globalAlpha = p.alpha * glow;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          grad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
          grad.addColorStop(0.5, 'rgba(251, 191, 36, 0.3)');
          grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
          if (p.x < -20) p.x = W + 20;
          if (p.x > W + 20) p.x = -20;
        });

      // 🌧️ RAIN — soft falling streaks
      } else if (type === 'rain') {
        particles.forEach(p => {
          p.y += p.vy;
          p.x += 0.8;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 1.5, p.y - p.len);
          ctx.stroke();
          ctx.restore();

          if (p.y > H + 20) { p.y = -25; p.x = Math.random() * W; }
        });

      // 💻 MATRIX — soft digital rain
      } else if (type === 'matrix') {
        particles.forEach(p => {
          p.y += p.vy;

          ctx.save();
          ctx.font = "14px 'JetBrains Mono', monospace";
          ctx.globalAlpha = p.alpha * 0.9;
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(34, 197, 94, 0.5)';
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.fillText(p.char, p.x, p.y);

          p.trail.unshift({ y: p.y, c: p.char });
          if (p.trail.length > 18) p.trail.pop();

          p.trail.forEach((tr, idx) => {
            const a = (1 - idx / p.trail.length) * 0.5 * p.alpha;
            ctx.globalAlpha = a;
            ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
            ctx.fillText(tr.c, p.x, tr.y);
          });

          ctx.restore();

          if (Math.random() < 0.06) {
            p.char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
          }
          if (p.y > H + 50) { p.y = Math.random() * -80; p.trail = []; }
        });

      // 🪐 COSMIC — drifting soft nebula orbs
      } else if (type === 'cosmic') {
        particles.forEach(p => {
          p.x += Math.cos(t * 0.4 + p.phase) * 0.5;
          p.y += Math.sin(t * 0.3 + p.phase) * 0.5;
          const a = 0.3 + 0.5 * ((Math.sin(t * 1.2 + p.phase) + 1) / 2);

          ctx.save();
          ctx.globalAlpha = p.alpha * a;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          grad.addColorStop(0, `hsla(${p.hue}, 80%, 65%, 0.8)`);
          grad.addColorStop(0.5, `hsla(${p.hue}, 70%, 55%, 0.25)`);
          grad.addColorStop(1, `hsla(${p.hue}, 60%, 45%, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.y < -25) p.y = H + 25;
          if (p.y > H + 25) p.y = -25;
          if (p.x < -25) p.x = W + 25;
          if (p.x > W + 25) p.x = -25;
        });
      }

      particleAnimationId = requestAnimationFrame(render);
    }

    particleAnimationId = requestAnimationFrame(render);
  }

  function sanitizeUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return '';
    const trimmed = urlStr.trim();
    if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
      return '#';
    }
    return trimmed;
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
