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

const cartElement = document.querySelector("#cartElement");
const messageElement = document.querySelector("#message");
const totalProductsElement = document.querySelector("#summary-quantity");
const totalPriceElement = document.querySelector("#summary-price");
const checkoutBtn = document.querySelector("#checkout-btn");
const popoverContainer = document.querySelector("#checkout-popover-container");
let totalPriceCart = 0;
// RUN IT!
totalProductsElement.textContent = cart.length;
renderProducts();

cartElement.addEventListener("click", (e) =>{
    // console.log(e.target);
    cartElementEvent(e.target);
});
checkoutBtn.addEventListener("click", () => {
    createPopover();
})

//FUNCTIONS
function cartElementEvent(target){
    if(target.closest(".cart-card")){
        if(target.matches(".product-description") || target.matches(".product-img")){
            // gå till produkt-sida
            console.log("Gå till produktsida")
        }
    }
}
function showMessage(message){
    messageElement.textContent = message;
    messageElement.hidden = false;
}
async function getproducts(){
    //gör en lista vars längd är antalet av samma produkt. "quantityList"
    //gör en ny lista m.h.a. set så att varje produkt endast finns en gång "trimmedCart"
    //använder trimmedCart till korten och quantityList till siffran i varje kort
    cart = getCart();
    const productList =[];
    const cartToSet = new Set(cart);
    const trimmedCart = [...cartToSet];
    
    for(const id of trimmedCart){
        const quantityList = cart.filter(productId => productId === id);
       try{
        const response = await fetch(`https://dummyjson.com/products/${id}`)
        if(!response.ok){
            throw new Error(response.status);
        }

        const product = await response.json();
        product.quantity = quantityList.length;
        productList.push(product);

        }catch(error){
            console.log(error);
            showMessage("failed to fetch product")
        }; 
    }
    return productList;  
}

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

}
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
    `;
    updateQuantity(cardElement, product);
    return cardElement
}

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







