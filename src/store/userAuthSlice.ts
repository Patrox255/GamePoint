import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IUserAuthSliceState {
  isAdmin: boolean;
  login: string | undefined;
  isLoading: boolean;
}

const initialState: IUserAuthSliceState = {
  isAdmin: false,
  login: undefined,
  isLoading: false,
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
    ) => ({ ...action.payload, isLoading: false }),
    resetAuthData: () => ({
      isAdmin: false,
      login: undefined,
      isLoading: false,
    }),
    setIsFetching: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const userAuthSliceActions = userAuthSlice.actions;

export default userAuthSlice.reducer;
