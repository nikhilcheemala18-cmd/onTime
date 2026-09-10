import { createSlice } from '@reduxjs/toolkit'
import { clearStoredSession, getStoredSession, storeSession } from '../../lib/authStorage.js'

const storedSession = getStoredSession()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedSession?.user || null,
    token: storedSession?.token || null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      storeSession(action.payload)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      clearStoredSession()
    },
  },
})

export const { logout, setCredentials } = authSlice.actions
export default authSlice.reducer

