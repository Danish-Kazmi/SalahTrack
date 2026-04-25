'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppIcon from '@/components/AppIcon';
import {
  completeMagicLinkLogin,
  loginWithEmail,
  loginWithPassword,
  logout,
  registerWithPassword,
} from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useCurrentUser();
  const [mode, setMode] = useState('magic-link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('Enter your email to receive a magic login link.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasExchangedCodeRef = useRef(false);
  const nextPath = searchParams.get('next') || '/calendar';
  const hasMagicCode = searchParams.has('code');
  const shouldAutoRedirect = searchParams.has('next') || hasMagicCode;

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (!hasMagicCode || hasExchangedCodeRef.current) return;

    hasExchangedCodeRef.current = true;

    completeMagicLinkLogin().catch((error) => {
      setMessage(error.message || 'Unable to complete login. Please request a new magic link.');
    });
  }, [hasMagicCode]);

  useEffect(() => {
    if (currentUser?.email) {
      setMessage(`Signed in as ${currentUser.email}`);
    } else if (mode === 'magic-link') {
      setMessage('Enter your email to receive a magic login link.');
    } else if (mode === 'sign-in') {
      setMessage('Sign in with your email and password.');
    } else {
      setMessage('Create an account with your email and password.');
    }
  }, [currentUser, mode]);

  useEffect(() => {
    if (currentUser && shouldAutoRedirect) {
      router.replace(nextPath);
    }
  }, [currentUser, shouldAutoRedirect, nextPath, router]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (mode === 'register') {
      if (password.length < 6) {
        setMessage('Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        setMessage('Password confirmation does not match.');
        return;
      }
    }

    setIsSubmitting(true);
    setMessage(
      mode === 'magic-link'
        ? 'Sending magic link...'
        : mode === 'sign-in'
          ? 'Signing you in...'
          : 'Creating your account...'
    );

    try {
      if (mode === 'magic-link') {
        await loginWithEmail(email, nextPath);
        setMessage('Check your email for the login link.');
        setEmail('');
      } else if (mode === 'sign-in') {
        await loginWithPassword(email, password);
        setMessage('Signed in successfully.');
        setPassword('');
        setConfirmPassword('');
        router.replace(nextPath);
      } else {
        const user = await registerWithPassword(email, password, nextPath);

        if (user?.identities?.length === 0) {
          setMessage('This email is already registered. Try signing in instead.');
        } else if (user) {
          setMessage('Account created successfully.');
          setPassword('');
          setConfirmPassword('');
          router.replace(nextPath);
        } else {
          setMessage('Account created. If email confirmation is enabled, check your inbox before signing in.');
          setPassword('');
          setConfirmPassword('');
        }
      }
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
      setMessage('Signed out. Enter your email to receive a new magic link.');
      router.replace('/login');
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <section className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Supabase Setup</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">Login is not configured yet</h1>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` to enable Supabase sign in.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Email Login</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">Sign in to your tracker</h1>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{message}</p>

      {currentUser?.email ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="text-sm text-slate-600 dark:text-slate-300">Current account</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{currentUser.email}</p>
          <button
            type="button"
            onClick={() => router.replace(nextPath)}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
          >
            <AppIcon name="calendar" className="h-4 w-4" />
            Continue to Tracker
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="ml-3 mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-900"
          >
            <AppIcon name="settings" className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setMode('magic-link')}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                mode === 'magic-link'
                  ? 'bg-emerald-500 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              Magic Link
            </button>
            <button
              type="button"
              onClick={() => setMode('sign-in')}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                mode === 'sign-in'
                  ? 'bg-emerald-500 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                mode === 'register'
                  ? 'bg-emerald-500 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

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

          {mode !== 'magic-link' ? (
            <label className="block text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
              />
            </label>
          ) : null}

          {mode === 'register' ? (
            <label className="block text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
              />
            </label>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-none"
          >
            <AppIcon name="check" />
            {mode === 'magic-link'
              ? 'Send Magic Link'
              : mode === 'sign-in'
                ? 'Sign In with Password'
                : 'Create Account'}
          </button>
        </form>
      )}
    </section>
  );
}
