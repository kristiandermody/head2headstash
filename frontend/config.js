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
