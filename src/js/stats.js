export const sumBy = (laptops, key) => laptops.reduce((total, laptop) => total + laptop[key], 0);

export const averageBy = (laptops, key) => (laptops.length ? sumBy(laptops, key) / laptops.length : 0);

export const lowestBy = (laptops, key) =>
  laptops.reduce((best, laptop) => (laptop[key] < best[key] ? laptop : best));

export const highestBy = (laptops, key) =>
  laptops.reduce((best, laptop) => (laptop[key] > best[key] ? laptop : best));
