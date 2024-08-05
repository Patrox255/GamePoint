import { configureStore } from "@reduxjs/toolkit";
import mainSearchBarSlice from "./mainSearchBarSlice";
import userAuthSlice from "./userAuthSlice";
import cartSlice from "./cartSlice";

const store = configureStore({
  reducer: { mainSearchBarSlice, userAuthSlice, cartSlice },
});

export default store;

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
