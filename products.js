const API_URL = "https://dummyjson.com/products?limit=0";

const productList = document.querySelector("#list-items");
const searchInput = document.querySelector("#search");
const searchForm = document.querySelector("#search-form");
const categoryFilter = document.querySelector("#Category-filter");
const sortSelect = document.querySelector("#sort-product");

const loadingMessage = document.querySelector(".loading-Message");
const errorMessage = document.querySelector(".error-Message");
const noResults = document.querySelector(".no-results");


let allProducts = [];

// ===============================
// 1. FETCH PRODUCTS
// ===============================

async function fetchProducts() {
loadingMessage.textContent = "Loading products...";
errorMessage.textContent = "";

try {
const response = await fetch(API_URL);

if (!response.ok) {
throw new Error("Could not load products");
}

const data = await response.json();

allProducts = data.products;

loadCategories();
updateProducts();

} catch (error) {
console.error("Error:", error);
errorMessage.textContent = error.message;

} finally {
loadingMessage.textContent = "";
}
}

// ===============================
// 2. RENDER PRODUCTS
// ===============================

function renderProducts(products) {
productList.innerHTML = "";

noResults.hidden = products.length > 0;

products.forEach(product => {
const li = document.createElement("li");
const article = document.createElement("article");
article.classList.add("product-card");

const imageLink = document.createElement("a");
imageLink.href = `product.html?id=${product.id}`;
imageLink.setAttribute(
"aria-label",
`View details for ${product.title}`
);

const image = document.createElement("img");
image.src = product.thumbnail;
image.alt = product.title;
image.loading = "lazy";

imageLink.appendChild(image);

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

const favoriteButton = document.createElement("button");
favoriteButton.type = "button";
favoriteButton.textContent = "♡ Add to Favorites";
favoriteButton.classList.add("favorite-button");
favoriteButton.dataset.productId = product.id;



article.appendChild(imageLink);
article.appendChild(title);
article.appendChild(price);
article.appendChild(detailsLink);
article.appendChild(addToCartButton);
article.appendChild(favoriteButton);


li.appendChild(article);
productList.appendChild(li);
});
}

// ===============================
// 3. LOAD CATEGORIES
// ===============================

function loadCategories() {
const categories = [
...new Set(allProducts.map(product => product.category))
];

categories.forEach(category => {
const option = document.createElement("option");

option.value = category;
option.textContent = category;

categoryFilter.appendChild(option);
});
}

// ===============================
// 4. SEARCH, FILTER AND SORT
// ===============================

function updateProducts() {
const searchTerm = searchInput.value.toLowerCase().trim();
const selectedCategory = categoryFilter.value;

const filteredProducts = allProducts.filter(product => {
const matchesSearch = product.title
.toLowerCase()
.includes(searchTerm);

const matchesCategory =
selectedCategory === "all" ||
product.category === selectedCategory;

return matchesSearch && matchesCategory;
});

const sortValue = sortSelect.value;

if (sortValue === "low-high") {
filteredProducts.sort((a, b) => a.price - b.price);

} else if (sortValue === "high-low") {
filteredProducts.sort((a, b) => b.price - a.price);
}

renderProducts(filteredProducts);
}

// ===============================
// 5. EVENT LISTENERS
// ===============================

searchForm.addEventListener("submit", event => {
event.preventDefault();
});

searchInput.addEventListener("input", updateProducts);
categoryFilter.addEventListener("change", updateProducts);
sortSelect.addEventListener("change", updateProducts);

// Start
fetchProducts();

