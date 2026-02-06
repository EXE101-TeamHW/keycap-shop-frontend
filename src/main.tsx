
  // src/main.tsx
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import "./app/utils/initCart";

  createRoot(document.getElementById("root")!).render(<App />);
  