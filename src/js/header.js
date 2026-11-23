import { getFavorites, getTheme, saveTheme } from "./storage.js";

const THEME_NAMES = {
  saver: "Battery Saver",
  performance: "Performance",
};

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const themeSwitch = document.querySelector("#theme-switch");
  themeSwitch.setAttribute("aria-checked", theme === "performance");
  document.querySelector("#theme-label").textContent = THEME_NAMES[theme];
}

function initThemeSwitch() {
  applyTheme(getTheme());
  document.querySelector("#theme-switch").addEventListener("click", () => {
    const nextTheme = getTheme() === "performance" ? "saver" : "performance";
    saveTheme(nextTheme);
    applyTheme(nextTheme);
  });
}

function initMenuToggle() {
  const menuButton = document.querySelector("#menu-toggle");
  const nav = document.querySelector("#site-nav");
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", !isOpen);
    nav.classList.toggle("hidden", isOpen);
    nav.classList.toggle("flex", !isOpen);
  });
}

export function updateFavoriteCount() {
  const count = getFavorites().length;
  document.querySelectorAll("[data-fav-count]").forEach((badge) => {
    badge.textContent = count;
  });
}

export function initHeader() {
  initThemeSwitch();
  initMenuToggle();
  updateFavoriteCount();
  document.addEventListener("favorites-change", updateFavoriteCount);
}
