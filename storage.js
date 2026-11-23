const PRODUCTS_KEY = "products";

export function saveCart(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
    return true;
  } catch {
    return false;
  }
}

export function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart"));
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

export function getStoredProducts() {
  const savedProducts = localStorage.getItem(PRODUCTS_KEY);

  if (savedProducts === null) {
    return [];
  }

  const products = JSON.parse(savedProducts);

  if (!Array.isArray(products)) {
    throw new Error("Les produits enregistrés ont un format invalide.");
  }

  return products;
}

export function hasStoredProducts() {
  return localStorage.getItem(PRODUCTS_KEY) !== null;
}

export function saveStoredProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}
