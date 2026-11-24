import { formatPrice, setUpNavigation, updateNavigationCounts } from "./js/api.js";
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

function showMessage(message) {
  messageElement.textContent = message;
  messageElement.hidden = false;
}
// Hämtar id i varukorgslistan från browser, gör en ny lista utan dubbletter
// hämtar produkt från minne eller api, lägger till .quantity m.h.a cart
// sparar alla produkter i en lista och returnar
async function getCartProducts() {
  cart = getCart();
  const products = [];
  const storedProducts = getStoredProducts();
 
  // konverterar varje id till string ifall de är olika data types
  // sparar endast unika värden med new Set
  // spread opertor gör om till array
  const uniqueProductIds = [...new Set(cart.map((id) => String(id)))];
 
  //gör en ny key som heter quantity som är hur många av en unik produkt
  //som finns i cart
  for (const id of uniqueProductIds) {
    const quantity = cart.filter((productId) => String(productId) === id).length;
    const storedProduct = storedProducts.find(
      (product) => String(product.id) === id,
    );

    if (storedProduct) {
      //pushar nytt object med quantity i sig, skippar fetch
      products.push({ ...storedProduct, quantity });
      continue;
    }

    try {
      const response = await fetch(`https://dummyjson.com/products/${id}`);
      if (!response.ok) {
        throw new Error(`Produkt kunde inte laddas (${response.status})`);
      }
      const product = await response.json();
      products.push({ ...product, quantity });
    } catch (error) {
      console.error(error);
      showMessage("En produkt i varukorgen kunde inte laddas.");
    }
  }

  return products;
}

//tar varje produkt från produktlista, skapar ett kort och lägger till html
async function renderCart() {
  cartElement.innerHTML = "";
  totalCartPrice = 0;
  cart = getCart();

  if (cart.length === 0) {
    cartElement.innerHTML = `
      <div class="empty-state">
        <h2>Din varukorg är tom</h2>
        <a class="button" href="products.html">Hitta produkter</a>
      </div>
    `;
    totalPriceElement.textContent = formatPrice(0);
    totalProductsElement.textContent = "0";
    return;
  }

  const products = await getCartProducts();
  products.forEach((product) => {
    cartElement.appendChild(createCartCard(product));
  });

  totalProductsElement.textContent = String(cart.length);
  totalPriceElement.textContent = formatPrice(totalCartPrice);
}
//skapar ett kort för varje produkt
function createCartCard(product) {
  const productTotal = product.price * product.quantity;
  totalCartPrice += productTotal;

  const cardElement = document.createElement("div");
  cardElement.classList.add("cart-card");
  cardElement.innerHTML = `
    <img
      class="product-img"
      src="${product.images?.[1] || product.thumbnail || ""}"
      alt="${product.title || "Produkt"}"
    >
    <p class="product-description">${product.description || ""}</p>
    <span class="card-price-container">
      <div class="card-price">Pris ${formatPrice(product.price)}</div>
      <div class="card-quantity">
        <button class="arrow" id="arrow-up" type="button" aria-label="Öka antal">+</button>
        <div>Antal <span class="quantity">${product.quantity}</span></div>
        <button class="arrow" id="arrow-down" type="button" aria-label="Minska antal">−</button>
      </div>
      <div class="card-price-total">
        Totalt: <span class="product-total-price">${formatPrice(productTotal)}</span>
      </div>
    </span>
  `;

  attachQuantityControls(cardElement, product);
  return cardElement;
}
//Lägger till evenlistener på varje kort som lägger till/tar bort produkt
//uppdaterar summary
function attachQuantityControls(cardElement, product) {
  const quantityElement = cardElement.querySelector(".quantity");
  const productTotalElement = cardElement.querySelector(".product-total-price");

  cardElement.addEventListener("click", (event) => {
    if (event.target.closest("#arrow-up")) {
      cart.push(product.id);
      product.quantity++;
    } else if (event.target.closest("#arrow-down")) {
      const productIndex = cart.findIndex(
        (item) => String(item) === String(product.id),
      );
      if (productIndex === -1) {
        return;
      }
      cart.splice(productIndex, 1);
      product.quantity--;
    } else {
      return;
    }

    saveCart(cart);
    quantityElement.textContent = String(product.quantity);
    productTotalElement.textContent = formatPrice(product.price * product.quantity);

    if (product.quantity === 0) {
      cardElement.remove();
    }

    renderSummary();
  });
}
//Summary av antal produkter och totala priset
function renderSummary() {
  cart = getCart();
  totalCartPrice = 0;

  getCartProducts().then((products) => {
    totalCartPrice = products.reduce((sum, product) => sum + product.price * product.quantity,
      0,
    );
    totalPriceElement.textContent = formatPrice(totalCartPrice);
    totalProductsElement.textContent = String(cart.length);
  });
}
//skapar popover element i sin container med alla produkter i varukorgen
async function createPopover() {
  if (getCart().length === 0) {
    showMessage("Din varukorg är tom.");
    return;
  }

  popoverContainer.innerHTML = `
    <div id="checkout-popover" popover></div>
  `;

  const popoverElement = popoverContainer.querySelector("#checkout-popover");
  try {
    await renderCheckoutProducts(popoverElement);
    popoverElement.showPopover();
  } catch (error) {
    console.error(error);
    showMessage("Kunde inte öppna kassan. Försök igen.");
  }
}
//fyller i popover med alla produkter i varukorgen
async function renderCheckoutProducts(checkoutContainer) {
  const products = await getCartProducts();

  checkoutContainer.innerHTML = "";
  products.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.classList.add("checkout-product");
    productElement.innerHTML = `
      <img
        class="checkout-product-img"
        src="${product.thumbnail || product.images?.[0] || ""}"
        alt="${product.title || "Produkt"}"
      >
      <div class="checkout-product-info">
        <h3>${product.title || "Produkt"}</h3>
        <p>Antal ${product.quantity}</p>
        <p>Pris ${formatPrice(product.price)}</p>
        <p>Totalt ${formatPrice(product.quantity * product.price)}</p>
      </div>
    `;
    checkoutContainer.appendChild(productElement);
  });

  const purchaseButton = document.createElement("button");
  purchaseButton.textContent = "Genomför köp";
  purchaseButton.type = "button";
  purchaseButton.classList.add("buy-btn");
  purchaseButton.addEventListener("click", () => {
    saveCart([]);
    cart = [];
    checkoutContainer.hidePopover();
    popoverContainer.innerHTML = "";
    renderCart();
    showMessage("Tack! Demonstrationsköpet är klart.");
  });

  const summaryPanel = document.createElement("div");
  summaryPanel.classList.add("checkout-summary-panel");
  summaryPanel.appendChild(purchaseButton);
  checkoutContainer.appendChild(summaryPanel);
}
//knappen som öppnar popover
checkoutButton.addEventListener("click", () => {
  void createPopover();
});

renderCart();
