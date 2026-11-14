import {
  createAsyncThunk,
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
  PayloadAction,
} from '@reduxjs/toolkit';
import api, { errorMessage, setAccessToken } from '@/lib/api';

export type Personal = {
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  dateOfBirth: string;
  gender: string;
  category: string;
  religion: string | null;
  nationality: string;
  aadhaar: string | null;
  fatherName: string;
  fatherMobile: string;
  motherName: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isPermanentSame: boolean;
  permanentAddress: string | null;
};
export type PersonalInput = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  category: string;
  religion: string;
  nationality: string;
  aadhaar: string;
  fatherName: string;
  fatherMobile: string;
  motherName: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isPermanentSame: boolean;
  permanentAddress: string;
};
export type EduRow = {
  board: string;
  institute: string;
  stream: string | null;
  rollNo: string | null;
  passingYear: number;
  percentage: number;
};
export type EduInput = {
  board: string;
  institute: string;
  stream: string;
  rollNo: string;
  passingYear: number;
  percentage: number;
};
export type FeeItem = { feeHead: string; amount: number; payableNow: boolean };
export type Payment = {
  paymentId: number;
  amount: number;
  status: string;
  method: string | null;
  transactionRef: string;
  paidAt: string | null;
};
export type DocItem = {
  docType: string;
  label: string;
  required: boolean;
  allowPdf: boolean;
  uploaded: { originalName: string | null; mimeType: string; sizeBytes: number; uploadedAt: string } | null;
};
export type Overview = {
  student: {
    name: string;
    email: string;
    mobile: string | null;
    programType: string;
    program: string;
    specialization: string | null;
    durationMonths: number;
  };
  session: string | null;
  application: { applicationId: number; applicationNo: string | null; status: string; submittedAt: string | null } | null;
  personal: Personal | null;
  education: { tenth: EduRow | null; twelfth: EduRow | null; diploma: EduRow | null };
  photo: { uploadedAt: string; sizeBytes: number } | null;
  documents: { items: DocItem[] };
  fees: { items: FeeItem[]; payableNow: number; total: number; paymentMode: string };
  payments: Payment[];
  steps: { personal: boolean; education: boolean; photo: boolean; documents: boolean; payment: boolean };
  progress: number;
  editable: boolean;
};

type Feedback = { type: 'error' | 'success'; text: string } | null;
type Saving = {
  start: boolean;
  personal: boolean;
  education: boolean;
  photo: boolean;
  document: boolean;
  removeDoc: boolean;
  pay: boolean;
};
type StudentState = {
  overview: Overview | null;
  saving: Saving;
  photoUrl: string | null;
  feedback: Feedback;
};

const initialState: StudentState = {
  overview: null,
  saving: { start: false, personal: false, education: false, photo: false, document: false, removeDoc: false, pay: false },
  photoUrl: null,
  feedback: null,
};

type Cfg = { rejectValue: string };

export const fetchOverview = createAsyncThunk<Overview, void, Cfg>('student/overview', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/student/overview')).data;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

export const startApplication = createAsyncThunk<Overview, void, Cfg>('student/start', async (_, { rejectWithValue }) => {
  try {
    return (await api.post('/student/application/start')).data;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

export const savePersonal = createAsyncThunk<Overview, PersonalInput, Cfg>(
  'student/personal',
  async (body, { rejectWithValue }) => {
    try {
      return (await api.put('/student/application/personal', body)).data;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

export const saveEducation = createAsyncThunk<
  Overview,
  { tenth: EduInput; twelfth: EduInput; diploma: EduInput | null },
  Cfg
>('student/education', async (body, { rejectWithValue }) => {
  try {
    return (await api.put('/student/application/education', body)).data;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

export const uploadPhoto = createAsyncThunk<Overview, File, Cfg>('student/photo', async (file, { rejectWithValue }) => {
  try {
    const fd = new FormData();
    fd.append('photo', file);
    return (await api.post('/student/application/photo', fd)).data;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

// Upload (or replace) one document: marksheet, ID proof, signature, certificate...
export const uploadDocument = createAsyncThunk<Overview, { docType: string; file: File }, Cfg>(
  'student/document',
  async ({ docType, file }, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      return (await api.post(`/student/application/documents/${docType}`, fd)).data;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

export const removeDocument = createAsyncThunk<Overview, string, Cfg>(
  'student/removeDoc',
  async (docType, { rejectWithValue }) => {
    try {
      return (await api.delete(`/student/application/documents/${docType}`)).data;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

export const payFees = createAsyncThunk<Overview, void, Cfg>('student/pay', async (_, { rejectWithValue }) => {
  try {
    return (await api.post('/student/payments/pay', { declaration: true })).data;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

// Photo is protected (needs the login token), so it is loaded as a blob and shown via an object URL
export const fetchPhoto = createAsyncThunk<string, void, Cfg & { state: { student: StudentState } }>(
  'student/fetchPhoto',
  async (_, { getState, rejectWithValue }) => {
    try {
      const res = await api.get('/student/application/photo', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const prev = getState().student.photoUrl;
      if (prev) URL.revokeObjectURL(prev);
      return url;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

// Documents are protected too: fetched as a blob and opened through an object URL
export const fetchDocumentUrl = createAsyncThunk<string, string, Cfg>(
  'student/docUrl',
  async (docType, { rejectWithValue }) => {
    try {
      const res = await api.get(`/student/application/documents/${docType}`, { responseType: 'blob' });
      return URL.createObjectURL(res.data);
    } catch {
      return rejectWithValue('Could not open the document');
    }
  }
);

export const changePassword = createAsyncThunk<
  string,
  { currentPassword: string; newPassword: string; confirmPassword: string },
  Cfg
>('student/changePassword', async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/change-password', body);
    if (data.accessToken) setAccessToken(data.accessToken);
    return data.message as string;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

// Thunks that return the updated Overview. The key in `saving` comes from the action type,
// for example 'student/document/pending' -> saving.document
const savers = [startApplication, savePersonal, saveEducation, uploadPhoto, uploadDocument, removeDocument, payFees] as const;
const keyOf = (type: string) => type.split('/')[1] as keyof Saving;

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    clearFeedback(state) {
      state.feedback = null;
    },
    setFeedback(state, a: PayloadAction<Feedback>) {
      state.feedback = a.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchOverview.fulfilled, (s, a) => {
      s.overview = a.payload;
    })
      .addCase(fetchOverview.rejected, (s, a) => {
        s.feedback = { type: 'error', text: a.payload ?? 'Could not load your application' };
      })
      .addCase(fetchPhoto.fulfilled, (s, a) => {
        s.photoUrl = a.payload;
      })
      .addMatcher(isPending(...savers), (s, a) => {
        s.saving[keyOf(a.type)] = true;
        s.feedback = null;
      })
      .addMatcher(isFulfilled(...savers), (s, a) => {
        s.saving[keyOf(a.type)] = false;
        s.overview = a.payload as Overview;
      })
      .addMatcher(isRejected(...savers), (s, a) => {
        s.saving[keyOf(a.type)] = false;
        s.feedback = { type: 'error', text: (a.payload as string) || 'Something went wrong' };
      });
  },
});

export const { clearFeedback, setFeedback } = studentSlice.actions;
export default studentSlice.reducer;