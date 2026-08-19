"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [light, setLight] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("signal-lab-theme");
    const next = saved === "dark" || saved === "light" ? saved : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.dataset.theme = next;
    setLight(next === "light");
  }, []);
  function toggle() {
    const next = light ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("signal-lab-theme", next);
    setLight(next === "light");
  }
  return <button className="theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${light ? "dark" : "light"} mode`} title={`Switch to ${light ? "dark" : "light"} mode`}>{light ? <Moon aria-hidden="true" size={17} /> : <Sun aria-hidden="true" size={17} />}</button>;
}
