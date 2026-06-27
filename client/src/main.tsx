import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root")!;

// If server prerendered content exists, hydrate it
// Otherwise do a fresh render (fallback)
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, <App />);
} else {
  createRoot(rootEl).render(<App />);
}
