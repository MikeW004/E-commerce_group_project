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

productDetails.appendChild(article);
}

fetchProduct();

import { setUpNavigation, updateNavigationCounts } from "./js/api.js";

setUpNavigation("products");
updateNavigationCounts();

