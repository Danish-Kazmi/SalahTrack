import { isSupabaseConfigured, supabase } from '@/lib/supabase';

function ensureSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error('Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file.');
  }
}

export function getLoginRedirectUrl(nextPath = '/calendar') {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const redirectUrl = new URL('/login', window.location.origin);
  redirectUrl.searchParams.set('next', nextPath);

  return redirectUrl.toString();
}

export async function loginWithEmail(email, nextPath) {
  ensureSupabaseConfig();

  const redirectUrl = getLoginRedirectUrl(nextPath);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) throw error;
}

export async function completeMagicLinkLogin() {
  if (!isSupabaseConfigured || typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  const authCode = url.searchParams.get('code');

  if (!authCode) return;

  const { error } = await supabase.auth.exchangeCodeForSession(authCode);

  if (error) throw error;

  window.history.replaceState({}, document.title, url.pathname);
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  return data.user;
}

export async function logout() {
  ensureSupabaseConfig();

  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function updateCurrentUserProfile({ fullName, avatarUrl }) {
  ensureSupabaseConfig();

  const metadata = {};

  if (typeof fullName === 'string') {
    metadata.full_name = fullName.trim();
  }

  if (typeof avatarUrl === 'string') {
    metadata.avatar_url = avatarUrl;
  }

  const { data, error } = await supabase.auth.updateUser({
    data: metadata,
  });

  if (error) throw error;

  return data.user;
}
