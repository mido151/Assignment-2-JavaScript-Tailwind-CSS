import { isFavorite, toggleFavorite } from "./storage.js";

export const CATEGORY_LABELS = {
  ultrabook: "Ultrabook",
  gaming: "Gaming",
  "2-in-1": "2-in-1",
  creator: "Creator",
  budget: "Budget",
};

export const formatPrice = (price) => `${Math.round(price).toLocaleString("en-US")} EGP`;

export const formatStorage = (storageGB) => (storageGB >= 1024 ? `${storageGB / 1024} TB` : `${storageGB} GB`);

export function batteryMeter(hours) {
  const filled = Math.min(5, Math.max(1, Math.round(hours / 4)));
  const segments = [1, 2, 3, 4, 5]
    .map((step) => `<span class="h-2.5 w-1.5 rounded-sm ${step <= filled ? "bg-accent-text" : "bg-line"}"></span>`)
    .join("");
  return `<span class="inline-flex items-center gap-0.5" aria-hidden="true">${segments}</span>`;
}

export function favoriteButton(laptop, labels = { off: "Save", on: "Saved" }) {
  return `
    <button type="button" data-fav-id="${laptop.id}" aria-pressed="${isFavorite(laptop.id)}"
      class="group inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 py-1.5 text-sm font-bold text-ink transition duration-200 hover:border-heart hover:text-heart focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-text aria-pressed:border-heart aria-pressed:bg-heart aria-pressed:text-page motion-reduce:transition-none">
      <svg viewBox="0 0 24 24" class="size-4 fill-none stroke-current stroke-2 group-aria-pressed:fill-current" aria-hidden="true">
        <path stroke-linejoin="round" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>
      </svg>
      <span class="group-aria-pressed:hidden">${labels.off}</span>
      <span class="hidden group-aria-pressed:inline">${labels.on}</span>
      <span class="sr-only">${laptop.name}</span>
    </button>`;
}

export function renderCard(laptop, labels) {
  return `
    <article class="laptop-card">
      <a href="details.html?id=${laptop.id}" tabindex="-1" aria-hidden="true" class="block bg-raised px-6 pt-5 pb-3">
        <img src="${laptop.image}" alt="" width="400" height="260" loading="lazy" class="mx-auto aspect-[20/13] w-full max-w-72 object-contain">
      </a>
      <div class="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p class="text-xs font-bold tracking-widest text-accent-text uppercase">${laptop.brand} · ${CATEGORY_LABELS[laptop.category]}</p>
          <h2 class="mt-1 text-lg leading-snug font-bold">
            <a href="details.html?id=${laptop.id}" class="rounded-sm hover:underline focus-visible:outline-3 focus-visible:outline-accent-text">${laptop.name}</a>
          </h2>
          <p class="mt-1 truncate text-sm text-muted">${laptop.cpu}</p>
        </div>
        <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div><dt class="text-xs text-muted">RAM</dt><dd class="font-mono font-semibold">${laptop.ramGB} GB</dd></div>
          <div><dt class="text-xs text-muted">Storage</dt><dd class="font-mono font-semibold">${formatStorage(laptop.storageGB)}</dd></div>
          <div><dt class="text-xs text-muted">Battery</dt><dd class="flex items-center gap-2 font-mono font-semibold">${laptop.batteryHours} h ${batteryMeter(laptop.batteryHours)}</dd></div>
          <div><dt class="text-xs text-muted">Weight</dt><dd class="font-mono font-semibold">${laptop.weightKg} kg</dd></div>
        </dl>
        <div class="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <p class="font-mono text-xl font-bold">${laptop.price.toLocaleString("en-US")} <span class="text-xs font-semibold text-muted">EGP</span></p>
          ${favoriteButton(laptop, labels)}
        </div>
      </div>
    </article>`;
}

export function renderCards(container, laptops, labels) {
  container.innerHTML = laptops.map((laptop) => renderCard(laptop, labels)).join("");
}

export function renderSkeletons(container, count = 6) {
  const skeleton = `
    <div class="laptop-card animate-pulse" aria-hidden="true">
      <div class="aspect-[20/13] bg-raised"></div>
      <div class="flex flex-1 flex-col gap-4 p-5">
        <div class="space-y-2">
          <div class="h-3 w-1/3 rounded bg-raised"></div>
          <div class="h-5 w-3/4 rounded bg-raised"></div>
          <div class="h-3 w-1/2 rounded bg-raised"></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="h-8 rounded bg-raised"></div>
          <div class="h-8 rounded bg-raised"></div>
          <div class="h-8 rounded bg-raised"></div>
          <div class="h-8 rounded bg-raised"></div>
        </div>
        <div class="mt-auto flex items-center justify-between border-t border-line pt-4">
          <div class="h-6 w-28 rounded bg-raised"></div>
          <div class="h-8 w-20 rounded-full bg-raised"></div>
        </div>
      </div>
    </div>`;
  container.setAttribute("aria-busy", "true");
  container.innerHTML = Array.from({ length: count }, () => skeleton).join("");
}

export function showMessage(container, { title, text, tone = "info", linkHref, linkText, level = "h2" }) {
  const toneClasses = tone === "error" ? "border-heart text-heart" : "border-line text-ink";
  const link = linkHref ? `<a href="${linkHref}" class="btn-action mt-5">${linkText}</a>` : "";
  container.removeAttribute("aria-busy");
  container.innerHTML = `
    <div role="${tone === "error" ? "alert" : "status"}" class="col-span-full rounded-2xl border-2 border-dashed ${toneClasses} bg-surface px-6 py-12 text-center">
      <${level} class="text-xl font-bold">${title}</${level}>
      <p class="mx-auto mt-2 max-w-md text-sm text-muted">${text}</p>
      ${link}
    </div>`;
}

export function syncFavoriteButtons(root = document) {
  root.querySelectorAll("[data-fav-id]").forEach((button) => {
    button.setAttribute("aria-pressed", isFavorite(Number(button.dataset.favId)));
  });
}

export function bindFavoriteButtons(root, onChange) {
  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-fav-id]");
    if (!button) {
      return;
    }
    toggleFavorite(Number(button.dataset.favId));
    syncFavoriteButtons();
    if (onChange) {
      onChange();
    }
  });
}
