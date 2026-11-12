'use client';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';

const steps = [
  { title: 'Register', text: 'Create your account with your program details and verify your email with OTP.' },
  { title: 'Fill Application', text: 'Complete your personal, academic and course information step by step.' },
  { title: 'Upload Documents', text: 'Upload your photograph, signature, marksheets and ID proofs.' },
  { title: 'Track Status', text: 'Submit your application and track approval from your dashboard.' },
];

export default function HomePage() {
  const { user } = useAppSelector((s) => s.auth);
  const dashboardHref = user?.role === 'Student' ? '/student/dashboard' : '/admin/dashboard';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar */}
      <header className="bg-blue-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold sm:text-xl">
            RITM Admissions
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                href={dashboardHref}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-white/15">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-800">
            Admissions Open
          </p>
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Apply for Admission Online
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Register, fill in your application, upload documents and track your admission status, all
            from one place.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Link
                href={dashboardHref}
                className="w-full rounded-lg bg-blue-900 px-8 py-3 text-base font-semibold text-white shadow hover:bg-blue-800 sm:w-auto"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full rounded-lg bg-blue-900 px-8 py-3 text-base font-semibold text-white shadow hover:bg-blue-800 sm:w-auto"
                >
                  Register Now
                </Link>
                <Link
                  href="/login"
                  className="w-full rounded-lg border border-blue-900 bg-white px-8 py-3 text-base font-semibold text-blue-900 hover:bg-blue-50 sm:w-auto"
                >
                  Already Registered? Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">How to Apply</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-base font-bold text-white">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>

        {!user && (
          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-block rounded-lg bg-blue-900 px-8 py-3 text-base font-semibold text-white hover:bg-blue-800"
            >
              Start Your Application
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-5 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} RITM Admissions. All rights reserved.
      </footer>
    </div>
  );
}