'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Background3D from '@/components/Background3D';
import { useAppDispatch, useAppSelector } from './../../../store/hooks';
import { restoreSession } from '../../../store/slices/authslice';
import {
  fetchProgramTypes,
  fetchPrograms,
  fetchSpecializations,
  sendOtp,
  verifyOtp,
  registerStudent,
  clearPrograms,
  clearSpecializations,
  resetOtp,
  setFeedback,
  resetRegister,
} from '../../../store/slices/registerSlice';

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRx = /^[6-9]\d{9}$/;

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition ' +
  'focus:border-blue-800 focus:ring-2 focus:ring-blue-800/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

const btnCls =
  'whitespace-nowrap rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition ' +
  'hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

const ghostBtnCls =
  'whitespace-nowrap rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-900 transition ' +
  'hover:-translate-y-0.5 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

function Field({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

const emptyForm = {
  programTypeId: '',
  programId: '',
  specializationId: '',
  candidateName: '',
  email: '',
  otp: '',
  mobile: '',
  password: '',
  confirmPassword: '',
};

const idleTilt = { rx: 0, ry: 0, mx: 50, my: 50, active: false };

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { programTypes, programs, specializations, otpSent, otpVerified, registered, loading, feedback } =
    useAppSelector((s) => s.register);

  const [form, setForm] = useState(emptyForm);
  const [cooldown, setCooldown] = useState(0);
  const [tilt, setTilt] = useState(idleTilt);

  const update = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // load program types once; clear state when leaving the page
  useEffect(() => {
    dispatch(fetchProgramTypes());
    return () => {
      dispatch(resetRegister());
    };
  }, [dispatch]);

  // resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onTypeChange = (v: string) => {
    setForm((f) => ({ ...f, programTypeId: v, programId: '', specializationId: '' }));
    dispatch(clearPrograms());
    if (v) dispatch(fetchPrograms(v));
  };

  const onProgramChange = (v: string) => {
    setForm((f) => ({ ...f, programId: v, specializationId: '' }));
    dispatch(clearSpecializations());
    if (v) dispatch(fetchSpecializations(v));
  };

  const onEmailChange = (v: string) => {
    update('email', v);
    if (otpSent && !otpVerified) {
      dispatch(resetOtp());
      update('otp', '');
    }
  };

  const handleSendOtp = async () => {
    if (!emailRx.test(form.email)) {
      dispatch(setFeedback({ type: 'error', text: 'Enter a valid email address' }));
      return;
    }
    const res = await dispatch(sendOtp(form.email.trim()));
    if (sendOtp.fulfilled.match(res)) setCooldown(60);
  };

  const handleVerifyOtp = () => {
    if (!/^\d{6}$/.test(form.otp)) {
      dispatch(setFeedback({ type: 'error', text: 'Enter the 6-digit OTP' }));
      return;
    }
    dispatch(verifyOtp({ email: form.email.trim(), otp: form.otp }));
  };

  const validate = (): string | null => {
    if (!form.programTypeId) return 'Select a program type';
    if (!form.programId) return 'Select a program name';
    if (specializations.length && !form.specializationId) return 'Select a specialization';
    if (form.candidateName.trim().length < 3) return 'Enter the candidate name';
    if (!emailRx.test(form.email)) return 'Enter a valid email address';
    if (!otpVerified) return 'Verify your email with OTP first';
    if (!mobileRx.test(form.mobile)) return 'Enter a valid 10-digit mobile number';
    if (
      form.password.length < 8 ||
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/\d/.test(form.password)
    )
      return 'Password needs 8+ characters with an uppercase letter, a lowercase letter and a number';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      dispatch(setFeedback({ type: 'error', text: problem }));
      return;
    }
    const res = await dispatch(
      registerStudent({
        programId: form.programId,
        specializationId: form.specializationId || null,
        candidateName: form.candidateName.trim(),
        email: form.email.trim(),
        mobile: form.mobile,
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
    );
    if (registerStudent.fulfilled.match(res)) {
      // backend already set the session cookie: load the user and open the dashboard
      const session = await dispatch(restoreSession());
      router.replace(restoreSession.fulfilled.match(session) ? '/student/dashboard' : '/login');
    }
  };

  // 3D tilt (subtle, because this card is large)
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ rx: (0.5 - y) * 4, ry: (x - 0.5) * 6, mx: x * 100, my: y * 100, active: true });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 px-4 pb-8 pt-20 sm:pt-8">
      <Background3D />

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
        className="anim-card-in relative z-10 w-full max-w-3xl"
        style={{ perspective: 1400 }}
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
                background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.28), transparent 45%)`,
              }}
            />

            <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-5 py-5 text-white sm:px-8 sm:py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl shadow-inner">
                  🎓
                </div>
                <div>
                  <h1 className="text-xl font-bold sm:text-2xl">Student Registration Portal</h1>
                  <p className="text-sm text-blue-100">Create your account to apply for admission</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="px-5 py-6 sm:px-8 sm:py-8">
              {feedback && (
                <div
                  role="alert"
                  className={`mb-5 rounded-lg px-4 py-3 text-sm ${
                    feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Field label="Program Type *">
                  <select className={inputCls} value={form.programTypeId} onChange={(e) => onTypeChange(e.target.value)}>
                    <option value="">Select</option>
                    {programTypes.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Program Name *">
                  <select
                    className={inputCls}
                    value={form.programId}
                    onChange={(e) => onProgramChange(e.target.value)}
                    disabled={!programs.length}
                  >
                    <option value="">Select</option>
                    {programs.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={`Specialization ${specializations.length ? '*' : ''}`} className="md:col-span-2">
                  <select
                    className={inputCls}
                    value={form.specializationId}
                    onChange={(e) => update('specializationId', e.target.value)}
                    disabled={!specializations.length}
                  >
                    <option value="">{form.programId && !specializations.length ? 'Not applicable' : 'Select'}</option>
                    {specializations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Candidate Name *" className="md:col-span-2">
                  <input
                    className={inputCls}
                    value={form.candidateName}
                    onChange={(e) => update('candidateName', e.target.value)}
                    placeholder="As per 10th marksheet"
                  />
                </Field>

                <Field label="Email Address *" className="md:col-span-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      className={inputCls}
                      value={form.email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      disabled={otpVerified}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    <button
                      type="button"
                      className={ghostBtnCls}
                      onClick={handleSendOtp}
                      disabled={otpVerified || loading.otp || cooldown > 0}
                    >
                      {loading.otp
                        ? 'Sending...'
                        : cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : otpSent
                            ? 'Resend OTP'
                            : 'Send OTP'}
                    </button>
                  </div>
                </Field>

                {otpSent && (
                  <Field label="Enter OTP *" className="md:col-span-2">
                    <div className="flex gap-2">
                      <input
                        className={inputCls}
                        value={form.otp}
                        onChange={(e) => update('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        inputMode="numeric"
                        maxLength={6}
                        disabled={otpVerified}
                        placeholder="6-digit OTP"
                      />
                      <button
                        type="button"
                        className={btnCls}
                        onClick={handleVerifyOtp}
                        disabled={otpVerified || loading.verify}
                      >
                        {loading.verify ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    {otpVerified && <p className="mt-1.5 text-xs font-semibold text-green-700">✓ Email verified</p>}
                  </Field>
                )}

                <Field label="Mobile Number *" className="md:col-span-2">
                  <input
                    className={inputCls}
                    value={form.mobile}
                    onChange={(e) => update('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                  />
                </Field>

                <Field label="Password *">
                  <input
                    type="password"
                    className={inputCls}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>

                <Field label="Confirm Password *">
                  <input
                    type="password"
                    className={inputCls}
                    value={form.confirmPassword}
                    onChange={(e) => update('confirmPassword', e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              <button
                type="submit"
                className={`${btnCls} mt-6 flex w-full items-center justify-center gap-2 py-3 text-base`}
                disabled={loading.submit || registered}
              >
                {(loading.submit || registered) && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {loading.submit || registered ? 'Registering...' : 'Register'}
              </button>

              <p className="mt-5 text-center text-sm text-slate-600">
                Already registered?{' '}
                <Link href="/login" className="font-semibold text-blue-900 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}