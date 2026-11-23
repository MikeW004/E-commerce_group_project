<<<<<<< HEAD
import { getStoredProducts } from "./storage.js";
import { setUpNavigation, updateNavigationCounts } from "./js/api.js";
=======
import { getFavorites, saveFavorites, setUpNavigation, updateNavigationCounts } from "./js/api.js";
import { getCart, saveCart } from "./storage.js";
>>>>>>> 1823270f266dc46be4ea0af36d6f80a9b8cbea50

const productDetails = document.querySelector("#product-details");
const API_URL = "https://dummyjson.com/products";
const productId = new URLSearchParams(window.location.search).get("id");
const loadingMessage = document.querySelector("#loading-message");
const errorMessage = document.querySelector("#error-message");

async function fetchProduct() {
  loadingMessage.textContent = "Loading product...";
  errorMessage.textContent = "";

  try {
    if (!productId) {
      throw new Error("No product ID provided");
    }

    const storedProduct = getStoredProducts().find(
      (product) => String(product.id) === productId,
    );

    if (storedProduct) {
      renderProduct(storedProduct);
      return;
    }

    const response = await fetch(`${API_URL}/${productId}`);

    if (!response.ok) {
      throw new Error("Could not load product");
    }

    renderProduct(await response.json());
  } catch (error) {
    console.error("Error:", error);
    errorMessage.textContent = error.message;
  } finally {
    loadingMessage.textContent = "";
  }
}

function renderProduct(product) {
  productDetails.innerHTML = "";

  const article = document.createElement("article");
  const productInfo = document.createElement("div");
  productInfo.classList.add("product-info");

  const title = document.createElement("h2");
  title.textContent = product.title;

  const image = document.createElement("img");
  image.src = product.thumbnail;
  image.alt = product.title;
  image.loading = "lazy";

  const price = document.createElement("p");
  price.textContent = `$${product.price.toFixed(2)}`;
  price.classList.add("product-price");

  const category = document.createElement("p");
  category.textContent = product.category;

  const description = document.createElement("p");
  description.textContent = product.description;

<<<<<<< HEAD
  productInfo.append(title, category, description, price);
  article.append(image, productInfo);
  productDetails.appendChild(article);
}

fetchProduct();
setUpNavigation("products");
updateNavigationCounts();
=======
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

>>>>>>> 1823270f266dc46be4ea0af36d6f80a9b8cbea50
