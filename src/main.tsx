// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import "./app/utils/initCart";
import "./app/utils/initCustomRequests";

createRoot(document.getElementById("root")!).render(<App />);
