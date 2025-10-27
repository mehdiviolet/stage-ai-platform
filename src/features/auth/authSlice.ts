import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authApi } from "../chat/api";

// Type per lo state
type AuthState = {
  user: { id: number; email: string; fullName: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

// AsyncThunk per LOGIN (chiama POST /auth/login)
export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => {
    const { data } = await authApi.login(payload);
    return data; // Ritorna { token, user }
  }
);

// AsyncThunk per REGISTER (chiama POST /auth/register)
export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: { email: string; password: string; fullName: string }) => {
    const { data } = await authApi.register(payload);
    return data; // Ritorna { success, message, user }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (s) => {
      s.user = null;
      s.token = null;
      s.isAuthenticated = false;
    },
  },
  extraReducers: (b) => {
    // LOGIN
    b.addCase(loginUser.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })
      // REGISTER
      .addCase(registerUser.pending, (s) => {
        s.loading = true;
        s.error = undefined;
      })
      .addCase(registerUser.fulfilled, (s) => {
        s.loading = false;
        // Non fa login automatico, l'utente deve essere attivato dall'admin
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
