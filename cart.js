import { setUpNavigation, updateNavigationCounts } from "./js/api.js";
import { getCart, getStoredProducts, saveCart } from "./storage.js";

setUpNavigation("cart");
updateNavigationCounts();

let cart = getCart();
let totalCartPrice = 0;

const cartElement = document.querySelector("#cartElement");
const messageElement = document.querySelector("#message");
const totalProductsElement = document.querySelector("#summary-quantity");
const totalPriceElement = document.querySelector("#summary-price");
const checkoutButton = document.querySelector("#checkout-btn");
const popoverContainer = document.querySelector("#checkout-popover-container");

totalProductsElement.textContent = cart.length;
renderCart();

checkoutButton.addEventListener("click", createPopover);

function showMessage(message) {
  messageElement.textContent = message;
}

async function getCartProducts() {
  cart = getCart();

  const products = [];
  const uniqueProductIds = [...new Set(cart)];
  const storedProducts = getStoredProducts();

  for (const id of uniqueProductIds) {
    const quantity = cart.filter((productId) => productId === id).length;
    const storedProduct = storedProducts.find(
      (product) => String(product.id) === String(id),
    );

    if (storedProduct) {
      products.push({ ...storedProduct, quantity });
      continue;
    }

    try {
      const response = await fetch(`https://dummyjson.com/products/${id}`);

      if (!response.ok) {
        throw new Error(response.status);
      }

      const product = await response.json();
      products.push({ ...product, quantity });
    } catch (error) {
      console.error(error);
      showMessage("failed to fetch product");
    }
  }

  return products;
}

async function renderCart() {
  const products = await getCartProducts();

  products.forEach((product) => {
    cartElement.appendChild(createCartCard(product));
  });
}

function createCartCard(product) {
  const productTotal = product.price * product.quantity;
  totalCartPrice += productTotal;
  totalPriceElement.textContent = totalCartPrice;

  const cardElement = document.createElement("div");
  cardElement.classList.add("cart-card");
  cardElement.innerHTML = `
    <img
      class="product-img"
      src="${product.images?.[1] || product.thumbnail || ""}"
      alt="picture of product"
    >
    <p class="product-description">${product.description}</p>
    <span class="card-price-container">
      <div class="card-price">Price ${product.price}</div>
      <div class="card-quantity">
        <div class="arrow" id="arrow-up"><i class="fa-solid fa-caret-up"></i></div>
        <div>Quantity <span class="quantity">${product.quantity}</span></div>
        <div class="arrow" id="arrow-down"><i class="fa-solid fa-caret-down"></i></div>
      </div>
      <div class="card-price-total">
        Total: <span class="product-total-price">${productTotal}</span>
      </div>
    </span>
  `;

  attachQuantityControls(cardElement, product);
  return cardElement;
}

function attachQuantityControls(cardElement, product) {
  const quantityElement = cardElement.querySelector(".quantity");
  const productTotalElement = cardElement.querySelector(".product-total-price");

  cardElement.addEventListener("click", (event) => {
    if (event.target.closest("#arrow-up")) {
      addProduct(product);
      updateProductQuantity(product, productTotalElement, quantityElement);
      updateCartSummary(event, product);
    } else if (event.target.closest("#arrow-down")) {
      removeProduct(product);
      updateProductQuantity(product, productTotalElement, quantityElement);
      updateCartSummary(event, product);

      if (product.quantity === 0) {
        cardElement.remove();
      }
    }
  });
}

function removeProduct(product) {
  product.quantity--;
  cart = getCart();

  const productIndex = cart.findIndex((item) => item === product.id);
  cart.splice(productIndex, 1);
  saveCart(cart);
  cart = getCart();
}

function addProduct(product) {
  product.quantity++;
  cart = getCart();
  cart.push(product.id);
  saveCart(cart);
}

function updateProductQuantity(product, productTotalElement, quantityElement) {
  quantityElement.textContent = product.quantity;
  productTotalElement.textContent = product.price * product.quantity;
}

function updateCartSummary(event, product) {
  if (event.target.closest("#arrow-up")) {
    totalCartPrice += product.price;
    totalPriceElement.textContent = totalCartPrice;
    totalProductsElement.textContent = cart.length;
  } else if (event.target.closest("#arrow-down")) {
    totalCartPrice -= product.price;
    totalPriceElement.textContent = totalCartPrice;
    cart = getCart();
    totalProductsElement.textContent = cart.length;
  }
}

function createPopover() {
  popoverContainer.innerHTML = `
    <div id="checkout-popover" popover>
  `;

  const popoverElement = popoverContainer.querySelector("#checkout-popover");
  renderCheckoutProducts(popoverElement);
}

async function renderCheckoutProducts(checkoutContainer) {
  const products = await getCartProducts();

  products.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.classList.add("checkout-product");
    productElement.innerHTML = `
      <img
        class="checkout-product-img"
        src="${product.thumbnail}"
        alt="picture of product"
      >
      <div class="checkout-product-info">
        <h3>${product.title}</h3>
        <p>Amount ${product.quantity}</p>
        <p>Price ${product.price}</p>
        <p>Total price ${product.quantity * product.price}</p>
      </div>
    `;
    checkoutContainer.appendChild(productElement);
  });

  const purchaseButton = document.createElement("button");
  purchaseButton.textContent = "Purchase";
  purchaseButton.classList.add("buy-btn");

  const summaryPanel = document.createElement("div");
  summaryPanel.classList.add("checkout-summary-panel");
  summaryPanel.appendChild(purchaseButton);
  checkoutContainer.appendChild(summaryPanel);
}
