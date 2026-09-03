#!/bin/bash

set -e

echo "🚀 Setting up head2headstash project..."

# Create folder structure
echo "📁 Creating folder structure..."
mkdir -p frontend/css
mkdir -p frontend/js
mkdir -p frontend/pages/auth
mkdir -p database
mkdir -p n8n
mkdir -p docs

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
.env
.env.local
.env.*.local
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*.swo
node_modules/
package-lock.json
dist/
build/
*.log
EOF

# Create .env.example
echo "📝 Creating frontend/.env.example..."
cat > frontend/.env.example << 'EOF'
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
EOF

# Create README.md
echo "📝 Creating README.md..."
cat > README.md << 'EOF'
# HEAD2HEADSTASH

Cannabis flower judging platform.

## Setup
1. Copy .env: cp frontend/.env.example frontend/.env.local
2. Add Supabase keys to frontend/.env.local
3. Push to GitHub

## Deployment
- Cloudflare Pages auto-deploys on git push
EOF

# Create config.js
echo "📝 Creating frontend/config.js..."
cat > frontend/config.js << 'EOF'
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabase;

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getCurrentJudgeProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('judge_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  return error ? null : data;
}

async function isLoggedIn() {
  const user = await getCurrentUser();
  return !!user;
}

async function requireAuth() {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
}

window.supabaseHelpers = { getCurrentUser, getCurrentJudgeProfile, isLoggedIn, requireAuth };
console.log('✅ Supabase client initialized');
EOF

# Create app.js
echo "📝 Creating frontend/app.js..."
cat > frontend/app.js << 'EOF'
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
EOF

# Create style.css (simplified for this message, full version available)
echo "📝 Creating frontend/style.css..."
cat > frontend/style.css << 'EOF'
:root {
  --color-primary: #c7ff00;
  --color-dark: #0f1f3f;
  --color-dark-lighter: #1a2f5f;
  --color-dark-lightest: #2a3f6f;
  --color-text: #ffffff;
  --color-text-muted: #8899bb;
  --color-border: #3a4f7f;
  --color-error: #ff6b6b;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --transition-fast: 150ms ease-in-out;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: var(--font-sans); background: var(--color-dark); color: var(--color-text); }
h1, h2, h3 { margin-bottom: var(--space-md); }
a { color: var(--color-primary); text-decoration: none; }

.btn { padding: var(--space-md) var(--space-lg); background: var(--color-primary); color: var(--color-dark); border: none; border-radius: var(--radius-md); cursor: pointer; font-weight: bold; }
.btn-secondary { background: transparent; border: 2px solid var(--color-primary); color: var(--color-primary); }
.btn-full { width: 100%; }

input, textarea { width: 100%; padding: var(--space-md); background: var(--color-dark-lighter); border: 1px solid var(--color-border); color: var(--color-text); border-radius: var(--radius-md); }
input::placeholder { color: var(--color-text-muted); }

.card { background: var(--color-dark-lightest); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); }

nav { background: var(--color-dark-lighter); border-bottom: 2px solid var(--color-primary); padding: var(--space-md) var(--space-lg); }
.nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.nav-logo { font-size: 24px; font-weight: bold; color: var(--color-primary); }

.alert { padding: var(--space-md) var(--space-lg); border-radius: var(--radius-md); margin-bottom: var(--space-lg); border-left: 4px solid; }
.alert-error { background: rgba(255, 107, 107, 0.1); border-left-color: var(--color-error); color: var(--color-error); }
.hidden { display: none; }
EOF

echo "✅ .gitignore created"
echo "✅ .env.example created"
echo "✅ README.md created"
echo "✅ config.js created"
echo "✅ app.js created"
echo "✅ style.css created"

# Initialize git
if [ ! -d .git ]; then
  git init
  echo "✅ Git repository initialized"
fi

git add .
git commit -m "Initial project structure: folders, config, styles, and env setup" || echo "ℹ️ Commit may already exist"

echo ""
echo "============================================================================"
echo "✅ SETUP COMPLETE!"
echo "============================================================================"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Create frontend/.env.local and add your Supabase credentials"
echo "2. Push to GitHub"
echo "3. Build auth pages (login/signup)"
echo ""
EOF