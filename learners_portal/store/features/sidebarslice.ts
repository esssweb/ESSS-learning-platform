import { createSlice } from "@reduxjs/toolkit";

export type SidebarSlice = {
  value: boolean;
};

const initialState: SidebarSlice = {
  value: true,
};

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.value = !state.value;
    },
  },
});

export const { toggleSidebar } = sidebarSlice.actions;

export default sidebarSlice.reducer;
