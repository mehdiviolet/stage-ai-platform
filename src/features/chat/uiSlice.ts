import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { local } from "../../lib/storage/local";

type UIState = {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info";
  }>;
};

const savedTheme = local.get<"light" | "dark">("theme");

const initialState: UIState = {
  theme: savedTheme === "dark" ? "dark" : "light",
  sidebarOpen: true,
  notifications: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (s) => {
      s.theme = s.theme === "light" ? "dark" : "light";
      local.set("theme", s.theme);
    },
    toggleSidebar: (s) => {
      s.sidebarOpen = !s.sidebarOpen;
    },
    addNotification: (
      s,
      a: PayloadAction<{ message: string; type: "success" | "error" | "info" }>
    ) => {
      s.notifications.push({ id: crypto.randomUUID(), ...a.payload });
    },
    removeNotification: (s, a) => {
      s.notifications = s.notifications.filter((n) => n.id !== a.payload);
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  addNotification,
  removeNotification,
} = uiSlice.actions;
export default uiSlice.reducer;
