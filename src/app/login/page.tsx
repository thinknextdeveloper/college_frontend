'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearError } from '@/store/slices/authslice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, error } = useAppSelector((s) => s.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState(false);

  // Auto redirect if logged in
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

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      return setLocalError('Please enter your Mobile No or Email');
    }
    if (!password) {
      return setLocalError('Please enter your password');
    }

    setSubmitting(true);
    await dispatch(login({ identifier: trimmedUser, password }));
    setSubmitting(false);
  };

  const handleFillTestStudent = () => {
    setUsername('9876543210');
    setPassword('Student@123');
    setLocalError(null);
  };

  const message = localError || error;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans">
      {/* LEFT SECTION: Campus Hero & Admissions Branding */}
      <div className="relative w-full lg:w-[58%] xl:w-[62%] min-h-[460px] lg:min-h-screen bg-slate-900 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden text-white shadow-2xl">
        {/* Background Campus Photo with Deep Architectural Blue Gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity scale-105 transform transition duration-1000"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/85 to-slate-900/90" />

        {/* Top Header & Program Category Badges */}
        <div className="relative z-10 pt-2 sm:pt-4">
          <div className="inline-block rounded-md bg-amber-400/20 border border-amber-300/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-sm mb-4 shadow-sm">
            Demo Institute of Technology & Management
          </div>
          <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight uppercase leading-none drop-shadow-md text-white">
            Admissions <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-amber-200">
              Open 2026-27
            </span>
          </h1>
          <p className="mt-3.5 text-xs sm:text-sm md:text-base font-bold italic tracking-wide text-sky-200 drop-shadow">
            DIPLOMA / ENGINEERING / MANAGEMENT / COMPUTER APPLICATIONS
          </p>
        </div>

        {/* Center Circular Badge & Campus Seal */}
        <div className="relative z-10 my-8 flex items-center justify-start gap-6">
          <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-green-400 p-1.5 shadow-2xl shadow-green-500/40 animate-pulse">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full border-2 border-dashed border-white/80 bg-emerald-700 text-center text-white">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-emerald-100">
                Apply
              </span>
              <span className="text-sm sm:text-base font-black uppercase text-white">Now</span>
              <span className="text-[9px] text-emerald-200">2026-27</span>
            </div>
          </div>

          <div className="hidden sm:block">
            <p className="text-xs uppercase tracking-widest font-bold text-sky-300">Fast Track Online Admission Portal</p>
            <p className="text-xs sm:text-sm font-medium text-slate-200 max-w-sm mt-1 leading-relaxed">
              Register your online application, upload required documents and check seat allotment status in real time.
            </p>
          </div>
        </div>

        {/* Affiliations & Approvals Box */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex flex-wrap items-center gap-3 rounded-xl bg-white/10 p-3 sm:p-4 backdrop-blur-md border border-white/15 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-500/25 border border-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-300">
                AICTE
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-500/25 border border-sky-400 flex items-center justify-center text-[10px] font-bold text-sky-200">
                NAAC
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-500/25 border border-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                UGC
              </div>
            </div>
            <div className="border-l border-white/20 pl-3">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-100">
                Affiliations & Approvals
              </span>
              <span className="block text-[10px] text-slate-300">Approved by AICTE, New Delhi & Affiliated to State Technical Board</span>
            </div>
          </div>

          {/* Bottom Contact Numbers & Web Footer */}
          <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-y-2 text-xs font-semibold text-slate-300">
            <div>
              <span>Phone: </span>
              <span className="text-white font-bold">+91 98765 43210</span>
              <span className="mx-2 text-white/40">|</span>
              <span className="text-white font-bold">011-23456789</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="mailto:admissions@democollege.edu" className="hover:text-white transition">
                admissions@democollege.edu
              </a>
              <span className="text-white/40">|</span>
              <span className="uppercase tracking-wider text-amber-300 font-bold">WWW.DEMOCOLLEGE.EDU</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Login Form Portal */}
      <div className="w-full lg:w-[42%] xl:w-[38%] bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 shadow-xl">
        <div className="my-auto w-full max-w-md mx-auto">
          {/* Demo Brand Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2.5 mb-2.5">
              {/* Mosaic Dots Icon */}
              <div className="grid grid-cols-3 gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-lime-500" />
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-800" />
              </div>
              <span className="text-4xl font-extrabold tracking-tight text-blue-900">
                DEM<span className="text-sky-600">O</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-red-800 tracking-tight">
              Welcome to Demo Registration Portal
            </h2>
            <p className="mt-1 text-xs text-slate-500">Sign in with your registered Mobile Number or Email</p>
          </div>

          {/* Test Student Quick Fill Hint Card */}
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 flex items-center justify-between gap-2 shadow-sm">
            <div>
              <span className="font-bold text-blue-950">Test Account: </span>
              <span className="font-mono">9876543210</span> / <span className="font-mono">Student@123</span>
            </div>
            <button
              type="button"
              onClick={handleFillTestStudent}
              className="rounded bg-blue-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-800 transition active:scale-95"
            >
              Fill Credentials
            </button>
          </div>

          {/* Error Alert */}
          {message && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-start gap-2"
            >
              <svg className="h-4 w-4 shrink-0 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{message}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                User Name<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Mobile No*"
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition disabled:bg-slate-100"
                disabled={submitting}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password<span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password*"
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition disabled:bg-slate-100"
                  disabled={submitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-blue-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Actions Row: Back, Forget Password, Submit */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-[#17a2b8] hover:bg-[#138496] px-5 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-sm"
              >
                Back
              </Link>

              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs font-semibold text-slate-600 hover:text-red-800 transition underline underline-offset-2"
              >
                Forget Password?
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-md bg-[#007bff] hover:bg-[#0069d9] px-6 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Checking...' : 'Submit'}
              </button>
            </div>

            {/* New student register link */}
            <div className="pt-4 text-center border-t border-slate-200">
              <p className="text-xs text-slate-600">
                New candidate?{' '}
                <Link href="/register" className="font-bold text-blue-900 hover:underline">
                  Register for Admission here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center pt-8 text-[11px] text-slate-500">
          <p>© 2026 Demo Portal. All Rights Reserved</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Forgot Password?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To reset your portal password, please contact the admission helpline at{' '}
              <span className="font-bold text-blue-900">+91 98765 43210</span> or write to{' '}
              <span className="font-bold text-blue-900">admissions@democollege.edu</span> with your registered Mobile Number.
            </p>
            <button
              type="button"
              onClick={() => setForgotModal(false)}
              className="w-full rounded-md bg-blue-900 py-2 text-xs font-bold text-white hover:bg-blue-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
