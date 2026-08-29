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

    // Document Title & Identity
    document.title = `${settings.display_name || 'Alpay'} | alpay.fun`;

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
      renderLinks(links);
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

    // 11. Particle Canvas Engine (Snow, Stars, Fireflies, Rain)
    initParticles(settings.particles_effect || 'none');

    // 12. Interactive Cursor Trail
    if (String(settings.cursor_trail) === '1' || settings.cursor_trail === true) {
      initCursorGlow();
    } else {
      const cursor = document.getElementById('cursor-glow');
      if (cursor) cursor.style.display = 'none';
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

  // --- Render Social & Custom Links ---
  function renderLinks(links) {
    const socialBar = document.getElementById('social-links-bar');
    const customContainer = document.getElementById('custom-links-container');
    if (socialBar) socialBar.innerHTML = '';
    if (customContainer) customContainer.innerHTML = '';

    const socialLinks = links.filter(l => l.is_social === 1);
    const customLinks = links.filter(l => l.is_social === 0);

    if (socialBar) {
      socialLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'social-icon-link';
        a.title = link.title;
        if (link.glow_color) {
          a.style.setProperty('--icon-glow', link.glow_color);
        }

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
        card.href = link.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'custom-link-card';
        if (link.glow_color) {
          card.style.setProperty('--link-glow', link.glow_color);
        }

        let iconHtml = '';
        if (link.icon_type === 'custom_image' && link.icon_value) {
          iconHtml = `<img src="${link.icon_value}" alt="${escapeHtml(link.title)}">`;
        } else {
          const iconClass = ICON_MAP[link.icon_value] || 'fa-solid fa-arrow-up-right-from-square';
          iconHtml = `<i class="${iconClass}"></i>`;
        }

        card.innerHTML = `
          <div class="custom-link-left">
            <div class="custom-link-icon-box">
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

  function trackClick(linkId) {
    if (!linkId) return;
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
      bgAudio.volume = volSlider ? parseFloat(volSlider.value) : 0.7;

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

  // --- Interactive Cursor Glow ---
  function initCursorGlow() {
    const cursor = document.getElementById('cursor-glow');
    if (!cursor) return;
    cursor.style.display = 'block';

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    });

    function animateCursor() {
      currentX += (mouseX - currentX) * 0.2;
      currentY += (mouseY - currentY) * 0.2;
      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  // --- Particle Canvas Engine ---
  let particleAnimationId = null;
  function initParticles(type) {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    if (particleAnimationId) {
      cancelAnimationFrame(particleAnimationId);
      particleAnimationId = null;
    }

    if (!type || type === 'none') {
      canvas.style.display = 'none';
      return;
    }

    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = type === 'rain' ? 100 : (type === 'stars' ? 130 : 65);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: type === 'stars' ? Math.random() * 1.8 + 0.6 : (type === 'fireflies' ? Math.random() * 2.8 + 1.2 : Math.random() * 2.8 + 0.8),
        speedX: type === 'rain' ? 0 : (Math.random() - 0.5) * 0.8,
        speedY: type === 'rain' ? Math.random() * 8 + 5 : (type === 'snow' ? Math.random() * 1.6 + 0.5 : (Math.random() - 0.5) * 0.7),
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.04 + 0.015
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        ctx.beginPath();
        if (type === 'rain') {
          ctx.strokeStyle = `rgba(200, 230, 255, ${p.alpha * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + 16);
          ctx.stroke();
        } else if (type === 'stars') {
          p.alpha += Math.sin(Date.now() * p.twinkleSpeed) * 0.02;
          p.alpha = Math.max(0.15, Math.min(0.95, p.alpha));
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === 'fireflies') {
          ctx.fillStyle = `rgba(250, 204, 21, ${p.alpha})`;
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#facc15';
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Default Snow
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.9})`;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y > height) { p.y = -12; p.x = Math.random() * width; }
        if (p.y < -12) { p.y = height + 6; p.x = Math.random() * width; }
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;
      });

      particleAnimationId = requestAnimationFrame(renderParticles);
    }

    renderParticles();
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
