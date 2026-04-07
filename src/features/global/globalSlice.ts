import { createSlice } from "@reduxjs/toolkit";

interface GlobalState {
  createBoardDialog: {
    isOpen: boolean;
  };
  boardSelectorDialog: {
    isOpen: boolean;
  };
}

const initialState: GlobalState = {
  createBoardDialog: {
    isOpen: false,
  },
  boardSelectorDialog: {
    isOpen: false,
  },
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    openCreateBoardDialog: (state) => {
      state.createBoardDialog.isOpen = true;
    },
    closeCreateBoardDialog: (state) => {
      state.createBoardDialog.isOpen = false;
    },
    openBoardSelectorDialog: (state) => {
      state.boardSelectorDialog.isOpen = true;
    },
    closeBoardSelectorDialog: (state) => {
      state.boardSelectorDialog.isOpen = false;
    },
  },
});

export const {
  openCreateBoardDialog,
  closeCreateBoardDialog,
  openBoardSelectorDialog,
  closeBoardSelectorDialog,
} = globalSlice.actions;

export default globalSlice.reducer;
