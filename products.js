import {
  getFavorites,
  setUpNavigation,
  setUpProductButtons,
  showNotice,
  updateNavigationCounts,
} from "./js/api.js";
import {
  getCart,
  getStoredProducts,
  hasStoredProducts,
  saveCart,
  saveStoredProducts,
} from "./storage.js";

const API_URL = "https://dummyjson.com/products?limit=0";

const productListElement = document.querySelector("#list-items");
const searchInput = document.querySelector("#search");
const searchForm = document.querySelector("#search-form");
const categoryFilter = document.querySelector("#Category-filter");
const sortSelect = document.querySelector("#sort-product");
const loadingMessage = document.querySelector(".loading-Message");
const errorMessage = document.querySelector(".error-Message");
const noResults = document.querySelector(".no-results");

let allProducts = [];

async function fetchProducts() {
  loadingMessage.textContent = "Loading products...";
  errorMessage.textContent = "";

  try {
    if (hasStoredProducts()) {
      allProducts = getStoredProducts();
    } else {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load products");
      }

      const data = await response.json();
      allProducts = data.products;
      saveStoredProducts(allProducts);
    }

    loadCategories();
    updateProducts();
    setUpProductButtons(allProducts, updateProducts);
  } catch (error) {
    console.error("Error:", error);
    errorMessage.textContent = error.message;
  } finally {
    loadingMessage.textContent = "";
  }
}

function renderProducts(products) {
  productListElement.innerHTML = "";
  noResults.hidden = products.length > 0;

  const favoriteIds = getFavorites();

  products.forEach((product) => {
    const listItem = document.createElement("li");
    const article = document.createElement("article");
    article.classList.add("product-card");

    const imageLink = document.createElement("a");
    imageLink.href = `product.html?id=${product.id}`;
    imageLink.setAttribute("aria-label", `View details for ${product.title}`);

    const imageWrap = document.createElement("div");
    imageWrap.classList.add("product-image-wrap");

    const image = document.createElement("img");
    image.src = product.thumbnail;
    image.alt = product.title;
    image.loading = "lazy";
    imageLink.appendChild(image);
    imageWrap.appendChild(imageLink);

    const favoriteButton = document.createElement("button");
    const isFavorite = favoriteIds.includes(product.id);
    favoriteButton.type = "button";
    favoriteButton.textContent = isFavorite ? "♥" : "♡";
    favoriteButton.classList.add("favorite-button");
    favoriteButton.dataset.action = "favorite";
    favoriteButton.dataset.id = product.id;
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    favoriteButton.setAttribute(
      "aria-label",
      `${isFavorite ? "Ta bort från" : "Lägg till i"} favoriter: ${product.title}`,
    );
    imageWrap.appendChild(favoriteButton);

    const title = document.createElement("h3");
    title.textContent = product.title;

    const price = document.createElement("p");
    price.textContent = `$${product.price.toFixed(2)}`;

    const detailsLink = document.createElement("a");
    detailsLink.href = `product.html?id=${product.id}`;
    detailsLink.textContent = "View Details";
    detailsLink.classList.add("details-link");

    const addToCartButton = document.createElement("button");
    addToCartButton.type = "button";
    addToCartButton.textContent = "Add to Cart";
    addToCartButton.classList.add("add-to-cart");
    addToCartButton.dataset.productId = product.id;
    addToCartButton.addEventListener("click", () => {
      saveCart([...getCart(), product.id]);
      addToCartButton.textContent = "Added to Cart";
      showNotice("Produkten har lagts till i varukorgen.");
    });

    article.append(
      imageWrap,
      title,
      price,
      detailsLink,
      addToCartButton,
    );
    listItem.appendChild(article);
    productListElement.appendChild(listItem);
  });
}

function loadCategories() {
  const categories = new Set(
    allProducts.map((product) => product.category),
  );

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function updateProducts() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (sortSelect.value === "low-high") {
    filteredProducts.sort((first, second) => first.price - second.price);
  } else if (sortSelect.value === "high-low") {
    filteredProducts.sort((first, second) => second.price - first.price);
  }

  renderProducts(filteredProducts);
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

searchInput.addEventListener("input", updateProducts);
categoryFilter.addEventListener("change", updateProducts);
sortSelect.addEventListener("change", updateProducts);

fetchProducts();
setUpNavigation("products");
updateNavigationCounts();
