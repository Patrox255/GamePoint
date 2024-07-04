import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IMainSearchBarState {
  searchTerm: string;
}
const initialState: IMainSearchBarState = {
  searchTerm: "",
};

const mainSearchBarSlice = createSlice({
  name: "mainSearchBarSlice",
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
  },
});

export const actions = mainSearchBarSlice.actions;
export default mainSearchBarSlice.reducer;
