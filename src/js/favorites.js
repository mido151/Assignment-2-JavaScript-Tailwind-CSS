import { getLaptops } from "./api.js";
import { getFavorites, clearFavorites } from "./storage.js";
import { renderCards, renderSkeletons, showMessage, formatPrice, bindFavoriteButtons } from "./ui.js";
import { sumBy, averageBy } from "./stats.js";
import { initHeader } from "./header.js";

const favoritesGrid = document.querySelector("#favorites-grid");
const clearButton = document.querySelector("#clear-favorites");

let allLaptops = [];

const getSavedLaptops = () => allLaptops.filter((laptop) => getFavorites().includes(laptop.id));

function renderSummary(savedLaptops) {
  document.querySelector("#favorites-count").textContent = savedLaptops.length;
  document.querySelector("#favorites-total").textContent = formatPrice(sumBy(savedLaptops, "price"));
  document.querySelector("#favorites-average").textContent = formatPrice(averageBy(savedLaptops, "price"));
}

function renderFavorites() {
  const savedLaptops = getSavedLaptops();
  renderSummary(savedLaptops);
  clearButton.disabled = savedLaptops.length === 0;

  if (savedLaptops.length === 0) {
    showMessage(favoritesGrid, {
      title: "No favorites yet",
      text: "Tap Save on any laptop card or details page and it will appear here, even after a reload.",
      linkHref: "laptops.html",
      linkText: "Browse laptops",
    });
    return;
  }
  favoritesGrid.removeAttribute("aria-busy");
  renderCards(favoritesGrid, savedLaptops, { off: "Save", on: "Remove" });
}

async function initFavorites() {
  initHeader();
  renderSkeletons(favoritesGrid, Math.max(1, Math.min(getFavorites().length, 6)));
  try {
    allLaptops = await getLaptops();
    renderFavorites();
  } catch (error) {
    clearButton.disabled = true;
    showMessage(favoritesGrid, { title: "Favorites could not load", text: error.message, tone: "error" });
  }
}

clearButton.addEventListener("click", () => {
  if (confirm("Remove all saved laptops from your favorites?")) {
    clearFavorites();
    renderFavorites();
  }
});
bindFavoriteButtons(favoritesGrid, renderFavorites);
initFavorites();
