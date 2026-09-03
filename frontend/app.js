async function initApp() {
  console.log('🚀 Initializing app...');
  const waitForSupabase = setInterval(() => {
    if (window.supabaseClient && window.supabaseHelpers) {
      clearInterval(waitForSupabase);
      updateNavBar();
      if (typeof pageInit === 'function') {
        pageInit();
      }
      console.log('✅ App initialized');
    }
  }, 100);
}

async function updateNavBar() {
  const user = await window.supabaseHelpers.getCurrentUser();
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;
  
  if (user) {
    const profile = await window.supabaseHelpers.getCurrentJudgeProfile();
    const username = profile?.username || user.email;
    navAuth.innerHTML = `
      <a href="/pages/profile.html?username=${username}" class="nav-link">@${username}</a>
      <button onclick="logout()" class="nav-link nav-btn-logout">Sign Out</button>
    `;
  } else {
    navAuth.innerHTML = `<a href="/pages/auth/login.html" class="nav-link nav-btn-signin">Sign In</a>`;
  }
}

async function logout() {
  await window.supabaseClient.auth.signOut();
  window.location.href = '/index.html';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

window.logout = logout;

/* ---------- Shared helpers ---------- */

window.H2H = (function () {
  const LOCAL_PRODUCT_IMAGES = {
    'Kush Mountains': 'kush-mountains-nug.avif',
    'Tropicanna Fury': 'tropicanna-fury.avif',
  };

  function assetRoot() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const pagesIndex = segments.indexOf('pages');
    if (pagesIndex === -1) return 'assets/';
    const depth = segments.length - pagesIndex - 1;
    return '../'.repeat(depth) + 'assets/';
  }

  function productImage(product) {
    const file = LOCAL_PRODUCT_IMAGES[product?.name];
    return file ? assetRoot() + file : (product?.image_url || '');
  }

  function toLocalDate(iso) {
    // Date-only strings (e.g. "2026-08-12") are UTC midnight per the spec, which
    // shifts a day earlier in any timezone behind UTC — parse those as local instead.
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(iso);
  }

  function fmtDate(iso) {
    if (!iso) return '';
    return toLocalDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function fmtDateLong(iso) {
    if (!iso) return '';
    return toLocalDate(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function daysUntil(iso) {
    if (!iso) return null;
    const ms = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86400000));
  }

  function initials(name) {
    if (!name) return '?';
    return name.replace(/^@/, '').slice(0, 2).toUpperCase();
  }

  function battleLabel(battleNumber) {
    return `Smoke-Off #${String(battleNumber).padStart(3, '0')}`;
  }

  async function ensureJudgeProfile() {
    const raw = localStorage.getItem('h2h-pending-profile');
    if (!raw) return null;
    let draft;
    try { draft = JSON.parse(raw); } catch { localStorage.removeItem('h2h-pending-profile'); return null; }

    const user = await window.supabaseHelpers.getCurrentUser();
    if (!user || user.id !== draft.user_id) return null;

    const existing = await window.supabaseHelpers.getCurrentJudgeProfile();
    if (existing) { localStorage.removeItem('h2h-pending-profile'); return existing; }

    const { data, error } = await window.supabaseClient.from('judge_profiles').insert([draft]).select().single();
    if (error) { console.error('ensureJudgeProfile', error); return null; }
    localStorage.removeItem('h2h-pending-profile');
    return data;
  }

  async function renderAppHeaderAuth(targetId) {
    const el = document.getElementById(targetId || 'app-nav-auth');
    if (!el) return;
    const user = await window.supabaseHelpers.getCurrentUser();
    if (!user) {
      window.supabaseHelpers.requireAuth();
      return;
    }
    const profile = await window.supabaseHelpers.getCurrentJudgeProfile();
    const username = profile?.username || user.email;
    el.innerHTML = `<span class="avatar-circle" title="@${username}">${initials(username)}</span>`;
  }

  const SCORE_CATEGORIES = ['appearance', 'aroma', 'cure', 'flavor', 'smoke', 'effects'];

  function avgScore(scoreRow) {
    const vals = SCORE_CATEGORIES.map(c => scoreRow[c]).filter(v => v != null);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  function categoryAverages(scoreRows) {
    return SCORE_CATEGORIES.map(cat => {
      const vals = scoreRows.map(s => s[cat]).filter(v => v != null);
      return { category: cat, average: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null };
    }).filter(a => a.average != null);
  }

  return {
    productImage, fmtDate, fmtDateLong, daysUntil, initials, battleLabel, renderAppHeaderAuth,
    SCORE_CATEGORIES, avgScore, categoryAverages, ensureJudgeProfile,
  };
})();

console.log('📄 App.js loaded');
