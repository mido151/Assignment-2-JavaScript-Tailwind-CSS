import { getLaptops } from "./api.js";
import { CATEGORY_LABELS, renderCards, renderSkeletons, showMessage, formatPrice, bindFavoriteButtons } from "./ui.js";
import { highestBy } from "./stats.js";
import { initHeader } from "./header.js";

const filtersForm = document.querySelector("#filters");
const searchInput = document.querySelector("#search");
const categorySelect = document.querySelector("#category");
const sortSelect = document.querySelector("#sort");
const maxPriceInput = document.querySelector("#max-price");
const maxPriceOutput = document.querySelector("#max-price-value");
const minRamSelect = document.querySelector("#min-ram");
const minBatteryInput = document.querySelector("#min-battery");
const minBatteryOutput = document.querySelector("#min-battery-value");
const laptopGrid = document.querySelector("#laptop-grid");
const resultCount = document.querySelector("#result-count");

const SORTERS = {
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "battery-desc": (a, b) => b.batteryHours - a.batteryHours,
  "battery-asc": (a, b) => a.batteryHours - b.batteryHours,
  "weight-asc": (a, b) => a.weightKg - b.weightKg,
  "weight-desc": (a, b) => b.weightKg - a.weightKg,
};

let allLaptops = [];

function readFilters() {
  return {
    query: searchInput.value.trim().toLowerCase(),
    category: categorySelect.value,
    maxPrice: Number(maxPriceInput.value),
    minRam: Number(minRamSelect.value),
    minBattery: Number(minBatteryInput.value),
    sort: sortSelect.value,
  };
}

function filterLaptops(laptops, filters) {
  return laptops.filter((laptop) => {
    const matchesQuery =
      laptop.name.toLowerCase().includes(filters.query) || laptop.brand.toLowerCase().includes(filters.query);
    const matchesCategory = filters.category === "all" || laptop.category === filters.category;
    return (
      matchesQuery &&
      matchesCategory &&
      laptop.price <= filters.maxPrice &&
      laptop.ramGB >= filters.minRam &&
      laptop.batteryHours >= filters.minBattery
    );
  });
}

function sortLaptops(laptops, sortKey) {
  const sorted = [...laptops];
  if (SORTERS[sortKey]) {
    sorted.sort(SORTERS[sortKey]);
  }
  return sorted;
}

function updateOutputs() {
  maxPriceOutput.textContent = formatPrice(Number(maxPriceInput.value));
  const minBattery = Number(minBatteryInput.value);
  minBatteryOutput.textContent = minBattery === 0 ? "Any" : `${minBattery} h or more`;
}

function updateCatalogue() {
  updateOutputs();
  const filters = readFilters();
  const results = sortLaptops(filterLaptops(allLaptops, filters), filters.sort);
  resultCount.textContent = `Showing ${results.length} of ${allLaptops.length} laptops`;

  if (results.length === 0) {
    showMessage(laptopGrid, {
      title: "No laptop matches",
      text: "Try a higher maximum price, a lower RAM or battery limit, or a different search word.",
    });
    return;
  }
  laptopGrid.removeAttribute("aria-busy");
  renderCards(laptopGrid, results);
}

function setUpFilters(laptops) {
  categorySelect.innerHTML += Object.entries(CATEGORY_LABELS)
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");

  const highestPrice = Math.ceil(highestBy(laptops, "price").price / 500) * 500;
  maxPriceInput.max = highestPrice;
  maxPriceInput.value = highestPrice;
  maxPriceInput.defaultValue = highestPrice;

  const categoryFromUrl = new URLSearchParams(window.location.search).get("category");
  if (CATEGORY_LABELS[categoryFromUrl]) {
    categorySelect.value = categoryFromUrl;
  }
}

async function initCatalogue() {
  initHeader();
  renderSkeletons(laptopGrid, 6);
  try {
    allLaptops = await getLaptops();
    setUpFilters(allLaptops);
    updateCatalogue();
  } catch (error) {
    resultCount.textContent = "No laptops loaded";
    showMessage(laptopGrid, { title: "Laptops could not load", text: error.message, tone: "error" });
  }
}

filtersForm.addEventListener("input", updateCatalogue);
filtersForm.addEventListener("submit", (event) => event.preventDefault());
filtersForm.addEventListener("reset", () => setTimeout(updateCatalogue));
bindFavoriteButtons(laptopGrid);
initCatalogue();
