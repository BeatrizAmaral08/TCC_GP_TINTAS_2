import {
  createContext,
  useEffect,
  useState,
} from "react";

export const ThemeContext = createContext();

const THEME_KEY = "gp-theme";

function getInitialTheme() {
  const storedTheme = localStorage.getItem(
    THEME_KEY
  );

  if (
    storedTheme === "light" ||
    storedTheme === "dark"
  ) {
    return storedTheme;
  }

  return "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    getInitialTheme
  );

  function toggleTheme() {
    setTheme((currentTheme) => {
      if (currentTheme === "light") {
        return "dark";
      }

      return "light";
    });
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    localStorage.setItem(
      THEME_KEY,
      theme
    );
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
