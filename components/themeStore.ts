"use client";

import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

/**
 * `data-theme` on <html> is the source of truth — the pre-paint script in the
 * root layout sets it before React exists. Exposing it as a
 * `useSyncExternalStore` source keeps React reading the DOM rather than trying
 * to own state it did not set.
 */
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function hasExplicitChoice(): boolean {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark";
  } catch {
    return false;
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  const query = window.matchMedia("(prefers-color-scheme: dark)");

  // Follow the system only while the visitor has made no explicit choice.
  const onSystemChange = () => {
    if (hasExplicitChoice()) return;
    document.documentElement.setAttribute("data-theme", systemTheme());
    emit();
  };

  // Keep other tabs in step when the choice changes.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    const next = event.newValue === "dark" || event.newValue === "light"
      ? event.newValue
      : systemTheme();
    document.documentElement.setAttribute("data-theme", next);
    emit();
  };

  query.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    query.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

/** The server cannot know the visitor's theme, so the button renders inert. */
export function getServerSnapshot(): null {
  return null;
}

export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked; the theme still applies to this page view.
  }
  emit();
}
