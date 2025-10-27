import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatPage from "../pages/ChatPage";
import LoginPage from "../pages/LoginPage";
import HistoryPage from "../pages/HistoryPage";
import SettingsPage from "../pages/SettingsPage";
import { AppLayout } from "../components/layout/AppLayout";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <ChatPage />,
      },
      {
        path: "/chat", // <-- AGGIUNGI QUESTA
        element: <ChatPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/history",
        element: <HistoryPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
