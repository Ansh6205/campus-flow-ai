"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "campus-flow-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "system";
  }

  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (
    savedTheme === "light" ||
    savedTheme === "dark" ||
    savedTheme === "system"
  ) {
    return savedTheme;
  }

  return "system";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    return;
  }

  if (theme === "light") {
    root.classList.remove("dark");
    return;
  }

  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  root.classList.toggle("dark", prefersDark);
}

export default function ThemeController() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div
      className="
        fixed
        bottom-6
        right-6
        z-50
        flex
        items-center
        gap-1
        rounded-full
        border
        border-border
        bg-[var(--glass-bg)]
        p-1
        shadow-[var(--shadow-lg)]
        backdrop-blur-xl
      "
    >
      {/* Light */}
      <button
        type="button"
        onClick={() => changeTheme("light")}
        aria-label="Switch to light theme"
        aria-pressed={theme === "light"}
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-base
          transition-all
          duration-200
          ${
            theme === "light"
              ? "bg-primary text-white shadow-md"
              : "text-[var(--text-secondary)] hover:bg-primary-soft"
          }
        `}
      >
        ☀️
      </button>

      {/* System */}
      <button
        type="button"
        onClick={() => changeTheme("system")}
        aria-label="Use system theme"
        aria-pressed={theme === "system"}
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-base
          transition-all
          duration-200
          ${
            theme === "system"
              ? "bg-primary text-white shadow-md"
              : "text-[var(--text-secondary)] hover:bg-primary-soft"
          }
        `}
      >
        🖥️
      </button>

      {/* Dark */}
      <button
        type="button"
        onClick={() => changeTheme("dark")}
        aria-label="Switch to dark theme"
        aria-pressed={theme === "dark"}
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-base
          transition-all
          duration-200
          ${
            theme === "dark"
              ? "bg-primary text-white shadow-md"
              : "text-[var(--text-secondary)] hover:bg-primary-soft"
          }
        `}
      >
        🌙
      </button>
    </div>
  );
}