import {
  createProductCard,
  getFavorites,
  getProducts,
  setUpNavigation,
  setUpProductButtons,
  updateNavigationCounts,
} from "./js/api.js";

setUpNavigation("products");
updateNavigationCounts();

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
  loadingMessage.textContent = "Laddar produkter...";
  errorMessage.textContent = "";

  try {
    allProducts = await getProducts();
    loadCategories();
    updateProducts();
    setUpProductButtons(allProducts, updateProducts);
  } catch (error) {
    console.error("Error:", error);
    errorMessage.textContent = error.message || "Kunde inte ladda produkterna.";
  } finally {
    loadingMessage.textContent = "";
  }
}

function renderProducts(products) {
  productListElement.innerHTML = "";
  noResults.hidden = products.length > 0;

  const favorites = getFavorites();
  products.forEach((product) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = createProductCard(product, favorites);
    productListElement.appendChild(listItem);
  });
}

function loadCategories() {
  const categories = new Set(allProducts.map((product) => product.category));

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
    const matchesSearch = product.title.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

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
