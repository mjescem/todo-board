import { createSlice } from "@reduxjs/toolkit";

interface GlobalState {
  createBoardDialog: {
    isOpen: boolean;
  };
}

const initialState: GlobalState = {
  createBoardDialog: {
    isOpen: false,
  },
};

const globalSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCreateBoardDialog: (state) => {
      state.createBoardDialog.isOpen = true;
    },
    closeCreateBoardDialog: (state) => {
      state.createBoardDialog.isOpen = false;
    },
  },
});

export const { openCreateBoardDialog, closeCreateBoardDialog } = globalSlice.actions;

export default globalSlice.reducer;
