import { authApi } from "@/features/auth/authApi";
import authReducer from "@/features/auth/authSlice";
import { boardsApi } from "@/features/boards/boardsApi";
import { categoriesApi } from "@/features/categories/categoriesApi";
import globalReducer from "@/features/global/globalSlice";
import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/es/storage";

const authPersistConfig = {
  key: "auth",
  storage,
};

const globalPersistConfig = {
  key: "global",
  storage,
  whitelist: ["activeBoardId", "boardSelectorDialog"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedGlobalReducer = persistReducer(
  globalPersistConfig,
  globalReducer,
);

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [boardsApi.reducerPath]: boardsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    auth: persistedAuthReducer,
    global: persistedGlobalReducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware, boardsApi.middleware, categoriesApi.middleware);
  },
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
