'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppIcon from '@/components/AppIcon';
import { updateCurrentUserProfile } from '@/lib/auth';
import { useCurrentUser } from '@/lib/useCurrentUser';

function getDisplayName(user) {
  const metadata = user?.user_metadata || {};
  return metadata.full_name || metadata.name || user?.email?.split('@')[0] || '';
}

function getInitials(user, fallbackName = '') {
  const source = fallbackName || getDisplayName(user) || 'M';
  const parts = source.trim().split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
  }

  return source.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'M';
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read that image.'));
    reader.readAsDataURL(file);
  });
}

async function resizeImageToDataUrl(file) {
  const sourceUrl = await readFileAsDataUrl(file);

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const size = 256;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Unable to prepare that image.'));
        return;
      }

      canvas.width = size;
      canvas.height = size;

      const scale = Math.max(size / image.width, size / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      const x = (size - width) / 2;
      const y = (size - height) / 2;

      context.drawImage(image, x, y, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };

    image.onerror = () => reject(new Error('Unable to process that image.'));
    image.src = sourceUrl;
  });
}

export default function ProfileEditorPanel() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { currentUser, isLoading } = useCurrentUser();
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    setFullName(getDisplayName(currentUser));
    setAvatarUrl(currentUser?.user_metadata?.avatar_url || '');
  }, [currentUser]);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.');
      event.target.value = '';
      return;
    }

    setIsWorking(true);
    setMessage('Preparing your profile picture...');

    try {
      const nextAvatarUrl = await resizeImageToDataUrl(file);
      setAvatarUrl(nextAvatarUrl);
      setMessage('Profile picture ready to save.');
    } catch (error) {
      setMessage(error.message || 'Unable to prepare that image.');
    } finally {
      setIsWorking(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsWorking(true);
    setMessage('Saving your profile...');

    try {
      await updateCurrentUserProfile({
        fullName,
        avatarUrl,
      });
      setMessage('Profile updated successfully.');
      router.push('/profile');
      router.refresh();
    } catch (error) {
      setMessage(error.message || 'Unable to update your profile.');
    } finally {
      setIsWorking(false);
    }
  }

  function removePhoto() {
    setAvatarUrl('');
    setMessage('Profile picture removed. Save to apply this change.');
  }

  if (isLoading) {
    return (
      <section className="mt-6 rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Loading...</h1>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
      <h1 className="inline-flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
        <AppIcon name="settings" className="h-7 w-7 text-emerald-600" />
        Edit Profile
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Update the name shown across SalahTrack and choose a profile picture for your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 dark:border-slate-700 dark:bg-slate-800/80">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Profile Photo</p>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile preview"
                className="h-24 w-24 rounded-full border border-emerald-100 object-cover shadow-sm dark:border-slate-700"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-3xl font-bold text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                {getInitials(currentUser, fullName)}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isWorking}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <AppIcon name="check" className="h-4 w-4" />
                Upload Photo
              </button>
              <button
                type="button"
                onClick={removePhoto}
                disabled={isWorking || !avatarUrl}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300"
              >
                <AppIcon name="qaza" className="h-4 w-4" />
                Remove Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Images are resized for a clean avatar before saving.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 dark:border-slate-700 dark:bg-slate-800/80">
          <label htmlFor="full-name" className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Username
          </label>
          <input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter your name"
            disabled={isWorking}
            className="mt-4 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-500 dark:focus:ring-emerald-900/40"
          />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
            This will appear in the header and on your profile.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isWorking}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-none sm:flex-1"
          >
            <AppIcon name="check" />
            Save Changes
          </button>
          <Link
            href="/profile"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 sm:flex-1"
          >
            <AppIcon name="calendar" />
            Back to Profile
          </Link>
        </div>
      </form>

      <p className="mt-6 min-h-[24px] text-sm font-medium text-slate-500 dark:text-slate-300">{message}</p>
    </section>
  );
}
