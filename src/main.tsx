import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { AlertProvider } from "./modules/alerts/AlertProvider.tsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AlertProvider>
          <AppWrapper>
            <App />
            <Toaster position="top-right" />
          </AppWrapper>
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
