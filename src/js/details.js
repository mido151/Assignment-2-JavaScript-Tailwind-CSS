import { getLaptops, findLaptop } from "./api.js";
import { getCompare, isFavorite, addFavorite, addToCompare, removeFromCompare } from "./storage.js";
import { CATEGORY_LABELS, favoriteButton, formatPrice, formatStorage, showMessage, bindFavoriteButtons } from "./ui.js";
import { initHeader } from "./header.js";

const detailsBox = document.querySelector("#details");

const specRows = (laptop) => [
  ["Catalogue ID", `#${laptop.id}`],
  ["Name", laptop.name],
  ["Brand", laptop.brand],
  ["Category", CATEGORY_LABELS[laptop.category]],
  ["Price", formatPrice(laptop.price)],
  ["Processor", laptop.cpu],
  ["RAM", `${laptop.ramGB} GB`],
  ["Storage", formatStorage(laptop.storageGB)],
  ["Battery life", `${laptop.batteryHours} hours`],
  ["Weight", `${laptop.weightKg} kg`],
  ["Screen size", `${laptop.screenInches} inches`],
];

function renderDetails(laptop) {
  document.title = `${laptop.name} · Student Laptop Finder`;
  detailsBox.removeAttribute("aria-busy");
  detailsBox.innerHTML = `
    <article class="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
      <div class="relative rounded-3xl bg-raised p-6 sm:p-10">
        <span class="absolute top-4 left-4 rounded-full bg-ink px-3 py-1 text-xs font-bold text-page">${CATEGORY_LABELS[laptop.category]}</span>
        <img src="${laptop.image}" alt="Illustration of the ${laptop.name}" width="400" height="260" class="mx-auto w-full max-w-md">
      </div>
      <div>
        <p class="text-sm font-bold tracking-widest text-accent-text uppercase">${laptop.brand}</p>
        <h1 class="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">${laptop.name}</h1>
        <p class="mt-4 inline-block rounded-xl bg-accent px-3 py-1 font-mono text-2xl font-bold text-accent-ink sm:text-3xl">${formatPrice(laptop.price)}</p>
        <div class="prose mt-6 max-w-none prose-p:text-lg performance:prose-invert">
          <p>${laptop.description}</p>
        </div>
        <div id="detail-actions" class="mt-8 flex flex-wrap items-center gap-3">
          ${favoriteButton(laptop, { off: "Add to favorites", on: "In favorites" })}
          <button id="compare-button" type="button" aria-pressed="false" class="group btn-ghost aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-page">
            <span class="group-aria-pressed:hidden">+ Add to compare</span>
            <span class="hidden group-aria-pressed:inline">✓ In compare</span>
          </button>
        </div>
        <p id="action-message" role="status" class="mt-3 min-h-6 text-sm font-semibold"></p>
      </div>
    </article>

    <section class="mt-12" aria-labelledby="specs-title">
      <h2 id="specs-title" class="text-2xl font-bold tracking-tight">Full specifications</h2>
      <div class="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
        <table class="w-full text-left text-sm sm:text-base">
          <tbody class="divide-y divide-line">
            ${specRows(laptop)
              .map(([label, value]) => `
                <tr class="transition hover:bg-raised">
                  <th scope="row" class="w-2/5 px-4 py-3 font-semibold text-muted sm:px-6">${label}</th>
                  <td class="px-4 py-3 font-mono font-semibold sm:px-6">${value}</td>
                </tr>`)
              .join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}

function syncCompareButton(laptop) {
  document.querySelector("#compare-button").setAttribute("aria-pressed", getCompare().includes(laptop.id));
}

function setUpActions(laptop) {
  const message = document.querySelector("#action-message");
  bindFavoriteButtons(document.querySelector("#detail-actions"));
  document.addEventListener("favorites-change", () => syncCompareButton(laptop));

  document.querySelector("#compare-button").addEventListener("click", () => {
    if (getCompare().includes(laptop.id)) {
      removeFromCompare(laptop.id);
      message.textContent = "Removed from the comparison.";
      return;
    }
    if (!isFavorite(laptop.id)) {
      addFavorite(laptop.id);
    }
    const result = addToCompare(laptop.id);
    message.innerHTML = result.ok
      ? `Added to the comparison. <a href="compare.html" class="underline">Open compare →</a>`
      : `<span class="text-heart">${result.message}</span> <a href="compare.html" class="underline">Open compare →</a>`;
    syncCompareButton(laptop);
  });
  syncCompareButton(laptop);
}

async function initDetails() {
  initHeader();
  const params = new URLSearchParams(window.location.search);
  if (!params.has("id")) {
    showMessage(detailsBox, {
      title: "No laptop selected",
      text: "This page needs a laptop id, for example details.html?id=7. Pick a laptop from the catalogue.",
      linkHref: "laptops.html",
      linkText: "Browse laptops",
      level: "h1",
    });
    return;
  }

  try {
    const laptops = await getLaptops();
    const laptop = findLaptop(laptops, Number(params.get("id")));
    if (!laptop) {
      showMessage(detailsBox, {
        title: "Laptop not found",
        text: `There is no laptop with the id "${params.get("id")}". It may have been removed from the catalogue.`,
        linkHref: "laptops.html",
        linkText: "Browse laptops",
        level: "h1",
      });
      return;
    }
    renderDetails(laptop);
    setUpActions(laptop);
  } catch (error) {
    showMessage(detailsBox, { title: "Laptop could not load", text: error.message, tone: "error", level: "h1" });
  }
}

initDetails();
