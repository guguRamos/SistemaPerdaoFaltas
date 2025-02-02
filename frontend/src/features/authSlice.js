import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('ACCESS_TOKEN') || null,
  role: localStorage.getItem('user_role') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, token, role } = action.payload;

      state.user = { username: user };
      state.token = token;
      state.role = role;

      localStorage.setItem('user', JSON.stringify({ username: user }));
      localStorage.setItem('ACCESS_TOKEN', token);
      localStorage.setItem('user_role', role);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;

      localStorage.clear();
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
