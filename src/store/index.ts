import { configureStore } from "@reduxjs/toolkit";
import mainSearchBarSlice from "./mainSearchBarSlice";
import userAuthSlice from "./userAuthSlice";
import cartSlice from "./cartSlice";
import notificationSystemSlice from "./UI/notificationSystemSlice";

const store = configureStore({
  reducer: {
    mainSearchBarSlice,
    userAuthSlice,
    cartSlice,
    notificationSystem: notificationSystemSlice,
  },
  devTools: { actionsDenylist: "REFRESH_NOTIFICATIONS" },
});

export default store;

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
