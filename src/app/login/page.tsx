'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { login, clearError } from '../../../store/slices/authslice';

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition ' +
  'focus:border-blue-800 focus:ring-2 focus:ring-blue-800/30 disabled:cursor-not-allowed disabled:bg-slate-100';

// A rotating glass cube made from 6 faces
function Cube({ size, duration, className }: { size: number; duration: number; className: string }) {
  const half = size / 2;
  const faces = [
    `rotateY(0deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];
  return (
    <div
      aria-hidden
      className={`anim-float pointer-events-none absolute ${className}`}
      style={{ perspective: 800, animationDuration: `${duration + 4}s` }}
    >
      <div
        className="preserve-3d anim-spin-3d relative"
        style={{ width: size, height: size, animationDuration: `${duration}s` }}
      >
        {faces.map((t, i) => (
          <div key={i} className="absolute inset-0 border border-white/40 bg-white/10" style={{ transform: t }} />
        ))}
      </div>
    </div>
  );
}

const idleTilt = { rx: 0, ry: 0, mx: 50, my: 50, active: false };

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [tilt, setTilt] = useState(idleTilt);

  // already logged in (or just logged in) -> go to the right dashboard
  useEffect(() => {
    if (!user) return;
    router.replace(user.role === 'Student' ? '/dashboard' : '/admin/dashboard');
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

  // 3D tilt: the card leans toward the mouse
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ rx: (0.5 - y) * 10, ry: (x - 0.5) * 12, mx: x * 100, my: y * 100, active: true });
  };

  const message = localError || error;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 px-4 py-8">
      {/* glowing orbs */}
      <div className="anim-orb pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
      <div
        className="anim-orb pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl"
        style={{ animationDelay: '-5s' }}
      />

      {/* floating 3D cubes */}
      <Cube size={70} duration={16} className="left-[8%] top-[18%]" />
      <Cube size={46} duration={22} className="right-[10%] top-[12%]" />
      <Cube size={90} duration={26} className="bottom-[10%] left-[14%]" />
      <Cube size={54} duration={19} className="bottom-[16%] right-[12%]" />

      {/* Home button */}
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20 sm:left-8 sm:top-6"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v10h5v-6h4v6h5V10" />
        </svg>
        Home
      </Link>

      {/* card wrapper: entrance animation + mouse tracking */}
      <div
        className="anim-card-in relative z-10 w-full max-w-md"
        style={{ perspective: 1200 }}
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt(idleTilt)}
      >
        <div
          className="preserve-3d relative"
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transition: tilt.active ? 'transform 80ms ease-out' : 'transform 600ms ease-out',
          }}
        >
          {/* depth plate behind the card */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl bg-blue-300/25 blur-md"
            style={{ transform: 'translateZ(-40px) scale(0.97)' }}
          />

          <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/40">
            {/* moving light shine */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
              style={{
                opacity: tilt.active ? 1 : 0,
                background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.35), transparent 45%)`,
              }}
            />

            <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-6 text-white sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl shadow-inner">
                  🎓
                </div>
                <div>
                  <h1 className="text-xl font-bold sm:text-2xl">Student Login</h1>
                  <p className="text-sm text-blue-100">Sign in to continue your admission</p>
                </div>
              </div>
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
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 py-3 text-base font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
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
        </div>
      </div>
    </main>
  );
}