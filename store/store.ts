import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slice";
import sidebarReducer from "./features/sidebarslice";
import { esssApi } from "./api";
import { authApi } from "./api/auth";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    isSidebar: sidebarReducer,
    [esssApi.reducerPath]: esssApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(esssApi.middleware, authApi.middleware),

});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
