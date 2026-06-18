/**
 * Redux store. Feature modules can extend the app state by adding their slice
 * reducer to the `featureReducers` map below (or a feature agent can create a
 * `features/<section>/slice.ts` and register it here). The `auth` slice mirrors
 * AuthContext for components that prefer Redux.
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { Reducer } from '@reduxjs/toolkit';
import authReducer from './authSlice';

/**
 * Slice registry for feature modules. Add entries like:
 *   workOrders: workOrdersReducer,
 * Kept loosely typed so feature agents can extend without touching call sites.
 */
const featureReducers: Record<string, Reducer> = {};

const rootReducer = combineReducers({
  auth: authReducer,
  ...featureReducers,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
