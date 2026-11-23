// Runs in <head> before the page is painted, so the saved theme is applied
// straight away and the page never flashes the wrong colours on load.
(function () {
  let theme = "saver";
  try {
    theme = JSON.parse(localStorage.getItem("laptopFinder.theme")) || "saver";
  } catch (error) {
    theme = "saver";
  }
  document.documentElement.dataset.theme = theme;
})();
