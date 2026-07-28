import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api";
import API from "./authApi";

interface User {
  id: string;
  name?: string;
  email: string;
  verified?: boolean;
  role?: "Admin" | "User";
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  isAuthenticated: boolean;
  authChecked: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  message: null,
  isAuthenticated: false,
  authChecked: false,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await API.post("/register", data);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Register failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await API.post("/login", data);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Login failed",
      );
    }
  },
);

export const verifyUser = createAsyncThunk(
  "auth/verifyUser",
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await API.post("/isverify", data);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Verification failed",
      );
    }
  },
);

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      await API.post("/refresh-token");
      const res = await api.get("/users/me");
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Session expired",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.post("/logout");
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Logout failed",
      );
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: { email: string }, { rejectWithValue }) => {
    try {
      const res = await API.post("/forgot-password", data);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Request failed",
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await API.post("/reset-password", data);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Reset failed",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthMessage: (state) => {
      state.error = null;
      state.message = null;
    },
    updateCurrentUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.authChecked = true;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(verifyUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.message = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.authChecked = true;
      })

      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthMessage, updateCurrentUser } = authSlice.actions;
export default authSlice.reducer;
