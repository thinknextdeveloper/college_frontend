import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { errorMessage, setAccessToken } from '@/lib/api';

export type Role = 'Student' | 'Admin' | 'SuperAdmin';
export type AuthUser = { id: number; email: string; mobile?: string; candidateName?: string; role: Role };

type AuthState = {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
};

const initialState: AuthState = { user: null, status: 'idle', error: null };

export const login = createAsyncThunk<
  AuthUser,
  { identifier?: string; email?: string; username?: string; mobile?: string; password: string },
  { rejectValue: string }
>('auth/login', async (body, { rejectWithValue }) => {
  try {
    const payload = {
      identifier: body.identifier || body.username || body.mobile || body.email,
      email: body.email || body.identifier || body.username || body.mobile,
      password: body.password,
    };
    const { data } = await api.post('/auth/login', payload);
    setAccessToken(data.accessToken);
    return data.user as AuthUser;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

// Call once when the app loads: uses the refresh cookie to restore the session
export const restoreSession = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/restore',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/refresh');
      setAccessToken(data.accessToken);
      return data.user as AuthUser;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    })
      .addCase(login.fulfilled, (s, a) => {
        s.status = 'authenticated';
        s.user = a.payload;
      })
      .addCase(login.rejected, (s, a) => {
        s.status = 'unauthenticated';
        s.error = a.payload ?? 'Login failed';
      })
      .addCase(restoreSession.pending, (s) => {
        s.status = 'loading';
      })
      .addCase(restoreSession.fulfilled, (s, a) => {
        s.status = 'authenticated';
        s.user = a.payload;
      })
      .addCase(restoreSession.rejected, (s) => {
        s.status = 'unauthenticated';
        s.user = null;
      })
      .addCase(logout.fulfilled, (s) => {
        s.status = 'unauthenticated';
        s.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
