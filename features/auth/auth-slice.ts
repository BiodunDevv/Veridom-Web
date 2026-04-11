import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { AuthUser } from "@/lib/api/types"

export type AuthState = {
  initialized: boolean
  user: AuthUser | null
  redirectPath: string | null
  lastErrorCode: string | null
}

const initialState: AuthState = {
  initialized: false,
  user: null,
  redirectPath: null,
  lastErrorCode: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload
      state.lastErrorCode = null
    },
    clearAuthState: (state) => {
      state.user = null
      state.lastErrorCode = null
      state.redirectPath = null
      state.initialized = true
    },
    setAuthInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload
    },
    setRedirectPath: (state, action: PayloadAction<string | null>) => {
      state.redirectPath = action.payload
    },
    setAuthErrorCode: (state, action: PayloadAction<string | null>) => {
      state.lastErrorCode = action.payload
    },
  },
})

export const {
  clearAuthState,
  setAuthErrorCode,
  setAuthInitialized,
  setAuthUser,
  setRedirectPath,
} = authSlice.actions

export const authReducer = authSlice.reducer
