const DATA_URL = "data/laptops.json";

export async function getLaptops() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Server answered with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Laptop data failed to load:", error);
    throw new Error("We could not load the laptop list. Check that data/laptops.json exists and open the site with Live Server.");
  }
}

export const findLaptop = (laptops, id) => laptops.find((laptop) => laptop.id === id);
