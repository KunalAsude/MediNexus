import { configureStore } from "@reduxjs/toolkit";
import doctorReducer from "./slice/doctorSlice";
import hospitalReducer from "./slice/hospitalSlice";
import storage from "redux-persist/lib/storage"; // Uses localStorage
import { persistReducer, persistStore, createTransform } from "redux-persist";
import { combineReducers } from "redux";

// ✅ Fix: Transform to prevent JSON parsing issues
const transformCircular = createTransform(
  (inboundState) => inboundState, // Store state as is
  (outboundState) => {
    try {
      return typeof outboundState === "string"
        ? JSON.parse(outboundState) 
        : outboundState;
    } catch (e) {
      console.warn("Redux Persist Parsing Error:", e);
      return outboundState; // Return as is if parsing fails
    }
  }
);

const persistConfig = {
  key: "root",
  storage,
  transforms: [transformCircular], // ✅ Applies to all slices
};

const rootReducer = combineReducers({
  doctor: doctorReducer,
  hospital: hospitalReducer,
  // Add more reducers, they will persist automatically
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Avoid Redux warnings
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
