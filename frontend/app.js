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
console.log('📄 App.js loaded');
