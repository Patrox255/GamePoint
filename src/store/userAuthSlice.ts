import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IUserAuthSliceState {
  isAdmin: boolean;
  login: string | undefined;
}

const initialState: IUserAuthSliceState = {
  isAdmin: false,
  login: undefined,
};

const userAuthSlice = createSlice({
  name: "userAuthSlice",
  initialState,
  reducers: {
    setAuthData: (
      _,
      action: PayloadAction<{
        isAdmin: boolean;
        login: string | undefined;
      }>
    ) => action.payload,
    resetAuthData: () => ({
      isAdmin: false,
      login: undefined,
    }),
  },
});

export const userAuthSliceActions = userAuthSlice.actions;

export default userAuthSlice.reducer;
