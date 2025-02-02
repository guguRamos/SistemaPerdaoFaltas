import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('ACCESS_TOKEN') || null,
  role: localStorage.getItem('user_role') || '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role;

      // Armazena no localStorage
      localStorage.setItem('ACCESS_TOKEN', token);
      localStorage.setItem('user_role', role);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = '';

      // Limpa localStorage
      localStorage.clear();
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
