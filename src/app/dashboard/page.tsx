'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Background3D from '@/components/Background3D';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logout } from '../../../store/slices/authslice';
import {
  fetchOverview,
  startApplication,
  savePersonal,
  saveEducation,
  uploadPhoto,
  fetchPhoto,
  uploadDocument,
  removeDocument,
  fetchDocumentUrl,
  payFees,
  changePassword,
  clearFeedback,
  type DocItem,
  type EduRow,
  type Personal,
} from '../../../store/slices/studentSlice';

type Tab = 'dashboard' | 'application' | 'payments';

const STEPS = ['Personal Details', 'Education Details', 'Photo Upload', 'Documents', 'Fee & Payment'];
const GENDERS = ['Male', 'Female', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// ---------- shared styles (same blue palette as the home page) ----------
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition ' +
  'placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-700/20 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';
const primaryBtn =
  'rounded-xl bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 ' +
  'transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.99] ' +
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';
const smBtn =
  'rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-900/20 ' +
  'transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';
const outlineBtn =
  'rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50';
const cardCls = 'rounded-2xl bg-white shadow-xl shadow-black/20';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const fmtDate = (v: string | null) => (v ? new Date(v).toLocaleDateString('en-IN') : '-');

const statusStyle: Record<string, string> = {
  'Not Started': 'bg-slate-100 text-slate-700 border-slate-200',
  Draft: 'bg-amber-50 text-amber-700 border-amber-200',
  Submitted: 'bg-blue-50 text-blue-800 border-blue-200',
  'Under Review': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  Approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
};

// ---------- small UI pieces ----------
const ICONS: Record<string, string> = {
  grid: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
  document: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  card: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  lock: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  logout: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75',
  check: 'M4.5 12.75l6 6 9-13.5',
};

function Icon({ name, className = 'h-4 w-4' }: { name: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name]} />
    </svg>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-[11px] font-bold ${statusStyle[status] || statusStyle.Draft}`}>
      {status}
    </span>
  );
}

function Ring({ value }: { value: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 72 72" className="h-16 w-16 -rotate-90" aria-hidden>
      <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" className="stroke-slate-200" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        className="stroke-blue-700 transition-all duration-700"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
      />
    </svg>
  );
}

function Field({
  label,
  required,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold text-blue-950">
      <span className="h-4 w-1 rounded-full bg-gradient-to-b from-blue-700 to-indigo-500" />
      {children}
    </h3>
  );
}

// ---------- personal form ----------
const emptyPersonal = {
  firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: '', category: '', religion: '',
  nationality: 'Indian', aadhaar: '', fatherName: '', fatherMobile: '', motherName: '', addressLine: '',
  city: '', state: '', pincode: '', isPermanentSame: true, permanentAddress: '',
};
type PersonalForm = typeof emptyPersonal;

const fromPersonal = (p: Personal): PersonalForm => ({
  firstName: p.firstName, middleName: p.middleName ?? '', lastName: p.lastName ?? '',
  dateOfBirth: p.dateOfBirth, gender: p.gender, category: p.category, religion: p.religion ?? '',
  nationality: p.nationality, aadhaar: p.aadhaar ?? '', fatherName: p.fatherName, fatherMobile: p.fatherMobile,
  motherName: p.motherName, addressLine: p.addressLine, city: p.city, state: p.state, pincode: p.pincode,
  isPermanentSame: p.isPermanentSame, permanentAddress: p.permanentAddress ?? '',
});

function validatePersonal(p: PersonalForm): string | null {
  if (!p.firstName.trim()) return 'Enter your first name';
  if (!p.dateOfBirth) return 'Select your date of birth';
  if (!p.gender) return 'Select your gender';
  if (!p.category) return 'Select your category';
  if (p.aadhaar.replace(/\s/g, '') && !/^\d{12}$/.test(p.aadhaar.replace(/\s/g, ''))) return 'Aadhaar number must be 12 digits';
  if (p.fatherName.trim().length < 3) return "Enter your father's name";
  if (!/^[6-9]\d{9}$/.test(p.fatherMobile)) return "Enter a valid 10-digit father's mobile number";
  if (p.motherName.trim().length < 3) return "Enter your mother's name";
  if (p.addressLine.trim().length < 5) return 'Enter your address';
  if (!p.state) return 'Select your state';
  if (p.city.trim().length < 2) return 'Enter your city';
  if (!/^\d{6}$/.test(p.pincode)) return 'Enter a valid 6-digit PIN code';
  if (!p.isPermanentSame && p.permanentAddress.trim().length < 5) return 'Enter your permanent address';
  return null;
}

// ---------- education form ----------
type EduForm = { board: string; institute: string; stream: string; rollNo: string; passingYear: string; percentage: string };
const emptyEdu: EduForm = { board: '', institute: '', stream: '', rollNo: '', passingYear: '', percentage: '' };

const fromEdu = (r: EduRow | null): EduForm =>
  r
    ? {
        board: r.board, institute: r.institute, stream: r.stream ?? '', rollNo: r.rollNo ?? '',
        passingYear: String(r.passingYear), percentage: String(r.percentage),
      }
    : emptyEdu;

const toEdu = (v: EduForm) => ({
  board: v.board.trim(), institute: v.institute.trim(), stream: v.stream.trim(), rollNo: v.rollNo.trim(),
  passingYear: Number(v.passingYear), percentage: Number(v.percentage),
});

function checkEdu(v: EduForm, label: string, needStream: boolean): string | null {
  if (v.board.trim().length < 2) return `${label}: enter board / university`;
  if (v.institute.trim().length < 2) return `${label}: enter school / institute name`;
  if (needStream && !v.stream.trim()) return `${label}: enter your branch`;
  const y = Number(v.passingYear);
  if (!Number.isInteger(y) || y < 1990 || y > new Date().getFullYear()) return `${label}: enter a valid passing year`;
  const p = Number(v.percentage);
  if (v.percentage === '' || Number.isNaN(p) || p < 0 || p > 100) return `${label}: percentage must be between 0 and 100`;
  return null;
}

function EduBlock({
  title,
  value,
  onChange,
  streamLabel,
  boardLabel = 'Board',
  instituteLabel = 'School Name',
}: {
  title: string;
  value: EduForm;
  onChange: (v: EduForm) => void;
  streamLabel?: string;
  boardLabel?: string;
  instituteLabel?: string;
}) {
  const set = (k: keyof EduForm) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="space-y-4">
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label={boardLabel} required>
          <input className={inputCls} value={value.board} onChange={set('board')} placeholder="e.g. CBSE, BSEB" />
        </Field>
        <Field label={instituteLabel} required className="sm:col-span-2">
          <input className={inputCls} value={value.institute} onChange={set('institute')} />
        </Field>
        {streamLabel && (
          <Field label={streamLabel} required={streamLabel.includes('Branch')}>
            <input className={inputCls} value={value.stream} onChange={set('stream')} />
          </Field>
        )}
        <Field label="Roll Number">
          <input className={inputCls} value={value.rollNo} onChange={set('rollNo')} />
        </Field>
        <Field label="Passing Year" required>
          <input
            className={inputCls}
            inputMode="numeric"
            maxLength={4}
            value={value.passingYear}
            onChange={(e) => onChange({ ...value, passingYear: e.target.value.replace(/\D/g, '') })}
            placeholder="e.g. 2022"
          />
        </Field>
        <Field label="Percentage (%)" required>
          <input
            className={inputCls}
            inputMode="decimal"
            value={value.percentage}
            onChange={(e) => onChange({ ...value, percentage: e.target.value.replace(/[^\d.]/g, '') })}
            placeholder="e.g. 78.5"
          />
        </Field>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((s) => s.auth);
  const { overview, saving, photoUrl, feedback } = useAppSelector((s) => s.student);

  const [tab, setTab] = useState<Tab>('dashboard');
  const [step, setStep] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [personal, setPersonal] = useState<PersonalForm>(emptyPersonal);
  const [tenth, setTenth] = useState<EduForm>(emptyEdu);
  const [twelfth, setTwelfth] = useState<EduForm>(emptyEdu);
  const [hasDiploma, setHasDiploma] = useState(false);
  const [diploma, setDiploma] = useState<EduForm>(emptyEdu);
  const [initialized, setInitialized] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [docBusy, setDocBusy] = useState<string | null>(null);
  const [declared, setDeclared] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [pwOpen, setPwOpen] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  // auth guard + first load
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'Student') {
      router.replace('/');
      return;
    }
    dispatch(fetchOverview());
  }, [user, dispatch, router]);

  // fill the forms once from saved data (prefill name from registration)
  useEffect(() => {
    if (!overview || initialized) return;
    if (overview.personal) {
      setPersonal(fromPersonal(overview.personal));
    } else {
      const [first, ...rest] = overview.student.name.trim().split(/\s+/);
      setPersonal((p) => ({ ...p, firstName: first || '', lastName: rest.join(' ') }));
    }
    setTenth(fromEdu(overview.education.tenth));
    setTwelfth(fromEdu(overview.education.twelfth));
    setHasDiploma(!!overview.education.diploma);
    setDiploma(fromEdu(overview.education.diploma));
    setInitialized(true);
  }, [overview, initialized]);

  // load the saved photo whenever it changes
  const photoStamp = overview?.photo?.uploadedAt;
  useEffect(() => {
    if (photoStamp) dispatch(fetchPhoto());
  }, [photoStamp, dispatch]);

  // free the preview URL
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  if (!overview) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 px-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-blue-100">
          {!feedback?.text && <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {feedback?.text || 'Loading your dashboard...'}
        </div>
      </main>
    );
  }

  const { student, application, steps, fees, payments, progress } = overview;
  const locked = !overview.editable;
  const appStatus = application ? application.status : 'Not Started';
  const stepDone = [steps.personal, steps.education, steps.photo, steps.documents, steps.payment];
  const errorText = formError || (feedback?.type === 'error' ? feedback.text : null);
  const paidPayment = payments.find((p) => p.status === 'Paid');
  const programLabel = student.specialization ? `${student.program} (${student.specialization})` : student.program;
  const firstName = student.name.trim().split(/\s+/)[0];
  const docItems = overview.documents.items;
  const requiredDocs = docItems.filter((d) => d.required);
  const requiredDone = requiredDocs.filter((d) => d.uploaded).length;
  const titles: Record<Tab, string> = {
    dashboard: `Welcome back, ${firstName}!`,
    application: 'Application Form',
    payments: 'My Payments',
  };

  const resetMessages = () => {
    setFormError(null);
    setNotice(null);
    dispatch(clearFeedback());
  };

  const goTab = (t: Tab) => {
    resetMessages();
    setTab(t);
    setSidebarOpen(false);
  };

  const goStep = (i: number) => {
    resetMessages();
    setStep(i);
  };

  const openApplication = async () => {
    resetMessages();
    setSidebarOpen(false);
    if (!application) {
      const r = await dispatch(startApplication());
      if (startApplication.rejected.match(r)) {
        setTab('dashboard');
        return;
      }
    }
    setStep(!steps.personal ? 0 : !steps.education ? 1 : !steps.photo ? 2 : !steps.documents ? 3 : 4);
    setTab('application');
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/login');
  };

  // ---------- step actions ----------
  const submitPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    const problem = validatePersonal(personal);
    if (problem) return setFormError(problem);
    const r = await dispatch(savePersonal({ ...personal, aadhaar: personal.aadhaar.replace(/\s/g, '') }));
    if (savePersonal.fulfilled.match(r)) {
      setNotice('Personal details saved');
      setStep(1);
    }
  };

  const submitEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    const problem =
      checkEdu(tenth, '10th', false) ||
      checkEdu(twelfth, '12th', false) ||
      (hasDiploma ? checkEdu(diploma, 'Diploma', true) : null);
    if (problem) return setFormError(problem);
    const r = await dispatch(
      saveEducation({ tenth: toEdu(tenth), twelfth: toEdu(twelfth), diploma: hasDiploma ? toEdu(diploma) : null })
    );
    if (saveEducation.fulfilled.match(r)) {
      setNotice('Education details saved');
      setStep(2);
    }
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetMessages();
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const okType = ['image/jpeg', 'image/png'].includes(f.type) && /\.(jpe?g|png)$/i.test(f.name);
    if (!okType) return setFormError('Only JPG, JPEG or PNG images are allowed');
    if (f.size > 2 * 1024 * 1024) return setFormError('Photo must be 2 MB or smaller');
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const submitPhoto = async () => {
    if (!file) return;
    resetMessages();
    const r = await dispatch(uploadPhoto(file));
    if (uploadPhoto.fulfilled.match(r)) {
      setFile(null);
      setFilePreview(null);
      setNotice('Photo uploaded');
    }
  };

  // ---------- documents ----------
  const onPickDoc = async (item: DocItem, e: React.ChangeEvent<HTMLInputElement>) => {
    resetMessages();
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const imageOk = ['image/jpeg', 'image/png'].includes(f.type) && /\.(jpe?g|png)$/i.test(f.name);
    const pdfOk = item.allowPdf && f.type === 'application/pdf' && /\.pdf$/i.test(f.name);
    if (!imageOk && !pdfOk) {
      return setFormError(
        item.allowPdf ? 'Only PDF, JPG, JPEG or PNG files are allowed' : `${item.label} must be a JPG, JPEG or PNG image`
      );
    }
    if (f.size > 2 * 1024 * 1024) return setFormError('File must be 2 MB or smaller');

    setDocBusy(item.docType);
    const r = await dispatch(uploadDocument({ docType: item.docType, file: f }));
    setDocBusy(null);
    if (uploadDocument.fulfilled.match(r)) setNotice(`${item.label} uploaded`);
  };

  const viewDoc = async (item: DocItem) => {
    resetMessages();
    // open the tab first (inside the click) so the browser does not block it
    const w = window.open('', '_blank');
    const r = await dispatch(fetchDocumentUrl(item.docType));
    if (fetchDocumentUrl.fulfilled.match(r)) {
      const url = r.payload;
      if (w) w.location.href = url;
      else window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } else {
      w?.close();
      setFormError('Could not open the document');
    }
  };

  const removeDoc = async (item: DocItem) => {
    resetMessages();
    setDocBusy(item.docType);
    const r = await dispatch(removeDocument(item.docType));
    setDocBusy(null);
    if (removeDocument.fulfilled.match(r)) setNotice(`${item.label} removed`);
  };

  const submitPayment = async () => {
    resetMessages();
    if (!declared) return setFormError('Please accept the declaration');
    const r = await dispatch(payFees());
    if (payFees.fulfilled.match(r)) setNotice('Payment successful. Your application has been submitted.');
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (!pwCurrent) return setPwMsg({ ok: false, text: 'Enter your current password' });
    if (pwNew.length < 8 || !/[A-Z]/.test(pwNew) || !/[a-z]/.test(pwNew) || !/\d/.test(pwNew))
      return setPwMsg({ ok: false, text: 'New password needs 8+ characters with uppercase, lowercase and a number' });
    if (pwNew !== pwConfirm) return setPwMsg({ ok: false, text: 'New passwords do not match' });
    setPwBusy(true);
    const r = await dispatch(changePassword({ currentPassword: pwCurrent, newPassword: pwNew, confirmPassword: pwConfirm }));
    setPwBusy(false);
    if (changePassword.fulfilled.match(r)) {
      setPwMsg({ ok: true, text: r.payload });
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
      setTimeout(() => {
        setPwOpen(false);
        setPwMsg(null);
      }, 1500);
    } else {
      setPwMsg({ ok: false, text: (r.payload as string) || 'Could not change password' });
    }
  };

  const setP = (k: keyof PersonalForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setPersonal((p) => ({ ...p, [k]: e.target.value }));

  const navCls = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/50'
        : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
    }`;

  const checklist = [
    { label: 'Personal details', done: steps.personal },
    { label: 'Education details', done: steps.education },
    { label: 'Photo upload', done: steps.photo },
    { label: 'Documents upload', done: steps.documents },
    { label: 'Fee payment & submit', done: steps.payment },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-slate-800 antialiased">
      {/* animated 3D background (stays fixed while the page scrolls) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Background3D />
      </div>

      {/* mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="relative z-10 flex min-h-screen">
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`fixed bottom-0 left-0 top-0 z-40 flex w-64 shrink-0 transform flex-col border-r border-white/10 bg-blue-950/80 text-white shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:sticky lg:bottom-auto lg:h-screen lg:translate-x-0 lg:self-start ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-xl shadow-inner">🎓</span>
            <div>
              <p className="text-lg font-extrabold leading-none tracking-wide">college</p>
              <p className="text-[10px] uppercase tracking-widest text-blue-200">Admissions</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
            <button className={navCls(tab === 'dashboard')} onClick={() => goTab('dashboard')}>
              <Icon name="grid" className="h-5 w-5" /> Dashboard
            </button>
            <button className={navCls(tab === 'application')} onClick={openApplication}>
              <Icon name="document" className="h-5 w-5" /> Application Form
            </button>
            <button className={navCls(tab === 'payments')} onClick={() => goTab('payments')}>
              <Icon name="card" className="h-5 w-5" /> My Payments
            </button>
            <button className={navCls(false)} onClick={() => { setPwOpen(true); setSidebarOpen(false); }}>
              <Icon name="lock" className="h-5 w-5" /> Change Password
            </button>
            <button className={navCls(false)} onClick={handleLogout}>
              <Icon name="logout" className="h-5 w-5" /> Logout
            </button>
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold">
                {student.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{student.name}</p>
                <p className="truncate text-[11px] text-blue-200">{student.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= MAIN ================= */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-blue-950/60 px-4 text-white backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
                aria-label="Menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="hidden text-sm font-semibold text-blue-100 sm:block">Student Portal</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                Home
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1 pl-1 pr-3 backdrop-blur">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-[11px] font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[8rem] truncate text-xs font-semibold">{student.name}</span>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="anim-fade-up">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">
                {overview.session ? `Admission Session ${overview.session}` : 'Admissions'}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">{titles[tab]}</h1>
            </div>

            {errorText && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-lg">
                {errorText}
              </div>
            )}
            {notice && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg">
                {notice}
              </div>
            )}

            {/* ================= DASHBOARD ================= */}
            {tab === 'dashboard' && (
              <div key="dashboard" className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* status */}
                  <div className={`${cardCls} anim-fade-up p-5 transition hover:-translate-y-1 hover:shadow-2xl`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Application Status</p>
                        <div className="mt-3"><Badge status={appStatus} /></div>
                        <p className="mt-3 font-mono text-xs text-slate-500">{application?.applicationNo ?? 'Not started yet'}</p>
                      </div>
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-600 text-white shadow-md">
                        <Icon name="document" className="h-5 w-5" />
                      </span>
                    </div>
                  </div>

                  {/* completion */}
                  <div className={`${cardCls} anim-fade-up p-5 transition hover:-translate-y-1 hover:shadow-2xl`} style={{ animationDelay: '80ms' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Profile Completion</p>
                        <p className="mt-2 text-3xl font-black text-blue-950">{progress}%</p>
                        <p className="mt-1 text-xs text-slate-500">{stepDone.filter(Boolean).length} of {stepDone.length} steps done</p>
                      </div>
                      <div className="relative">
                        <Ring value={progress} />
                      </div>
                    </div>
                  </div>

                  {/* payment */}
                  <div className={`${cardCls} anim-fade-up p-5 transition hover:-translate-y-1 hover:shadow-2xl`} style={{ animationDelay: '160ms' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Payment Status</p>
                        <p className={`mt-3 text-lg font-extrabold ${steps.payment ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {steps.payment
                            ? `Paid ${inr(paidPayment?.amount ?? 0)}`
                            : fees.payableNow > 0
                              ? `${inr(fees.payableNow)} due`
                              : 'Not available'}
                        </p>
                        <button onClick={() => goTab('payments')} className="mt-2 text-xs font-bold text-blue-800 hover:underline">
                          View fee details →
                        </button>
                      </div>
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-600 text-white shadow-md">
                        <Icon name="card" className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* application table */}
                <div className={`${cardCls} anim-fade-up overflow-hidden`} style={{ animationDelay: '240ms' }}>
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="text-sm font-bold text-blue-950">My Application</h2>
                    {!application && (
                      <button onClick={openApplication} disabled={saving.start} className={smBtn}>
                        {saving.start ? 'Starting...' : '+ New'}
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-3">Application No</th>
                          <th className="px-5 py-3">Name</th>
                          <th className="px-5 py-3">Programme</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">Completed</th>
                          <th className="px-5 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="transition hover:bg-blue-50/50">
                          <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">{application?.applicationNo ?? '-'}</td>
                          <td className="px-5 py-4 font-semibold">{student.name}</td>
                          <td className="px-5 py-4">{programLabel}</td>
                          <td className="px-5 py-4"><Badge status={appStatus} /></td>
                          <td className="w-40 px-5 py-4">
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                              <div className="h-2 rounded-full bg-gradient-to-r from-blue-700 to-indigo-500 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="mt-1 block text-[11px] text-slate-400">{progress}% filled</span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button onClick={openApplication} disabled={saving.start} className={smBtn}>
                              {!application ? 'Start' : locked ? 'View' : 'Continue'}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* progress checklist */}
                  <div className={`${cardCls} anim-fade-up p-5`} style={{ animationDelay: '320ms' }}>
                    <h2 className="mb-4 text-sm font-bold text-blue-950">Your Progress</h2>
                    <ul className="space-y-3">
                      {checklist.map((c, i) => (
                        <li key={c.label} className="flex items-center gap-3">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              c.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {c.done ? <Icon name="check" className="h-4 w-4" /> : i + 1}
                          </span>
                          <span className={`flex-1 text-sm ${c.done ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{c.label}</span>
                          <span className={`text-[11px] font-bold ${c.done ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {c.done ? 'Done' : 'Pending'}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={openApplication} disabled={saving.start} className={`${primaryBtn} mt-5 w-full`}>
                      {!application ? 'Start Application' : locked ? 'View Application' : 'Continue Application'}
                    </button>
                  </div>

                  {/* course details */}
                  <div className={`${cardCls} anim-fade-up p-5`} style={{ animationDelay: '400ms' }}>
                    <h2 className="mb-4 text-sm font-bold text-blue-950">Course & Profile</h2>
                    <dl className="space-y-3 text-sm">
                      {[
                        ['Programme', programLabel],
                        ['Type', student.programType],
                        ['Duration', `${student.durationMonths / 12} years`],
                        ['Session', overview.session ?? '-'],
                        ['Email', student.email],
                        ['Mobile', student.mobile ?? '-'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                          <dt className="text-slate-500">{k}</dt>
                          <dd className="break-all text-right font-semibold text-slate-800">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {/* ================= APPLICATION FORM ================= */}
            {tab === 'application' && (
              <div key="application" className={`${cardCls} anim-fade-up overflow-hidden`}>
                <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-900 to-blue-700 px-5 py-4 text-white sm:px-8">
                  <div>
                    <p className="text-sm font-bold">{programLabel}</p>
                    <p className="text-xs text-blue-100">
                      {student.programType} · {student.durationMonths / 12} years · Session {overview.session}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mb-1 font-mono text-sm font-bold">{application?.applicationNo}</p>
                    <Badge status={appStatus} />
                  </div>
                </div>

                <div className="space-y-8 p-5 sm:p-8">
                  {/* step bar */}
                  <div>
                    <ol className="flex items-start">
                      {STEPS.map((label, i) => {
                        const reachable = i === 0 || stepDone.slice(0, i).every(Boolean);
                        const active = step === i;
                        return (
                          <li key={label} className={`flex items-start ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                            <div className="flex flex-col items-center">
                              <button
                                type="button"
                                disabled={!reachable}
                                onClick={() => goStep(i)}
                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-md transition ${
                                  active
                                    ? 'bg-gradient-to-br from-blue-900 to-blue-600 text-white ring-4 ring-blue-200'
                                    : stepDone[i]
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-slate-200 text-slate-600'
                                } ${!reachable ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5'}`}
                              >
                                {stepDone[i] && !active ? <Icon name="check" className="h-4 w-4" /> : i + 1}
                              </button>
                              <span className={`mt-2 hidden text-center text-xs sm:block ${active ? 'font-bold text-blue-900' : 'text-slate-500'}`}>
                                {label}
                              </span>
                            </div>
                            {i < STEPS.length - 1 && (
                              <div className={`mx-2 mt-4 h-0.5 flex-1 rounded ${stepDone[i] ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                            )}
                          </li>
                        );
                      })}
                    </ol>
                    <p className="mt-3 text-center text-xs font-bold text-blue-900 sm:hidden">
                      Step {step + 1}: {STEPS[step]}
                    </p>
                  </div>

                  {locked && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
                      Your application has been submitted. Details can no longer be edited.
                    </div>
                  )}

                  {/* STEP 0: PERSONAL */}
                  {step === 0 && (
                    <form onSubmit={submitPersonal} className="space-y-8 text-sm" noValidate>
                      <fieldset disabled={locked} className="min-w-0 space-y-8">
                        <div className="space-y-4">
                          <SectionTitle>Personal Details</SectionTitle>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Field label="First Name" required><input className={inputCls} value={personal.firstName} onChange={setP('firstName')} /></Field>
                            <Field label="Middle Name"><input className={inputCls} value={personal.middleName} onChange={setP('middleName')} /></Field>
                            <Field label="Last Name"><input className={inputCls} value={personal.lastName} onChange={setP('lastName')} /></Field>
                            <Field label="Email Address"><input className={inputCls} value={student.email} disabled /></Field>
                            <Field label="Mobile Number"><input className={inputCls} value={student.mobile ?? ''} disabled /></Field>
                            <Field label="Date of Birth" required><input type="date" className={inputCls} value={personal.dateOfBirth} onChange={setP('dateOfBirth')} /></Field>
                            <Field label="Gender" required>
                              <select className={inputCls} value={personal.gender} onChange={setP('gender')}>
                                <option value="">Select</option>
                                {GENDERS.map((g) => <option key={g}>{g}</option>)}
                              </select>
                            </Field>
                            <Field label="Category" required>
                              <select className={inputCls} value={personal.category} onChange={setP('category')}>
                                <option value="">Select</option>
                                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                              </select>
                            </Field>
                            <Field label="Religion">
                              <select className={inputCls} value={personal.religion} onChange={setP('religion')}>
                                <option value="">Select</option>
                                {RELIGIONS.map((r) => <option key={r}>{r}</option>)}
                              </select>
                            </Field>
                            <Field label="Nationality" required><input className={inputCls} value={personal.nationality} onChange={setP('nationality')} /></Field>
                            <Field label="Aadhaar Number">
                              <input className={inputCls} inputMode="numeric" maxLength={14} value={personal.aadhaar} onChange={setP('aadhaar')} placeholder="12 digits" />
                            </Field>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <SectionTitle>Parents Details</SectionTitle>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Field label="Father's Name" required><input className={inputCls} value={personal.fatherName} onChange={setP('fatherName')} /></Field>
                            <Field label="Father's Mobile" required>
                              <input className={inputCls} inputMode="numeric" maxLength={10} value={personal.fatherMobile}
                                onChange={(e) => setPersonal((p) => ({ ...p, fatherMobile: e.target.value.replace(/\D/g, '') }))} />
                            </Field>
                            <Field label="Mother's Name" required><input className={inputCls} value={personal.motherName} onChange={setP('motherName')} /></Field>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <SectionTitle>Address For Correspondence</SectionTitle>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Field label="Address" required className="sm:col-span-3"><input className={inputCls} value={personal.addressLine} onChange={setP('addressLine')} /></Field>
                            <Field label="State" required>
                              <select className={inputCls} value={personal.state} onChange={setP('state')}>
                                <option value="">Select</option>
                                {STATES.map((st) => <option key={st}>{st}</option>)}
                              </select>
                            </Field>
                            <Field label="City" required><input className={inputCls} value={personal.city} onChange={setP('city')} /></Field>
                            <Field label="PIN Code" required>
                              <input className={inputCls} inputMode="numeric" maxLength={6} value={personal.pincode}
                                onChange={(e) => setPersonal((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))} />
                            </Field>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                            <span className="font-semibold text-slate-700">Is permanent address same as correspondence address?</span>
                            <label className="inline-flex cursor-pointer items-center gap-1.5 font-semibold">
                              <input type="radio" className="accent-blue-800" checked={personal.isPermanentSame} onChange={() => setPersonal((p) => ({ ...p, isPermanentSame: true }))} /> Yes
                            </label>
                            <label className="inline-flex cursor-pointer items-center gap-1.5 font-semibold">
                              <input type="radio" className="accent-blue-800" checked={!personal.isPermanentSame} onChange={() => setPersonal((p) => ({ ...p, isPermanentSame: false }))} /> No
                            </label>
                          </div>
                          {!personal.isPermanentSame && (
                            <Field label="Permanent Address" required>
                              <textarea className={inputCls} rows={3} value={personal.permanentAddress} onChange={setP('permanentAddress')} />
                            </Field>
                          )}
                        </div>
                      </fieldset>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <button type="button" onClick={() => goTab('dashboard')} className={outlineBtn}>← Dashboard</button>
                        {locked ? (
                          <button type="button" onClick={() => goStep(1)} className={primaryBtn}>Next →</button>
                        ) : (
                          <button type="submit" disabled={saving.personal} className={primaryBtn}>
                            {saving.personal ? 'Saving...' : 'Save & Go To Next →'}
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* STEP 1: EDUCATION */}
                  {step === 1 && (
                    <form onSubmit={submitEducation} className="space-y-8 text-sm" noValidate>
                      <fieldset disabled={locked} className="min-w-0 space-y-8">
                        <EduBlock title="10th (Secondary) Details" value={tenth} onChange={setTenth} />
                        <EduBlock title="12th (Senior Secondary) Details" value={twelfth} onChange={setTwelfth} streamLabel="Stream (Science / Commerce / Arts)" />
                        <div className="space-y-4">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">
                            <input type="checkbox" className="accent-blue-800" checked={hasDiploma} onChange={(e) => setHasDiploma(e.target.checked)} />
                            I have a Diploma
                          </label>
                          {hasDiploma && (
                            <EduBlock
                              title="Diploma Details"
                              value={diploma}
                              onChange={setDiploma}
                              streamLabel="Branch / Trade"
                              boardLabel="Board / University"
                              instituteLabel="Institute Name"
                            />
                          )}
                        </div>
                      </fieldset>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <button type="button" onClick={() => goStep(0)} className={outlineBtn}>← Back</button>
                        {locked ? (
                          <button type="button" onClick={() => goStep(2)} className={primaryBtn}>Next →</button>
                        ) : (
                          <button type="submit" disabled={saving.education} className={primaryBtn}>
                            {saving.education ? 'Saving...' : 'Save & Go To Next →'}
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* STEP 2: PHOTO */}
                  {step === 2 && (
                    <div className="space-y-6 text-sm">
                      <SectionTitle>Passport Size Photo</SectionTitle>
                      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                        <div className="flex h-52 w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 shadow-inner">
                          {filePreview || photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={filePreview || photoUrl || ''} alt="Your photo" className="h-full w-full object-cover" />
                          ) : (
                            <span className="px-3 text-center text-slate-400">No photo yet</span>
                          )}
                        </div>
                        <div className="space-y-4">
                          <ul className="list-disc space-y-1 pl-5 text-slate-600">
                            <li>Recent photo of your face, clear and front facing</li>
                            <li>Format: <b>JPG, JPEG or PNG</b></li>
                            <li>Maximum size: <b>2 MB</b></li>
                          </ul>
                          {!locked && (
                            <div className="flex flex-wrap items-center gap-3">
                              <label className={`${outlineBtn} cursor-pointer`}>
                                {overview.photo || file ? 'Choose another photo' : 'Choose photo'}
                                <input type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" className="hidden" onChange={onPickFile} />
                              </label>
                              {file && (
                                <button type="button" onClick={submitPhoto} disabled={saving.photo} className={primaryBtn}>
                                  {saving.photo ? 'Uploading...' : 'Upload photo'}
                                </button>
                              )}
                            </div>
                          )}
                          {file && <p className="text-slate-500">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
                          {overview.photo && !file && <p className="font-semibold text-emerald-700">✓ Photo uploaded</p>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <button type="button" onClick={() => goStep(1)} className={outlineBtn}>← Back</button>
                        <button type="button" disabled={!overview.photo} onClick={() => goStep(3)} className={primaryBtn}>Next →</button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: DOCUMENTS */}
                  {step === 3 && (
                    <div className="space-y-6 text-sm">
                      <SectionTitle>Upload Documents</SectionTitle>
                      <p className="text-slate-500">
                        Upload clear scans or photos of the documents below. Allowed: <b>PDF, JPG, JPEG or PNG</b> (the
                        signature must be an image). Maximum <b>2 MB</b> per file.
                      </p>

                      {docItems.length === 0 ? (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-semibold text-amber-800">
                          No documents are configured yet.
                        </p>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-blue-700 to-indigo-500 transition-all"
                                style={{ width: `${requiredDocs.length ? (requiredDone / requiredDocs.length) * 100 : 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-blue-900">
                              {requiredDone} of {requiredDocs.length} required uploaded
                            </span>
                          </div>

                          <ul className="space-y-3">
                            {docItems.map((d) => {
                              const busy = docBusy === d.docType;
                              return (
                                <li
                                  key={d.docType}
                                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="flex min-w-0 items-start gap-3">
                                    <span
                                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                        d.uploaded ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                      }`}
                                    >
                                      {d.uploaded ? <Icon name="check" className="h-4 w-4" /> : '•'}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-slate-800">
                                        {d.label}{' '}
                                        <span
                                          className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                            d.required ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                                          }`}
                                        >
                                          {d.required ? 'Required' : 'Optional'}
                                        </span>
                                      </p>
                                      <p className="truncate text-xs text-slate-500">
                                        {d.uploaded
                                          ? `${d.uploaded.originalName ?? 'Uploaded file'} · ${(d.uploaded.sizeBytes / 1024).toFixed(0)} KB`
                                          : d.allowPdf
                                            ? 'PDF, JPG or PNG'
                                            : 'JPG or PNG image'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2">
                                    {d.uploaded && (
                                      <button
                                        type="button"
                                        onClick={() => viewDoc(d)}
                                        className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                      >
                                        View
                                      </button>
                                    )}
                                    {!locked && (
                                      <>
                                        <label
                                          className={`cursor-pointer rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 ${
                                            busy ? 'pointer-events-none opacity-60' : ''
                                          }`}
                                        >
                                          {busy ? 'Working...' : d.uploaded ? 'Replace' : 'Upload'}
                                          <input
                                            type="file"
                                            className="hidden"
                                            disabled={busy}
                                            accept={
                                              d.allowPdf
                                                ? 'application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png'
                                                : 'image/jpeg,image/png,.jpg,.jpeg,.png'
                                            }
                                            onChange={(e) => onPickDoc(d, e)}
                                          />
                                        </label>
                                        {d.uploaded && (
                                          <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() => removeDoc(d)}
                                            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                                          >
                                            Remove
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}

                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <button type="button" onClick={() => goStep(2)} className={outlineBtn}>← Back</button>
                        <button type="button" disabled={!steps.documents} onClick={() => goStep(4)} className={primaryBtn}>
                          Next →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: FEE & PAYMENT */}
                  {step === 4 && (
                    <div className="space-y-6 text-sm">
                      <SectionTitle>Fee Structure — {programLabel}</SectionTitle>

                      {fees.items.length === 0 ? (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-semibold text-amber-800">
                          The fee structure for your course has not been published yet.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                              <tr>
                                <th className="px-4 py-3">Fee Head</th>
                                <th className="px-4 py-3">When</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {fees.items.map((f) => (
                                <tr key={f.feeHead}>
                                  <td className="px-4 py-3">{f.feeHead}</td>
                                  <td className="px-4 py-3">
                                    {f.payableNow ? <span className="font-bold text-blue-800">Pay now</span> : <span className="text-slate-500">After admission</span>}
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono">{inr(f.amount)}</td>
                                </tr>
                              ))}
                              <tr className="bg-gradient-to-r from-blue-900 to-blue-700 font-bold text-white">
                                <td className="px-4 py-3.5" colSpan={2}>Payable now</td>
                                <td className="px-4 py-3.5 text-right font-mono">{inr(fees.payableNow)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {steps.payment ? (
                        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Icon name="check" className="h-5 w-5" />
                          </span>
                          <div className="space-y-1">
                            <p className="text-base font-bold">Payment received. Application submitted.</p>
                            <p>Application No: <b className="font-mono">{application?.applicationNo}</b></p>
                            <p className="text-xs">
                              Transaction <span className="font-mono">{paidPayment?.transactionRef}</span> · {inr(paidPayment?.amount ?? 0)} · {fmtDate(paidPayment?.paidAt ?? null)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {fees.paymentMode === 'test' && (
                            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-semibold text-amber-800">
                              Test mode: no real money is charged. This only simulates a payment.
                            </p>
                          )}
                          {fees.paymentMode === 'off' && (
                            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-600">
                              Online payment is not enabled yet.
                            </p>
                          )}
                          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                            <input type="checkbox" className="mt-0.5 accent-blue-800" checked={declared} onChange={(e) => setDeclared(e.target.checked)} />
                            <span>I declare that all the information and documents I have provided are true and correct. I understand that my application will be submitted after payment and can no longer be edited.</span>
                          </label>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <button type="button" onClick={() => goStep(3)} className={outlineBtn}>← Back</button>
                        {!steps.payment && (
                          <button
                            type="button"
                            onClick={submitPayment}
                            disabled={saving.pay || !declared || fees.paymentMode !== 'test' || fees.payableNow <= 0}
                            className={primaryBtn}
                          >
                            {saving.pay ? 'Processing...' : `Pay ${inr(fees.payableNow)} & Submit`}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= MY PAYMENTS ================= */}
            {tab === 'payments' && (
              <div key="payments" className="space-y-6">
                <div className={`${cardCls} anim-fade-up space-y-4 p-5 sm:p-6`}>
                  <h2 className="text-base font-bold text-blue-950">Fee Structure — {programLabel}</h2>
                  {fees.items.length === 0 ? (
                    <p className="text-sm text-slate-500">The fee structure for your course has not been published yet.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Fee Head</th>
                            <th className="px-4 py-3">When</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fees.items.map((f) => (
                            <tr key={f.feeHead}>
                              <td className="px-4 py-3">{f.feeHead}</td>
                              <td className="px-4 py-3">{f.payableNow ? 'Pay with application' : 'After admission'}</td>
                              <td className="px-4 py-3 text-right font-mono">{inr(f.amount)}</td>
                            </tr>
                          ))}
                          <tr className="bg-gradient-to-r from-blue-900 to-blue-700 font-bold text-white">
                            <td className="px-4 py-3.5" colSpan={2}>Total (all heads)</td>
                            <td className="px-4 py-3.5 text-right font-mono">{inr(fees.total)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className={`${cardCls} anim-fade-up space-y-4 p-5 sm:p-6`} style={{ animationDelay: '100ms' }}>
                  <h2 className="text-base font-bold text-blue-950">Payment History</h2>
                  {payments.length === 0 ? (
                    <p className="text-sm text-slate-500">No payments yet.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Transaction</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payments.map((p) => (
                            <tr key={p.paymentId}>
                              <td className="px-4 py-3 font-mono text-xs">{p.transactionRef}</td>
                              <td className="px-4 py-3">{fmtDate(p.paidAt)}</td>
                              <td className="px-4 py-3 font-bold text-emerald-700">{p.status}</td>
                              <td className="px-4 py-3 text-right font-mono">{inr(p.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {!steps.payment && (
                    <button onClick={openApplication} className={primaryBtn}>Continue application to pay</button>
                  )}
                </div>
              </div>
            )}

            <p className="pb-2 pt-4 text-center text-xs text-blue-200/60">&copy; 2026 college Admissions. All rights reserved.</p>
          </main>
        </div>
      </div>

      {/* ================= CHANGE PASSWORD ================= */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 text-white">
              <h3 className="text-base font-bold">Change Password</h3>
              <button
                onClick={() => { setPwOpen(false); setPwMsg(null); }}
                className="text-2xl leading-none text-white/80 hover:text-white"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4 p-6">
              {pwMsg && (
                <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${pwMsg.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
                  {pwMsg.text}
                </div>
              )}
              <form onSubmit={submitPassword} className="space-y-4 text-sm">
                <Field label="Current Password" required>
                  <input type="password" className={inputCls} value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} disabled={pwBusy} autoComplete="current-password" />
                </Field>
                <Field label="New Password" required>
                  <input type="password" className={inputCls} value={pwNew} onChange={(e) => setPwNew(e.target.value)} disabled={pwBusy} autoComplete="new-password" />
                </Field>
                <Field label="Confirm New Password" required>
                  <input type="password" className={inputCls} value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} disabled={pwBusy} autoComplete="new-password" />
                </Field>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={pwBusy} className={primaryBtn}>{pwBusy ? 'Updating...' : 'Save changes'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}