import { getLaptops } from "./api.js";
import { getFavorites } from "./storage.js";
import { CATEGORY_LABELS, renderCard, renderSkeletons, showMessage, formatPrice, bindFavoriteButtons } from "./ui.js";
import { averageBy, lowestBy, highestBy } from "./stats.js";
import { initHeader } from "./header.js";

const statsList = document.querySelector("#stats");
const picksGrid = document.querySelector("#picks");
const missionsGrid = document.querySelector("#missions");

const MISSIONS = [
  { category: "ultrabook", tagline: "Carry it all day", icon: "M4 6h16v10H4zM2 19h20" },
  { category: "gaming", tagline: "Play after class", icon: "M6 9h12a4 4 0 0 1 0 8l-3-2H9l-3 2a4 4 0 0 1 0-8ZM8 12v3M6.5 13.5h3M16 13h.01M18 14h.01" },
  { category: "2-in-1", tagline: "Write your notes", icon: "M4 20l4-1 11-11-3-3L5 16l-1 4ZM14 7l3 3" },
  { category: "creator", tagline: "Make big things", icon: "M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-1.2-1-1.4-1-2.4 0-.9.7-1.5 1.6-1.5H16a5 5 0 0 0 5-5c0-4.1-4-7.5-9-7.5ZM7.5 11h.01M10 7.5h.01M14.5 7.5h.01" },
  { category: "budget", tagline: "Smart on money", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM14.5 9.5c-.5-1-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.1 0-2-.5-2.5-1.5M12 6.5v11" },
];

function setStat(name, value) {
  document.querySelector(`[data-stat="${name}"]`).textContent = value;
}

const showFavoriteCount = () => setStat("favorites", getFavorites().length);

function renderStats(laptops) {
  const averageBattery = averageBy(laptops, "batteryHours");
  setStat("count", laptops.length);
  setStat("lowest", formatPrice(lowestBy(laptops, "price").price));
  setStat("battery", `${averageBattery.toFixed(1)} h`);
  showFavoriteCount();
  statsList.removeAttribute("aria-busy");

  const filledSegments = Math.round((averageBattery / highestBy(laptops, "batteryHours").batteryHours) * 12);
  document.querySelector("#battery-bar").innerHTML = Array.from({ length: 12 }, (item, index) =>
    `<span class="h-3 flex-1 rounded-sm ${index < filledSegments ? "bg-perf-accent" : "bg-perf-line"}"></span>`
  ).join("");
}

function renderBrands(laptops) {
  const brands = [...new Set(laptops.map((laptop) => laptop.brand))];
  const brandItems = brands
    .map((brand) => `<span class="flex items-center gap-6 pr-6">${brand}<span class="text-xl" aria-hidden="true">✦</span></span>`)
    .join("");
  document.querySelector("#brand-track").innerHTML = `
    <span class="flex">${brandItems}</span>
    <span class="flex" aria-hidden="true">${brandItems}</span>`;
}

function renderMissions(laptops) {
  missionsGrid.innerHTML = MISSIONS.map((mission) => {
    const matches = laptops.filter((laptop) => laptop.category === mission.category);
    const fromPrice = lowestBy(matches, "price").price;
    return `
      <a href="laptops.html?category=${mission.category}" class="group flex min-h-44 flex-col rounded-2xl border-2 border-line bg-surface p-4 transition duration-300 hover:-translate-y-1 hover:border-ink hover:bg-accent hover:text-accent-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-text motion-reduce:transition-none">
        <span class="grid size-11 place-items-center rounded-xl bg-raised text-accent-text transition group-hover:bg-accent-ink group-hover:text-accent">
          <svg viewBox="0 0 24 24" class="size-6 fill-none stroke-current stroke-2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${mission.icon}"/></svg>
        </span>
        <span class="mt-4 text-lg font-bold">${CATEGORY_LABELS[mission.category]}</span>
        <span class="text-sm text-muted group-hover:text-accent-ink">${mission.tagline}</span>
        <span class="mt-auto pt-4 font-mono text-xs font-semibold">${matches.length} laptops · from ${fromPrice.toLocaleString("en-US")}</span>
      </a>`;
  }).join("");
}

function renderPicks(laptops) {
  const picks = [
    { label: "Lowest price", laptop: lowestBy(laptops, "price") },
    { label: "Longest battery", laptop: highestBy(laptops, "batteryHours") },
    { label: "Lightest to carry", laptop: lowestBy(laptops, "weightKg") },
  ];
  picksGrid.removeAttribute("aria-busy");
  picksGrid.innerHTML = picks
    .map(({ label, laptop }) => `
      <div class="grid grid-rows-[auto_1fr] gap-3">
        <p class="text-sm font-bold"><span class="mr-2 inline-block size-2 rounded-full bg-accent-text"></span>${label}</p>
        ${renderCard(laptop)}
      </div>`)
    .join("");
}

function linkDetailsPage(laptops) {
  const batteryChampion = highestBy(laptops, "batteryHours");
  document.querySelector("#details-link").href = `details.html?id=${batteryChampion.id}`;
  document.querySelector("#details-name").textContent = batteryChampion.name;
}

async function initHome() {
  initHeader();
  renderSkeletons(picksGrid, 3);
  try {
    const laptops = await getLaptops();
    renderStats(laptops);
    renderBrands(laptops);
    renderMissions(laptops);
    renderPicks(laptops);
    linkDetailsPage(laptops);
  } catch (error) {
    ["count", "lowest", "battery"].forEach((name) => setStat(name, "–"));
    showFavoriteCount();
    showMessage(missionsGrid, { title: "Laptops could not load", text: error.message, tone: "error" });
    picksGrid.innerHTML = "";
  }
}

bindFavoriteButtons(picksGrid);
document.addEventListener("favorites-change", showFavoriteCount);
initHome();
