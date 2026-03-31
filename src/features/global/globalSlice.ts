import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface GlobalState {
  createBoardDialog: {
    isOpen: boolean;
  };
  boardSelectorDialog: {
    isOpen: boolean;
  };
  activeBoardId: string | null;
}

const initialState: GlobalState = {
  createBoardDialog: {
    isOpen: false,
  },
  boardSelectorDialog: {
    isOpen: false,
  },
  activeBoardId: null,
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
    setActiveBoard: (state, action: PayloadAction<string>) => {
      state.activeBoardId = action.payload;
    },
  },
});

export const {
  openCreateBoardDialog,
  closeCreateBoardDialog,
  openBoardSelectorDialog,
  closeBoardSelectorDialog,
  setActiveBoard,
} = globalSlice.actions;

export default globalSlice.reducer;
