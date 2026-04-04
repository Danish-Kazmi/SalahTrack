'use client';

import { useEffect, useState } from 'react';
import AppIcon from '@/components/AppIcon';
import { completeMagicLinkLogin, loginWithEmail, logout } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function AuthPanel() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('Enter your email to receive a magic login link.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function syncUser() {
      try {
        const user = await completeMagicLinkLogin();

        if (!isMounted) return;

        setCurrentUser(user);
        setMessage(user?.email ? `Signed in as ${user.email}` : 'Enter your email to receive a magic login link.');
      } catch (error) {
        if (!isMounted) return;

        setCurrentUser(null);
        setMessage(error.message || 'Unable to complete login. Please request a new magic link.');
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      const user = session?.user || null;
      setCurrentUser(user);
      setMessage(user?.email ? `Signed in as ${user.email}` : 'Enter your email to receive a magic login link.');
    });

    syncUser();

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('Sending magic link...');

    try {
      await loginWithEmail(email);
      setMessage('Check your email for the login link.');
      setEmail('');
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsSubmitting(true);
    setMessage('Signing out...');

    try {
      await logout();
      setCurrentUser(null);
      setMessage('Signed out. Enter your email to receive a new magic link.');
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Email Login</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">Continue with a magic link</h1>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{message}</p>

      {currentUser?.email ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="text-sm text-slate-600 dark:text-slate-300">Current account</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{currentUser.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-900"
          >
            <AppIcon name="settings" className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-none"
          >
            <AppIcon name="check" />
            Continue with Email
          </button>
        </form>
      )}
    </section>
  );
}
