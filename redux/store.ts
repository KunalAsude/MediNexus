import { configureStore } from "@reduxjs/toolkit";
import doctorReducer from "./slice/doctorSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import hospitalReducer from "./slice/hospitalSlice";

const persistConfig = {
  key: "root",
  storage, // Stores data in localStorage
  whitelist: ["doctor"], // Persist only the `doctor` slice
};

const rootReducer = combineReducers({
  doctor: doctorReducer,
  hospital: hospitalReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
