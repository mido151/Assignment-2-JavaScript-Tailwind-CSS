import { getLaptops } from "./api.js";
import { getFavorites, getCompare, addToCompare, removeFromCompare, MAX_COMPARE } from "./storage.js";
import { showMessage } from "./ui.js";
import { buildCompareTable } from "./compare.js";
import { initHeader } from "./header.js";

const pickList = document.querySelector("#pick-list");
const pickCount = document.querySelector("#pick-count");
const pickMessage = document.querySelector("#pick-message");
const compareArea = document.querySelector("#compare-area");

let allLaptops = [];

const getFavoriteLaptops = () => allLaptops.filter((laptop) => getFavorites().includes(laptop.id));

function renderPicker(favoriteLaptops) {
  const selectedIds = getCompare();
  pickCount.textContent = `${selectedIds.length} of ${MAX_COMPARE}`;
  pickList.innerHTML = favoriteLaptops
    .map((laptop) => `
      <label class="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-line bg-surface px-3 py-1.5 text-sm font-semibold transition hover:border-ink has-checked:border-ink has-checked:bg-accent has-checked:text-accent-ink has-focus-visible:outline-3 has-focus-visible:outline-accent-text">
        <input type="checkbox" value="${laptop.id}" ${selectedIds.includes(laptop.id) ? "checked" : ""}
          class="size-4 rounded border-line bg-surface text-ink focus:ring-0 focus:ring-offset-0">
        ${laptop.name}
      </label>`)
    .join("");
}

function renderComparison() {
  const favoriteLaptops = getFavoriteLaptops();
  if (favoriteLaptops.length === 0) {
    pickCount.textContent = `0 of ${MAX_COMPARE}`;
    pickList.innerHTML = `<p class="text-sm text-muted">You have no favorites yet.</p>`;
    showMessage(compareArea, {
      title: "Nothing to compare yet",
      text: "Save at least two laptops as favorites, then come back here to see them side by side.",
      linkHref: "laptops.html",
      linkText: "Browse laptops",
    });
    return;
  }

  renderPicker(favoriteLaptops);
  const selectedLaptops = favoriteLaptops.filter((laptop) => getCompare().includes(laptop.id));
  if (selectedLaptops.length < 2) {
    showMessage(compareArea, {
      title: "Pick at least two laptops",
      text: "Tick two to four of your favorites above to build the comparison table.",
    });
    return;
  }
  compareArea.innerHTML = buildCompareTable(selectedLaptops);
}

pickList.addEventListener("change", (event) => {
  const checkbox = event.target;
  const id = Number(checkbox.value);
  pickMessage.textContent = "";

  if (!checkbox.checked) {
    removeFromCompare(id);
  } else {
    const result = addToCompare(id);
    if (!result.ok) {
      checkbox.checked = false;
      pickMessage.textContent = result.message;
      return;
    }
  }
  renderComparison();
});

async function initCompare() {
  initHeader();
  compareArea.innerHTML = `<div class="h-80 animate-pulse rounded-2xl bg-raised" aria-hidden="true"></div>`;
  try {
    allLaptops = await getLaptops();
    renderComparison();
  } catch (error) {
    pickList.innerHTML = "";
    showMessage(compareArea, { title: "Comparison could not load", text: error.message, tone: "error" });
  }
}

initCompare();
