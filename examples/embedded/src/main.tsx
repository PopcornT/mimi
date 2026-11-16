import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router";
import { DocsApplication } from "@popcornt/mimi/react-router";
import data from "virtual:mimi/docs";
import "@carbon/styles/css/styles.css";
import "./host.css";
import "@popcornt/mimi/layout.css";
function App() {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [locale, setLocale] = useState("zh-TW");
  return (
    <BrowserRouter>
      <output hidden id="host-settings">
        {theme}/{locale}
      </output>
      <Routes>
        <Route
          path="/docs/*"
          element={
            <DocsApplication
              data={data}
              locale={locale}
              themePreference={theme}
              onThemeChange={setTheme}
              onLocaleChange={setLocale}
            />
          }
        />
        <Route
          path="/"
          element={
            <main>
              <div className="markdown-body">
                <h2>Host renderer</h2>
              </div>
              <Link to="/docs/grade-appeal">Docs</Link>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
