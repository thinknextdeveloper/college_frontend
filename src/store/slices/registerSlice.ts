import { createAsyncThunk, createSlice, isRejected, PayloadAction } from '@reduxjs/toolkit';
import api, { errorMessage } from '@/lib/api';

export type Option = { id: number; name: string };
export type Feedback = { type: 'error' | 'success'; text: string } | null;

export type RegisterPayload = {
  programId: string;
  specializationId: string | null;
  candidateName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
};

type RegisterState = {
  programTypes: Option[];
  programs: Option[];
  specializations: Option[];
  otpSent: boolean;
  otpVerified: boolean;
  registered: boolean;
  loading: { otp: boolean; verify: boolean; submit: boolean };
  feedback: Feedback;
};

const initialState: RegisterState = {
  programTypes: [],
  programs: [],
  specializations: [],
  otpSent: false,
  otpVerified: false,
  registered: false,
  loading: { otp: false, verify: false, submit: false },
  feedback: null,
};

type Cfg = { rejectValue: string };

export const fetchProgramTypes = createAsyncThunk<Option[], void, Cfg>(
  'register/fetchProgramTypes',
  async (_, { rejectWithValue }) => {
    try {
      return (await api.get('/lookup/program-types')).data;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

export const fetchPrograms = createAsyncThunk<Option[], string, Cfg>(
  'register/fetchPrograms',
  async (programTypeId, { rejectWithValue }) => {
    try {
      return (await api.get('/lookup/programs', { params: { programTypeId } })).data;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

export const fetchSpecializations = createAsyncThunk<Option[], string, Cfg>(
  'register/fetchSpecializations',
  async (programId, { rejectWithValue }) => {
    try {
      return (await api.get('/lookup/specializations', { params: { programId } })).data;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

export const sendOtp = createAsyncThunk<string, string, Cfg>(
  'register/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      return (await api.post('/auth/send-otp', { email })).data.message;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

export const verifyOtp = createAsyncThunk<string, { email: string; otp: string }, Cfg>(
  'register/verifyOtp',
  async (body, { rejectWithValue }) => {
    try {
      await api.post('/auth/verify-otp', body);
      return 'Email verified successfully';
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

export const registerStudent = createAsyncThunk<string, RegisterPayload, Cfg>(
  'register/registerStudent',
  async (body, { rejectWithValue }) => {
    try {
      return (await api.post('/auth/register', body)).data.message;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    setFeedback(state, a: PayloadAction<Feedback>) {
      state.feedback = a.payload;
    },
    clearPrograms(state) {
      state.programs = [];
      state.specializations = [];
    },
    clearSpecializations(state) {
      state.specializations = [];
    },
    resetOtp(state) {
      state.otpSent = false;
      state.otpVerified = false;
    },
    resetRegister: () => initialState,
  },
  extraReducers: (b) => {
    b.addCase(fetchProgramTypes.fulfilled, (s, a) => {
      s.programTypes = a.payload;
    })
      .addCase(fetchPrograms.fulfilled, (s, a) => {
        s.programs = a.payload;
      })
      .addCase(fetchSpecializations.fulfilled, (s, a) => {
        s.specializations = a.payload;
      })
      // send OTP
      .addCase(sendOtp.pending, (s) => {
        s.loading.otp = true;
        s.feedback = null;
      })
      .addCase(sendOtp.fulfilled, (s, a) => {
        s.loading.otp = false;
        s.otpSent = true;
        s.feedback = { type: 'success', text: a.payload };
      })
      .addCase(sendOtp.rejected, (s) => {
        s.loading.otp = false;
      })
      // verify OTP
      .addCase(verifyOtp.pending, (s) => {
        s.loading.verify = true;
        s.feedback = null;
      })
      .addCase(verifyOtp.fulfilled, (s, a) => {
        s.loading.verify = false;
        s.otpVerified = true;
        s.feedback = { type: 'success', text: a.payload };
      })
      .addCase(verifyOtp.rejected, (s) => {
        s.loading.verify = false;
      })
      // register
      .addCase(registerStudent.pending, (s) => {
        s.loading.submit = true;
        s.feedback = null;
      })
      .addCase(registerStudent.fulfilled, (s, a) => {
        s.loading.submit = false;
        s.registered = true;
        s.feedback = { type: 'success', text: a.payload };
      })
      .addCase(registerStudent.rejected, (s) => {
        s.loading.submit = false;
      })
      // any failed call shows its error message
      .addMatcher(
        isRejected(
          fetchProgramTypes,
          fetchPrograms,
          fetchSpecializations,
          sendOtp,
          verifyOtp,
          registerStudent
        ),
        (s, a) => {
          s.feedback = { type: 'error', text: (a.payload as string) || 'Something went wrong' };
        }
      );
  },
});

export const { setFeedback, clearPrograms, clearSpecializations, resetOtp, resetRegister } =
  registerSlice.actions;
export default registerSlice.reducer;