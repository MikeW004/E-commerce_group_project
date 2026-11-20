import { getFavorites, saveFavorites, setUpNavigation, updateNavigationCounts } from "./js/api.js";
import { getCart, saveCart } from "./storage.js";

const productDetails = document.querySelector("#product-details");
const API_URL = "https://dummyjson.com/products";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const loadingMessage = document.querySelector("#loading-message");
const errorMessage = document.querySelector("#error-message");

// ===============================
// 1. FETCH ONE PRODUCT
// ===============================

async function fetchProduct() {
loadingMessage.textContent = "Loading product...";
errorMessage.textContent = "";

try {
if (!productId) {
throw new Error("No product ID provided");
}

const response = await fetch(`${API_URL}/${productId}`);

if (!response.ok) {
throw new Error("Could not load product");
}

const product = await response.json();

console.log(product);
renderProduct(product);

} catch (error) {
console.error("Error:", error);
errorMessage.textContent = error.message;

} finally {
loadingMessage.textContent = "";
}
}

// ===============================
// 2. RENDER PRODUCT DETAILS
// ===============================

function renderProduct(product) {
productDetails.innerHTML = "";

const article = document.createElement("article");

// Container for product information
const productInfo = document.createElement("div");
productInfo.classList.add("product-info");

const title = document.createElement("h2");
const image = document.createElement("img");
const price = document.createElement("p");
const category = document.createElement("p");
const description = document.createElement("p");

description.textContent = product.description;
category.textContent = product.category;

price.textContent = `$${product.price.toFixed(2)}`;
price.classList.add("product-price");

image.src = product.thumbnail;
image.alt = product.title;
image.loading = "lazy";

title.textContent = product.title;

// ===============================
// 3. APPEND ELEMENTS
// ===============================

productInfo.appendChild(title);
productInfo.appendChild(category);
productInfo.appendChild(description);
productInfo.appendChild(price);

article.appendChild(image);
article.appendChild(productInfo);

const actions = document.createElement("div");
actions.classList.add("product-actions");

const addToCartButton = document.createElement("button");
addToCartButton.type = "button";
addToCartButton.className = "button";
addToCartButton.textContent = "Lägg i varukorg";

const favoriteButton = document.createElement("button");
favoriteButton.type = "button";
favoriteButton.className = "favorite-button";
const isFavorite = getFavorites().includes(product.id);
favoriteButton.textContent = isFavorite ? "♥ Ta bort favorit" : "♡ Lägg till favorit";
favoriteButton.setAttribute("aria-pressed", String(isFavorite));

addToCartButton.addEventListener("click", () => {
let cart = getCart();
cart.push(product.id);
if (saveCart(cart)) {
addToCartButton.textContent = "Tillagd i varukorg";
} else {
errorMessage.textContent = "Det gick inte att spara varukorgen.";
}
});

favoriteButton.addEventListener("click", () => {
const favorites = getFavorites();
const alreadyFavorite = favorites.includes(product.id);
const updated = alreadyFavorite
  ? favorites.filter(id => id !== product.id)
  : [...favorites, product.id];
if (saveFavorites(updated)) {
favoriteButton.textContent = alreadyFavorite ? "♡ Lägg till favorit" : "♥ Ta bort favorit";
favoriteButton.setAttribute("aria-pressed", String(!alreadyFavorite));
updateNavigationCounts();
}
});

actions.append(addToCartButton, favoriteButton);
article.appendChild(actions);

productDetails.appendChild(article);
}

fetchProduct();

setUpNavigation("products");
updateNavigationCounts();

