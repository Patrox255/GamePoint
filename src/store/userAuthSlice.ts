import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IUserAuthSliceState {
  expDate: number | undefined;
  isAdmin: boolean;
  login: string | undefined;
}

const initialState: IUserAuthSliceState = {
  expDate: undefined,
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
        expDate: number | undefined;
        isAdmin: boolean;
        login: string | undefined;
      }>
    ) => action.payload,
    resetAuthData: () => ({
      expDate: undefined,
      isAdmin: false,
      login: undefined,
    }),
  },
});

export const userAuthSliceActions = userAuthSlice.actions;

export default userAuthSlice.reducer;
