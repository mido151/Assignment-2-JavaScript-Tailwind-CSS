import { CATEGORY_LABELS, formatPrice, formatStorage } from "./ui.js";

export const SPEC_ROWS = [
  { key: "price", label: "Price", best: "lowest", format: formatPrice },
  { key: "brand", label: "Brand" },
  { key: "category", label: "Category", format: (category) => CATEGORY_LABELS[category] },
  { key: "cpu", label: "Processor" },
  { key: "ramGB", label: "RAM", best: "highest", format: (ram) => `${ram} GB` },
  { key: "storageGB", label: "Storage", best: "highest", format: formatStorage },
  { key: "batteryHours", label: "Battery life", best: "highest", format: (hours) => `${hours} h` },
  { key: "weightKg", label: "Weight", best: "lowest", format: (weight) => `${weight} kg` },
  { key: "screenInches", label: "Screen", format: (inches) => `${inches} in` },
];

// Picks the winning number for one row: the smallest value when lower is better
// (price, weight) and the largest when higher is better (RAM, storage, battery).
// If every laptop has the same value there is no winner, so nothing is highlighted.
export function bestValue(laptops, row) {
  if (!row.best) {
    return null;
  }
  const values = laptops.map((laptop) => laptop[row.key]);
  if (new Set(values).size === 1) {
    return null;
  }
  return row.best === "lowest" ? Math.min(...values) : Math.max(...values);
}

function renderCell(laptop, row, best) {
  const value = row.format ? row.format(laptop[row.key]) : laptop[row.key];
  if (best !== null && laptop[row.key] === best) {
    return `
      <td class="px-4 py-3">
        <span class="inline-flex flex-wrap items-center gap-2 rounded-lg bg-accent px-2.5 py-1 font-mono font-bold text-accent-ink">
          ${value}<span class="rounded bg-accent-ink px-1.5 text-[0.65rem] tracking-wider text-accent uppercase">Best</span>
        </span>
      </td>`;
  }
  return `<td class="px-4 py-3 font-mono">${value}</td>`;
}

export function buildCompareTable(laptops) {
  const headerCells = laptops
    .map((laptop) => `
      <th scope="col" class="min-w-44 px-4 py-4 text-left align-bottom">
        <img src="${laptop.image}" alt="" width="400" height="260" class="mb-2 w-32">
        <a href="details.html?id=${laptop.id}" class="text-base font-bold hover:underline">${laptop.name}</a>
      </th>`)
    .join("");

  const bodyRows = SPEC_ROWS.map((row) => {
    const best = bestValue(laptops, row);
    return `
      <tr class="border-t border-line">
        <th scope="row" class="sticky left-0 z-10 bg-surface px-4 py-3 text-left font-semibold text-muted">${row.label}</th>
        ${laptops.map((laptop) => renderCell(laptop, row, best)).join("")}
      </tr>`;
  }).join("");

  return `
    <div class="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table class="w-full min-w-xl text-sm">
        <caption class="sr-only">Specifications of the selected laptops. Best values are marked Best.</caption>
        <thead>
          <tr>
            <th scope="col" class="sticky left-0 z-10 bg-surface px-4 py-4 text-left align-bottom text-xs tracking-widest text-muted uppercase">Spec</th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>`;
}
