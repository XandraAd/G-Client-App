import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./admin/contexts/authContext/index.jsx";
import ReactModal from 'react-modal';
import "./index.css";
import App from "./App.jsx";

ReactModal.setAppElement('#root'); 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
       <App />
    </AuthProvider>
  </StrictMode>
);
