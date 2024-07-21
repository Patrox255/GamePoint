import { configureStore } from "@reduxjs/toolkit";
import mainSearchBarSlice from "./mainSearchBarSlice";
import userAuthSlice from "./userAuthSlice";

const store = configureStore({
  reducer: { mainSearchBarSlice, userAuthSlice },
});

export default store;

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
