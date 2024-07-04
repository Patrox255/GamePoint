import { configureStore } from "@reduxjs/toolkit";
import mainSearchBarSlice from "./mainSearchBarSlice";

const store = configureStore({ reducer: { mainSearchBarSlice } });

export default store;

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
