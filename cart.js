<<<<<<< HEAD
import { setUpNavigation, updateNavigationCounts } from "./js/api.js";
import { getCart, getStoredProducts, saveCart } from "./storage.js";

setUpNavigation("cart");
updateNavigationCounts();

let cart = getCart();
let totalCartPrice = 0;
=======
import { saveCart, getCart } from "./storage.js";
import { setUpNavigation, updateNavigationCounts } from "./js/api.js";
export let cart = [];
setUpNavigation("cart");
updateNavigationCounts();
// testa spara något i catalog och sen clg här o se om den uppdateras
cart = getCart();
console.log(cart);
// cart.pop();
// saveCart(cart);
console.log(cart);
//listan går nu mellan catalog.js och cart.js som den ska
>>>>>>> 1823270f266dc46be4ea0af36d6f80a9b8cbea50

const cartElement = document.querySelector("#cartElement");
const messageElement = document.querySelector("#message");
const totalProductsElement = document.querySelector("#summary-quantity");
const totalPriceElement = document.querySelector("#summary-price");
const checkoutButton = document.querySelector("#checkout-btn");
const popoverContainer = document.querySelector("#checkout-popover-container");

totalProductsElement.textContent = cart.length;
<<<<<<< HEAD
renderCart();
=======
renderProducts();
>>>>>>> 1823270f266dc46be4ea0af36d6f80a9b8cbea50

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
<<<<<<< HEAD

async function renderCart() {
  const products = await getCartProducts();

  products.forEach((product) => {
    cartElement.appendChild(createCartCard(product));
  });
=======
function showMessage(message){
    messageElement.textContent = message;
    messageElement.hidden = false;
>>>>>>> 1823270f266dc46be4ea0af36d6f80a9b8cbea50
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

<<<<<<< HEAD
function createPopover() {
  popoverContainer.innerHTML = `
    <div id="checkout-popover" popover>
  `;
=======
async function renderProducts(){
    cartElement.innerHTML = "";
    totalPriceCart = 0;
    const productList = await getproducts();
    if (productList.length === 0) {
        cartElement.innerHTML = `
            <div class="empty-state">
                <h2>Din varukorg är tom</h2>
                <a class="button" href="products.html">Hitta produkter</a>
            </div>
        `;
        totalPriceElement.textContent = "0";
        totalProductsElement.textContent = "0";
        return;
    }
    // console.log(productList)
    for(const product of productList){
        // console.log(product, product.quantity)
        const productCard = createCard(product);
        cartElement.appendChild(productCard);
    }
>>>>>>> 1823270f266dc46be4ea0af36d6f80a9b8cbea50

  const popoverElement = popoverContainer.querySelector("#checkout-popover");
  renderCheckoutProducts(popoverElement);
}
<<<<<<< HEAD

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
=======
function createCard(product){
    const totalPrice = (Math.round(product.price * 100) * product.quantity);
    console.log(totalPrice)
    totalPriceCart += totalPrice;
    totalPriceElement.textContent = `${(totalPriceCart/100).toFixed(2)} US$`;
    const cardElement = document.createElement("div");
    cardElement.classList.add("cart-card");
    
    cardElement.innerHTML = `
    <a href="product.html?id=${product.id}" aria-label="Visa ${product.title}">
        <img class="product-img" src="${product.thumbnail || product.images?.[0] || ""}" alt="${product.title}">
    </a>
               
                <p class="product-description">
                <strong>${product.title}</strong><br>${product.description}
                </p>
                <span class = "card-price-container">
                    <div class="card-price">Price ${product.price}</div>
                    <div class="card-quantity">
                        <div id="increase">+</div>
                        <div><span class="quantity">${product.quantity}</span></div>
                        <div id="decrease">-</div>
                    </div>
                    <div class="card-price-total">Total: <span class = "product-total-price">${(totalPrice/100).toFixed(2)}</span> </div>
                </span>
>>>>>>> 1823270f266dc46be4ea0af36d6f80a9b8cbea50
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
<<<<<<< HEAD
=======

function updateQuantity(cardElement, product){
    const productQuantityCardElement = cardElement.querySelector(".quantity")
    const productTotalPriceElement = cardElement.querySelector(".product-total-price")
    cardElement.addEventListener("click", (e) =>{
       
        if(e.target.closest("#increase")){
            addProduct(product);
            updateProductQuantity(product, productTotalPriceElement, productQuantityCardElement);
            updateTotalCartInfo(e, product);

        }else if(e.target.closest("#decrease")){
            removeProduct(product);
            updateProductQuantity(product, productTotalPriceElement, productQuantityCardElement);
            updateTotalCartInfo(e, product);
            if(product.quantity === 0){
           
                cardElement.remove();
                //ATT GÖRA: ta bort från cart och skicka till browersminnet

            }

        }
    })
}
function removeProduct(product){
    product.quantity--;
    cart = getCart();
    const removeIndex = cart.findIndex(item => item === product.id);
    cart.splice(removeIndex, 1);
    saveCart(cart);
    console.log(cart)
    cart = getCart()
    console.log(cart)
}

function addProduct(product){
    product.quantity++;
    cart = getCart();
    cart.push(product.id);
    saveCart(cart);
}
function updateProductQuantity(product, productTotalPriceElement, quantityElement){
    quantityElement.textContent = product.quantity;
    productTotalPriceElement.textContent = (product.price * product.quantity).toFixed(2);
}

function updateTotalCartInfo(e, product){
    console.log(e.target)
    if(e.target.closest("#increase")){
        totalPriceCart+= Math.round(product.price * 100);
        totalPriceElement.textContent = `${(totalPriceCart/100).toFixed(2)} US$`;
        totalProductsElement.textContent = cart.length;

    }else if(e.target.closest("#decrease")){
        totalPriceCart-= Math.round(product.price * 100)
        totalPriceElement.textContent = `${(totalPriceCart/100).toFixed(2)} US$`;
        cart = getCart();
        totalProductsElement.textContent = cart.length;
        if (cart.length === 0) {
            totalPriceElement.textContent = "0";
        }
    }
}
function createPopover(){
    popoverContainer.innerHTML = `
        <div id="checkout-popover" popover></div>
    `;
    const popoverElement = popoverContainer.querySelector("#checkout-popover"); 
    createCheckoutElements(popoverElement);
    
}
async function createCheckoutElements(checkoutContainer){
    const productList = await getproducts();

    productList.forEach(product => {
        const productElement = document.createElement("div");
        productElement.classList.add("checkout-product");
        productElement.innerHTML = `
        <img class = "checkout-product-img" src= "${product.thumbnail}" alt= "picture of product">
        <div class = "checkout-product-info">
            <h3>${product.title}</h3>
            <p>Amount ${product.quantity}</p>
            <p>Price ${product.price}</p>
            <p>Total price ${product.quantity * product.price}</p>
        </div>
        `;
        checkoutContainer.appendChild(productElement);
    });

    const buyBtn = document.createElement("button");
    buyBtn.textContent = "Purchase";
    buyBtn.classList.add("buy-btn");
    buyBtn.addEventListener("click", () => {
        saveCart([]);
        cart = [];
        checkoutContainer.hidePopover();
        popoverContainer.innerHTML = "";
        renderProducts();
        showMessage("Tack! Demonstrationsköpet är klart.");
    });
    const checkoutSummaryPanel = document.createElement("div");
    checkoutSummaryPanel.classList.add("checkout-summary-panel"); 
    checkoutSummaryPanel.appendChild(buyBtn);
    checkoutContainer.appendChild(checkoutSummaryPanel);
    
}







>>>>>>> 1823270f266dc46be4ea0af36d6f80a9b8cbea50
