import { isSupabaseConfigured, supabase } from '@/lib/supabase';

function ensureSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error('Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file.');
  }
}

export async function loginWithEmail(email) {
  ensureSupabaseConfig();

  const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;

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
    return null;
  }

  const url = new URL(window.location.href);
  const authCode = url.searchParams.get('code');

  if (authCode) {
    const { error } = await supabase.auth.exchangeCodeForSession(authCode);

    if (error) throw error;

    window.history.replaceState({}, document.title, url.pathname);
  }

  return getCurrentUser();
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
