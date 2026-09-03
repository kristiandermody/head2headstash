const SUPABASE_URL = 'https://qxmykajwohzdysotuuuy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bXlrYWp3b2h6ZHlzb3R1dXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzODcxNDksImV4cCI6MjEwMzk2MzE0OX0.NbKZk7QyCPghwcVMAfYHFyvV84U4YYoW75tubIB1Yxw';

// Create Supabase client only if it doesn't exist
if (!window.supabase) {
  console.error('Supabase library not loaded');
} else {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function getCurrentUser() {
  const { data: { user } } = await window.supabaseClient.auth.getUser();
  return user;
}

async function getCurrentJudgeProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await window.supabaseClient
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
