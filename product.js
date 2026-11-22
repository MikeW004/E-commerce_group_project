import { getStoredProducts } from "./storage.js";
import { setUpNavigation, updateNavigationCounts } from "./js/api.js";

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

  productInfo.append(title, category, description, price);
  article.append(image, productInfo);
  productDetails.appendChild(article);
}

fetchProduct();
setUpNavigation("products");
updateNavigationCounts();
