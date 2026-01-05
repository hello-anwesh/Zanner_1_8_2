import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";


// Protocol Redirect Fix for YouTube Embeds
// In production, Tauri serves from tauri:// or asset:// which blocks YouTube.
// We redirect to the local HTTP server we started on port 1421.
if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
  // Only redirect if we are not already on http (dev is http, prod is tauri/asset)
  // and if we are not in some other weird state.
  // We assume the plugin is running on 1421 as configured in lib.rs
  window.location.href = 'http://localhost:1421';
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
