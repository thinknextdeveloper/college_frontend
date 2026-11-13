'use client';
import { useState } from 'react';
import Link from 'next/link';
import Background3D from '@/components/Background3D';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authslice';

const steps = [
  { title: 'Register', text: 'Create your account with your program details and verify your email with OTP.' },
  { title: 'Fill Application', text: 'Complete your personal, academic and course information step by step.' },
  { title: 'Upload Documents', text: 'Upload your photograph, signature, marksheets and ID proofs.' },
  { title: 'Track Status', text: 'Submit your application and track approval from your dashboard.' },
];

const layers = [
  { label: '1. Register', sub: 'Verify email with OTP', bg: 'bg-blue-400/20' },
  { label: '2. Apply', sub: 'Fill form & upload documents', bg: 'bg-indigo-300/25' },
  { label: '3. Approved', sub: 'Admission confirmed', bg: 'bg-emerald-300/30' },
];

const idle = { rx: 0, ry: 0, active: false };

// Card that leans toward the mouse and lifts off the page
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [t, setT] = useState(idle);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setT({ rx: (0.5 - y) * 14, ry: (x - 0.5) * 16, active: true });
  };

  return (
    <div
      className={className}
      style={{ perspective: 900 }}
      onMouseMove={onMove}
      onMouseLeave={() => setT(idle)}
    >
      <div
        className="preserve-3d h-full"
        style={{
          transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg) translateZ(${t.active ? 18 : 0}px)`,
          transition: t.active ? 'transform 80ms ease-out' : 'transform 500ms ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const dashboardHref = user?.role === 'Student' ? '/student/dashboard' : '/admin/dashboard';

  const handleLogout = () => {
    dispatch(logout());
  };

  const primaryBtn =
    'w-full rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-900 shadow-lg shadow-black/20 transition ' +
    'hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-xl active:translate-y-0 sm:w-auto';
  const outlineBtn =
    'w-full rounded-lg border border-white/50 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur transition ' +
    'hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 sm:w-auto';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero (navbar sits inside it so the 3D background shows behind everything) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white">
        <Background3D />

        {/* Navbar */}
        <header className="relative z-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold sm:text-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-xl shadow-inner">
                🎓
              </span>
              College Admissions
            </Link>
            <nav className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-900 transition hover:-translate-y-0.5 hover:bg-blue-50"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-900 transition hover:-translate-y-0.5 hover:bg-blue-50"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-16 lg:grid-cols-2">
          <div className="anim-card-in text-center lg:text-left">
            <p className="mb-3 inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100 backdrop-blur">
              Admissions Open
            </p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
              Apply for Admission Online
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-blue-100 sm:text-lg lg:mx-0">
              Register, fill in your application, upload documents and track your admission status, all
              from one place.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              {user ? (
                <>
                  <Link href={dashboardHref} className={primaryBtn}>
                    Go to Dashboard
                  </Link>
                  <button type="button" onClick={handleLogout} className={outlineBtn}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/register" className={primaryBtn}>
                    Register Now
                  </Link>
                  <Link href="/login" className={outlineBtn}>
                    Already Registered? Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Floating 3D card stack (desktop only) */}
          <div className="relative hidden h-96 lg:block" style={{ perspective: 1200 }} aria-hidden>
            <div className="anim-float absolute inset-0">
              <div
                className="preserve-3d absolute inset-0"
                style={{ transform: 'rotateX(58deg) rotateZ(-38deg)' }}
              >
                {layers.map((l, i) => (
                  <div
                    key={l.label}
                    className={`absolute left-1/2 top-1/2 h-40 w-64 rounded-2xl border border-white/30 p-5 shadow-2xl shadow-black/30 backdrop-blur ${l.bg}`}
                    style={{ transform: `translate(-50%, -50%) translateZ(${i * 70}px)` }}
                  >
                    <p className="text-lg font-bold">{l.label}</p>
                    <p className="mt-1 text-sm text-blue-100">{l.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">How to Apply</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <TiltCard key={s.title}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-shadow hover:shadow-xl">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-blue-600 text-base font-bold text-white shadow-md">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.text}</p>
              </div>
            </TiltCard>
          ))}
        </div>

        {!user && (
          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-block rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            >
              Start Your Application
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-5 text-center text-sm text-slate-500">
        &copy; 2026 RITM Admissions. All rights reserved.
      </footer>
    </div>
  );
}