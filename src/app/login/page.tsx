'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearError } from '@/store/slices/authslice';

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ' +
  'focus:border-blue-800 focus:ring-2 focus:ring-blue-800/30 disabled:cursor-not-allowed disabled:bg-slate-100';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // already logged in (or just logged in) -> go to the right dashboard
  useEffect(() => {
    if (!user) return;
    router.replace(user.role === 'Student' ? '/student/dashboard' : '/admin/dashboard');
  }, [user, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearError());

    if (!emailRx.test(email.trim())) return setLocalError('Enter a valid email address');
    if (!password) return setLocalError('Enter your password');

    setSubmitting(true);
    await dispatch(login({ email: email.trim(), password }));
    setSubmitting(false);
  };

  const message = localError || error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl shadow-blue-900/10">
        <div className="bg-blue-900 px-6 py-6 text-white sm:px-8">
          <h1 className="text-xl font-bold sm:text-2xl">Student Login</h1>
          <p className="mt-1 text-sm text-blue-100">Sign in to continue your admission</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 py-6 sm:px-8 sm:py-8">
          {message && (
            <div role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              disabled={submitting}
            />
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${inputCls} pr-16`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-900 hover:underline"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-900 py-3 text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            New student?{' '}
            <Link href="/register" className="font-semibold text-blue-900 hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}