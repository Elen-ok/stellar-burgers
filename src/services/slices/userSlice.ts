import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  loginUserApi,
  registerUserApi,
  getUserApi,
  updateUserApi,
  logoutApi,
} from '../../utils/burger-api';
import { TUser } from '../../utils/types';

interface UserState {
  user: TUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await loginUserApi({ email, password });
    // Сохраняем токен в localStorage
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken.replace('Bearer ', ''));
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response.user;
  }
);

export const register = createAsyncThunk(
  'user/register',
  async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const response = await registerUserApi({ email, password, name });
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken.replace('Bearer ', ''));
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response.user;
  }
);

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async () => {
    const response = await getUserApi();
    return response.user;
  }
);

export const updateUserData = createAsyncThunk(
  'user/updateUserData',
  async ({ name, email, password }: { name?: string; email?: string; password?: string }) => {
    const response = await updateUserApi({ name, email, password });
    return response.user;
  }
);

export const logout = createAsyncThunk(
  'user/logout',
  async () => {
    await logoutApi();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка входа';
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(updateUserData.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
