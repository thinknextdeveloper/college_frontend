'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authslice';
import api from '@/lib/api';

type Option = { id: string | number; name: string };

export default function StudentDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'application'>('dashboard');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [passwordModal, setPasswordModal] = useState(false);
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Dynamic Dropdown States (Loaded from Backend API)
  const [programTypes, setProgramTypes] = useState<Option[]>([]);
  const [programs, setPrograms] = useState<Option[]>([]);
  const [specializations, setSpecializations] = useState<Option[]>([]);
  const [countries, setCountries] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [religions, setReligions] = useState<Option[]>([]);
  const [genders, setGenders] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [nationalities, setNationalities] = useState<Option[]>([]);
  const [sessions, setSessions] = useState<Option[]>([]);
  const [lateralOptions, setLateralOptions] = useState<Option[]>([]);

  // Selected Form States
  const [selectedProgType, setSelectedProgType] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedSpec, setSelectedSpec] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('2026-2027');
  const [selectedLateral, setSelectedLateral] = useState<string>('No');

  // Personal Info Form
  const [firstName, setFirstName] = useState(user?.candidateName?.split(' ')[0] || 'sam');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState(user?.candidateName?.split(' ')[1] || 'kumar');
  const [email, setEmail] = useState(user?.email || 'student@democollege.edu');
  const [mobile, setMobile] = useState(user?.mobile || '9876543210');
  const [dob, setDob] = useState('2004-05-15');
  const [nationality, setNationality] = useState('Indian');
  const [aadhaar, setAadhaar] = useState('4589 1234 5678');
  const [passport, setPassport] = useState('');
  const [religion, setReligion] = useState('Hindu');
  const [gender, setGender] = useState('Male');
  const [category, setCategory] = useState('General');

  // Parents Info
  const [fatherFirst, setFatherFirst] = useState('Ramesh');
  const [fatherMiddle, setFatherMiddle] = useState('');
  const [fatherLast, setFatherLast] = useState('Kumar');
  const [fatherMobile, setFatherMobile] = useState('+91 98765 00001');
  const [fatherEmail, setFatherEmail] = useState('');
  const [fatherAadhaar, setFatherAadhaar] = useState('');

  const [motherFirst, setMotherFirst] = useState('Sunita');
  const [motherMiddle, setMotherMiddle] = useState('');
  const [motherLast, setMotherLast] = useState('Devi');
  const [motherMobile, setMotherMobile] = useState('');
  const [motherEmail, setMotherEmail] = useState('');
  const [motherAadhaar, setMotherAadhaar] = useState('');

  // Address Info
  const [country, setCountry] = useState('India');
  const [stateName, setStateName] = useState('Bihar');
  const [cityName, setCityName] = useState('Patna');
  const [addressLine1, setAddressLine1] = useState('House No. 12, Main Road');
  const [area, setArea] = useState('Sector 4');
  const [pincode, setPincode] = useState('800001');
  const [isSameAddress, setIsSameAddress] = useState(true);

  // Status feedback
  const [applicationSaved, setApplicationSaved] = useState(false);

  const displayName = user?.candidateName || (user?.email ? user.email.split('@')[0] : 'sam');
  const displayEmail = user?.email || 'student@democollege.edu';
  const displayMobile = user?.mobile || '9876543210';

  // Handle click outside user dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Initial Load of Dynamic Dropdowns from Backend API
  useEffect(() => {
    api.get('/lookup/program-types').then((res) => setProgramTypes(res.data)).catch(() => {});
    api.get('/lookup/countries').then((res) => setCountries(res.data)).catch(() => {});
    api.get('/lookup/states').then((res) => setStates(res.data)).catch(() => {});
    api.get('/lookup/dropdowns').then((res) => {
      setReligions(res.data.religions || []);
      setGenders(res.data.genders || []);
      setCategories(res.data.categories || []);
      setNationalities(res.data.nationalities || []);
      setSessions(res.data.sessions || []);
      setLateralOptions(res.data.lateralEntry || []);
    }).catch(() => {});
  }, []);

  // 2. Dynamic Program Dropdown - Re-fetches whenever Program Type changes
  useEffect(() => {
    if (!selectedProgType) {
      api.get('/lookup/programs').then((res) => setPrograms(res.data)).catch(() => {});
      return;
    }
    api.get(`/lookup/programs?programTypeId=${selectedProgType}`)
      .then((res) => {
        setPrograms(res.data);
        if (res.data.length > 0) setSelectedProgram(String(res.data[0].id));
      })
      .catch(() => {});
  }, [selectedProgType]);

  // 3. Dynamic Specialization Dropdown - Re-fetches whenever Program changes
  useEffect(() => {
    if (!selectedProgram) return;
    api.get(`/lookup/specializations?programId=${selectedProgram}`)
      .then((res) => {
        setSpecializations(res.data);
        if (res.data.length > 0) setSelectedSpec(String(res.data[0].id));
      })
      .catch(() => {});
  }, [selectedProgram]);

  // 4. Dynamic City Dropdown - Re-fetches whenever State changes
  useEffect(() => {
    if (!stateName) return;
    api.get(`/lookup/cities?state=${encodeURIComponent(stateName)}`)
      .then((res) => {
        setCities(res.data);
        if (res.data.length > 0) setCityName(res.data[0].name);
      })
      .catch(() => {});
  }, [stateName]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/login');
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Real Database Update via Backend API
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currPassword) {
      setPasswordFeedback('Enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordFeedback('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback('New passwords do not match');
      return;
    }

    setSubmittingPassword(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: currPassword,
        newPassword,
        confirmPassword,
        userId: user?.id,
        email: user?.email || displayEmail,
        mobile: user?.mobile || displayMobile,
      });

      setPasswordFeedback(res.data?.message || 'Password updated successfully in database!');
      setTimeout(() => {
        setPasswordModal(false);
        setPasswordFeedback(null);
        setCurrPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update password';
      setPasswordFeedback(errMsg);
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleSaveApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSaved(true);
    setTimeout(() => setApplicationSaved(false), 3000);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans antialiased">
      {/* LEFT SIDEBAR: Royal Navy Blue (Login page color scheme, NO RED) */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'
        } shrink-0 bg-blue-950 text-white flex flex-col transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-40 lg:static border-r border-blue-900 shadow-xl`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-blue-900/60 bg-blue-900">
          {/* Mosaic Dots Logo */}
          <div className="grid grid-cols-3 gap-0.5 shrink-0">
            <span className="h-2 w-2 rounded-sm bg-lime-400" />
            <span className="h-2 w-2 rounded-sm bg-emerald-400" />
            <span className="h-2 w-2 rounded-sm bg-sky-400" />
            <span className="h-2 w-2 rounded-sm bg-blue-400" />
            <span className="h-2 w-2 rounded-sm bg-amber-300" />
            <span className="h-2 w-2 rounded-sm bg-indigo-300" />
          </div>
          <span className={`text-2xl font-black tracking-wider text-white ${!sidebarOpen && 'lg:hidden'}`}>
            DEM<span className="text-sky-400">O</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          {/* 1. DASHBOARD */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-md text-xs font-bold tracking-wider uppercase transition ${
              activeTab === 'dashboard'
                ? 'bg-blue-800 text-white shadow-inner border-l-4 border-amber-400'
                : 'text-blue-100/80 hover:bg-blue-900 hover:text-white'
            }`}
          >
            <svg className="h-4 w-4 shrink-0 text-sky-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className={!sidebarOpen ? 'lg:hidden' : ''}>Dashboard</span>
          </button>

          {/* 2. MY PAYMENTS */}
          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-md text-xs font-bold tracking-wider uppercase transition ${
              activeTab === 'payments'
                ? 'bg-blue-800 text-white shadow-inner border-l-4 border-amber-400'
                : 'text-blue-100/80 hover:bg-blue-900 hover:text-white'
            }`}
          >
            <svg className="h-4 w-4 shrink-0 text-sky-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h3a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className={!sidebarOpen ? 'lg:hidden' : ''}>My Payments</span>
          </button>

          {/* 3. CHANGE PASSWORD */}
          <button
            onClick={() => setPasswordModal(true)}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-md text-xs font-bold tracking-wider uppercase text-blue-100/80 hover:bg-blue-900 hover:text-white transition"
          >
            <svg className="h-4 w-4 shrink-0 text-sky-300" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className={!sidebarOpen ? 'lg:hidden' : ''}>Change Password</span>
          </button>

          {/* 4. LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-md text-xs font-bold tracking-wider uppercase text-blue-100/80 hover:bg-blue-900 hover:text-sky-200 transition"
          >
            <svg className="h-4 w-4 shrink-0 text-sky-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a1 1 0 011-1h6a1 1 0 110 2H5v12h5a1 1 0 110 2H4a1 1 0 01-1-1V3zm13.707 6.293a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L19.414 11H10a1 1 0 110-2h9.414l-1.707-1.707a1 1 0 00-1.414 1.414z" />
            </svg>
            <span className={!sidebarOpen ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 text-[10px] text-blue-300/60 border-t border-blue-900/60 ${!sidebarOpen && 'lg:hidden'}`}>
          <p>© 2026 Demo Portal</p>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Hamburger Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-md text-slate-600 hover:text-blue-900 hover:bg-blue-50 transition"
            title="Toggle Sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Right Controls: Fullscreen & Interactive User Profile Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleToggleFullscreen}
              className="p-2 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-md transition"
              title="Toggle Fullscreen"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>

            {/* Clickable Profile Pill with Dropdown (Matches Screenshot Exactly) */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-lg border border-slate-300 py-1 px-3 bg-white hover:bg-slate-50 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 active:scale-95"
              >
                <div className="h-6 w-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 bg-slate-50">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-800 lowercase">{displayName}</span>
              </button>

              {/* User Dropdown Menu Card */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                    Welcome!
                  </div>

                  {/* 1. Dashboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('dashboard');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition text-left"
                  >
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                    <span>Dashboard</span>
                  </button>

                  {/* 2. Change Password */}
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordModal(true);
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition text-left"
                  >
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span>Change Password</span>
                  </button>

                  {/* 3. Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition text-left border-t border-slate-100"
                  >
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Welcome greeting */}
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-blue-950">
              Welcome, {displayName}!
            </h1>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: DASHBOARD VIEW                                     */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 3 Summary Stat Cards in Login Blue Theme */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Card 1 */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      APPLICATION&apos;S IN-PROGRESS
                    </p>
                    <p className="mt-3 text-2xl font-black text-blue-950">1</p>
                  </div>
                  <div className="h-11 w-11 rounded-full bg-blue-900 flex items-center justify-center text-white shadow-md">
                    <span className="text-lg font-bold">₹</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      APPLICATION&apos;S COMPLETED
                    </p>
                    <p className="mt-3 text-2xl font-black text-blue-950">0</p>
                  </div>
                  <div className="h-11 w-11 rounded-full bg-blue-900 flex items-center justify-center text-white shadow-md">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">PAYMENT STATUS</p>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="mt-3 block text-sm font-bold text-blue-800 hover:text-blue-950 hover:underline text-left"
                    >
                      View Payment Status
                    </button>
                  </div>
                  <div className="h-11 w-11 rounded-full bg-blue-900 flex items-center justify-center text-white shadow-md">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Application Form Table Section */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-100 px-5 py-3 flex items-center justify-between border-b border-slate-200">
                  <h2 className="text-sm font-bold text-slate-800">Application Form</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('application')}
                    className="rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-1.5 shadow-sm transition active:scale-95"
                  >
                    + New
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Application No</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Programme</th>
                        <th className="py-3 px-4">Mobile No</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Completed</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-blue-50/40 transition">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                          APP/2026-2027/0406
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{displayName}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">B.Tech EEE</td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">{displayMobile}</td>
                        <td className="py-3.5 px-4 text-slate-700">{displayEmail}</td>
                        <td className="py-3.5 px-4 w-32">
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-500 h-2 rounded-full w-2/5" />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">40% filled</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setActiveTab('application')}
                            className="rounded bg-blue-900 hover:bg-blue-800 text-white px-4 py-1.5 text-xs font-bold shadow-sm transition active:scale-95"
                          >
                            Continue
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MY PAYMENTS VIEW (Matches Screenshot 1)           */}
          {/* ======================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-base font-bold text-blue-950">Application Summary</h2>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="text-xs font-semibold text-blue-800 hover:underline"
                  >
                    ← Back to Dashboard
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Application No</th>
                        <th className="py-3 px-4">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-4 px-4 font-mono font-medium text-slate-900">
                          APP/2026-2027/0406
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                            Pending
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: ONLINE APPLICATION FORM (Matches Screenshots 3 & 4)*/}
          {/* ======================================================== */}
          {activeTab === 'application' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
              {/* Top Step Progress Bar */}
              <div className="border-b border-slate-200 pb-6">
                <div className="flex items-center justify-between max-w-2xl mx-auto text-center">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs shadow-md">
                      1
                    </div>
                    <span className="mt-1.5 text-xs font-bold text-blue-900">Personal Details</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-slate-200 mx-2" />
                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs">
                      2
                    </div>
                    <span className="mt-1.5 text-xs text-slate-500">Education Details</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-slate-200 mx-2" />
                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs">
                      3
                    </div>
                    <span className="mt-1.5 text-xs text-slate-500">Upload Documents</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-slate-200 mx-2" />
                  {/* Step 4 */}
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs">
                      4
                    </div>
                    <span className="mt-1.5 text-xs text-slate-500">Payment</span>
                  </div>
                </div>
              </div>

              {applicationSaved && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 text-center">
                  Application form details saved successfully!
                </div>
              )}

              <form onSubmit={handleSaveApplication} className="space-y-8 text-xs">
                {/* 1. GENERAL INFORMATION (Dynamic Dropdowns) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-blue-900 border-b border-blue-100 pb-1.5">
                    General Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Program Type (Dynamic) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Program Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedProgType}
                        onChange={(e) => setSelectedProgType(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                        required
                      >
                        <option value="">Select Programme Type</option>
                        {programTypes.map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Program (Dynamic - updates when Program Type changes) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Program <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                        required
                      >
                        <option value="">Select Program</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Specialization (Dynamic - updates when Program changes) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Specialization <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedSpec}
                        onChange={(e) => setSelectedSpec(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                        required
                      >
                        <option value="">Select Specialization</option>
                        {specializations.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Admission Year / Session (Dynamic) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Select Admission Year / Session <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                      >
                        {sessions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Lateral Entry (Dynamic) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Lateral Entry <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedLateral}
                        onChange={(e) => setSelectedLateral(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                      >
                        {lateralOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. PERSONAL DETAILS (Dynamic Dropdowns for Nationality, Religion, Gender, Category) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-blue-900 border-b border-blue-100 pb-1.5">
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Date Of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                        required
                      />
                    </div>

                    {/* Nationality (Dynamic) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nationality <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                      >
                        {nationalities.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Aadhaar Number</label>
                      <input
                        type="text"
                        value={aadhaar}
                        onChange={(e) => setAadhaar(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Passport Number</label>
                      <input
                        type="text"
                        value={passport}
                        onChange={(e) => setPassport(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>

                    {/* Religion (Dynamic) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Religion <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={religion}
                        onChange={(e) => setReligion(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                      >
                        {religions.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Gender (Dynamic) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                      >
                        {genders.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category (Dynamic) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. FATHER DETAILS */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-blue-900 border-b border-blue-100 pb-1.5">
                    Father Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fatherFirst}
                        onChange={(e) => setFatherFirst(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        value={fatherMiddle}
                        onChange={(e) => setFatherMiddle(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={fatherLast}
                        onChange={(e) => setFatherLast(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fatherMobile}
                        onChange={(e) => setFatherMobile(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={fatherEmail}
                        onChange={(e) => setFatherEmail(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Aadhaar Number</label>
                      <input
                        type="text"
                        value={fatherAadhaar}
                        onChange={(e) => setFatherAadhaar(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. MOTHER DETAILS */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-blue-900 border-b border-blue-100 pb-1.5">
                    Mother Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={motherFirst}
                        onChange={(e) => setMotherFirst(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        value={motherMiddle}
                        onChange={(e) => setMotherMiddle(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={motherLast}
                        onChange={(e) => setMotherLast(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                      <input
                        type="text"
                        value={motherMobile}
                        onChange={(e) => setMotherMobile(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={motherEmail}
                        onChange={(e) => setMotherEmail(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Aadhaar Number</label>
                      <input
                        type="text"
                        value={motherAadhaar}
                        onChange={(e) => setMotherAadhaar(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. ADDRESS FOR CORRESPONDENCE (Dynamic Dropdowns for Country, State, City) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-blue-900 border-b border-blue-100 pb-1.5">
                    Address For Correspondence
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Country (Dynamic) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                      >
                        {countries.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* State (Dynamic) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                      >
                        {states.map((st) => (
                          <option key={st.id} value={st.name}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City (Dynamic - updates when State changes) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900 bg-white"
                      >
                        {cities.map((ct) => (
                          <option key={ct.id} value={ct.name}>
                            {ct.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Area</label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Permanent Address Toggle */}
                <div className="pt-2">
                  <span className="font-bold text-slate-700 mr-4">
                    Is Permanent Address Same As Correspondence Address?
                  </span>
                  <label className="inline-flex items-center gap-1.5 mr-4 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      name="sameAddress"
                      checked={isSameAddress}
                      onChange={() => setIsSameAddress(true)}
                    />
                    Yes
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      name="sameAddress"
                      checked={!isSameAddress}
                      onChange={() => setIsSameAddress(false)}
                    />
                    No
                  </label>
                </div>

                {/* Form Buttons in Login Blue */}
                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="rounded border border-slate-300 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    ← Back to Dashboard
                  </button>

                  <button
                    type="submit"
                    className="rounded bg-blue-900 hover:bg-blue-800 text-white px-7 py-2.5 text-xs font-bold transition shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <span>Save &amp; Go To Next</span>
                    <span>→</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* CHANGE PASSWORD MODAL (Matches Screenshot 2) */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-blue-950">Change Password</h3>
              <button
                onClick={() => {
                  setPasswordModal(false);
                  setPasswordFeedback(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {passwordFeedback && (
              <div
                className={`p-3 rounded text-xs font-bold ${
                  passwordFeedback.includes('successfully')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {passwordFeedback}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="Current Password"
                  className="w-full rounded border border-slate-300 p-2.5 outline-none focus:border-blue-900"
                  disabled={submittingPassword}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full rounded border border-slate-300 p-2.5 outline-none focus:border-blue-900"
                  disabled={submittingPassword}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full rounded border border-slate-300 p-2.5 outline-none focus:border-blue-900"
                  disabled={submittingPassword}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="rounded bg-blue-900 hover:bg-blue-800 text-white px-6 py-2.5 text-xs font-bold transition shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingPassword ? 'Updating...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
