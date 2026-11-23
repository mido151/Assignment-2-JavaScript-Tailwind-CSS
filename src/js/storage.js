const FAVORITES_KEY = "laptopFinder.favorites";
const COMPARE_KEY = "laptopFinder.compare";
const THEME_KEY = "laptopFinder.theme";

export const MAX_COMPARE = 4;

function readValue(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return saved ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function saveValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  document.dispatchEvent(new CustomEvent("favorites-change"));
}

export const getFavorites = () => readValue(FAVORITES_KEY, []);

export const isFavorite = (id) => getFavorites().includes(id);

export const getCompare = () => readValue(COMPARE_KEY, []).filter((id) => isFavorite(id));

export function addFavorite(id) {
  if (isFavorite(id)) {
    return;
  }
  saveValue(FAVORITES_KEY, [...getFavorites(), id]);
  const compareIds = getCompare();
  if (compareIds.length < MAX_COMPARE) {
    saveValue(COMPARE_KEY, [...compareIds, id]);
  }
}

export function removeFavorite(id) {
  saveValue(FAVORITES_KEY, getFavorites().filter((savedId) => savedId !== id));
  saveValue(COMPARE_KEY, getCompare().filter((savedId) => savedId !== id));
}

export function toggleFavorite(id) {
  if (isFavorite(id)) {
    removeFavorite(id);
    return false;
  }
  addFavorite(id);
  return true;
}

export function clearFavorites() {
  saveValue(FAVORITES_KEY, []);
  saveValue(COMPARE_KEY, []);
}

export function addToCompare(id) {
  const compareIds = getCompare();
  if (compareIds.includes(id)) {
    return { ok: true };
  }
  if (compareIds.length >= MAX_COMPARE) {
    return { ok: false, message: `You can compare up to ${MAX_COMPARE} laptops. Remove one first.` };
  }
  saveValue(COMPARE_KEY, [...compareIds, id]);
  return { ok: true };
}

export function removeFromCompare(id) {
  saveValue(COMPARE_KEY, getCompare().filter((savedId) => savedId !== id));
}

export const getTheme = () => readValue(THEME_KEY, "saver");

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
}
