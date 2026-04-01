import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface GlobalState {
  createBoardDialog: {
    isOpen: boolean;
  };
  boardSelectorDialog: {
    isOpen: boolean;
  };
  cardDetailDialog: {
    isOpen: boolean;
    ticketId: string | null;
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
  cardDetailDialog: {
    isOpen: false,
    ticketId: null,
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
    openCardDetail: (state, action: PayloadAction<string>) => {
      state.cardDetailDialog.isOpen = true;
      state.cardDetailDialog.ticketId = action.payload;
    },
    closeCardDetail: (state) => {
      state.cardDetailDialog.isOpen = false;
      state.cardDetailDialog.ticketId = null;
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
  openCardDetail,
  closeCardDetail,
  setActiveBoard,
} = globalSlice.actions;

export default globalSlice.reducer;
