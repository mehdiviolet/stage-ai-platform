import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./lib/api/interceptors";
// import { setupMockInterceptor } from "./lib/api/mock/mockInterceptor";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import { ThemeWrapper } from "./components/ThemeWrapper.tsx";

// Setup mock DOPO interceptors normali
// setupMockInterceptor();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeWrapper>
        <App />
      </ThemeWrapper>
    </Provider>
  </StrictMode>
);
