import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IUserAuthSliceState {
  isAdmin: boolean;
  login: string | undefined;
  isLoading: boolean;
  ordersAmount: number;
}

const initialState: IUserAuthSliceState = {
  isAdmin: false,
  login: undefined,
  isLoading: false,
  ordersAmount: 0,
};

const userAuthSlice = createSlice({
  name: "userAuthSlice",
  initialState,
  reducers: {
    setAuthData: (
      _,
      action: PayloadAction<Omit<IUserAuthSliceState, "isLoading">>
    ) => ({ ...action.payload, isLoading: false }),
    resetAuthData: () => ({
      isAdmin: false,
      login: undefined,
      isLoading: false,
      ordersAmount: 0,
    }),
    setIsFetching: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const userAuthSliceActions = userAuthSlice.actions;

export default userAuthSlice.reducer;
