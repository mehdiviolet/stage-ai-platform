import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { local } from "../../lib/storage/local";

type UIState = {
  theme: "light" | "dark";
  language: "en" | "it";
  sidebarOpen: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>;
};

const initialState: UIState = {
  theme: (local.get<string>("theme") as "light" | "dark") || "light",
  language: (local.get<string>("language") as "en" | "it") || "it",
  sidebarOpen: true,
  notifications: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (s) => {
      s.theme = s.theme === "light" ? "dark" : "light";
    },
    toggleSidebar: (s) => {
      s.sidebarOpen = !s.sidebarOpen;
    },
    addNotification: (
      s,
      a: PayloadAction<{
        message: string;
        type: "success" | "error" | "warning" | "info";
      }>
    ) => {
      s.notifications.push({ id: crypto.randomUUID(), ...a.payload });
    },
    removeNotification: (s, a: PayloadAction<string>) => {
      s.notifications = s.notifications.filter((n) => n.id !== a.payload);
    },
    setLanguage: (s, a: PayloadAction<"it" | "en">) => {
      s.language = a.payload;
    },
    resetSettings: (s) => {
      s.theme = "light";
      s.language = "it";
      local.del("theme");
      local.del("language");
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  addNotification,
  removeNotification,
  setLanguage,
  resetSettings,
} = uiSlice.actions;
export default uiSlice.reducer;
