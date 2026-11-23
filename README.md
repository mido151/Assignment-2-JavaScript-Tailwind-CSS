# Student Laptop Finder

SW302 User Interface Development · Assignment 2 (JavaScript & Tailwind CSS)
Author: Mido Sherif

GitHub repo: https://github.com/mido151/Assignment-2-JavaScript-Tailwind-CSS

A responsive web app that helps students browse laptops, search and filter them, read the full specifications of one laptop, save favorites, and compare two to four favorites side by side. All laptop data is loaded with JavaScript from `data/laptops.json`, and all styling uses Tailwind CSS 4.

## Pages

| File | What it does |
|---|---|
| `index.html` | Home page with live statistics, category tiles, links to the other pages and smart picks |
| `laptops.html` | Catalogue with live search, category, max price, min RAM and min battery filters, sorting and a result count |
| `details.html` | One laptop selected by `?id=`, with description and full specifications table |
| `favorites.html` | Saved favorites from localStorage with total and average price, remove one and clear all |
| `compare.html` | Side-by-side comparison of two to four favorites with the best value in each row highlighted |

## Install and build

You need Node.js and npm.

```bash
npm install
npx @tailwindcss/cli -i ./src/input.css -o ./dist/output.css
```

To rebuild automatically while editing:

```bash
npx @tailwindcss/cli -i ./src/input.css -o ./dist/output.css --watch
```

The same commands are saved as `npm run build` and `npm run watch`.

## Run

`fetch()` does not work on pages opened directly as files, so run the site from a local server, for example the VS Code Live Server extension: right-click `index.html` and choose **Open with Live Server**.

## Folder structure

```
index.html  laptops.html  details.html  favorites.html  compare.html
src/input.css            Tailwind setup: @import, @plugin, @theme, @layer components
src/js/api.js            loads the laptop data with fetch
src/js/storage.js        favorites, comparison and theme in localStorage
src/js/ui.js             shared rendering: laptop card, skeletons, messages
src/js/stats.js          reduce-based totals, averages, lowest and highest
src/js/compare.js        comparison rows and best-value logic
src/js/header.js         theme switch, mobile menu and favorites badge
src/js/theme-boot.js     applies the saved theme before the page paints
src/js/home.js  laptops.js  details.js  favorites.js  compare-page.js   one file per page
data/laptops.json        24 laptops
dist/output.css          generated Tailwind CSS
assets/                  laptop illustrations, favicon and font
```

## Themes

- **Battery Saver Mode**: light background with green and lime accents (default).
- **Performance Mode**: black background with a lime accent.

The switch is in the header of every page, and the choice is saved in localStorage.

## Notes

- Tailwind CSS 4 is installed locally with npm. No CDN is used.
- Plugins: `@tailwindcss/forms` (search and filter controls) and `@tailwindcss/typography` (laptop description).
- Laptop illustrations are original SVG drawings. Prices are approximate, in Egyptian pounds (EGP).
