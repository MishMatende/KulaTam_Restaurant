import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "./styles.css";
import App from "./App";
import { MenuProvider } from "./context/MenuContext";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MenuProvider>
          <App />
        </MenuProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
