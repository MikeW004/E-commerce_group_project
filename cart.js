import { saveCart, getCart } from "./storage.js";
// testa spara något i catalog och sen clg här o se om den uppdateras
let cart = getCart();
// console.log(cart);
// cart.pop();
// saveCart(cart);
console.log(cart);
//listan går nu mellan catalog.js och cart.js som den ska

const menuIcon = document.querySelector("#hamburger-menu-icon");
const mobileMenu = document.querySelector(".mobile-menu");
const cartElement = document.querySelector("#cartElement");
const messageElement = document.querySelector("#message");
const totalProductsElement = document.querySelector("#summary-quantity");
const totalPriceElement = document.querySelector("#summary-price");
const summaryBox = document.querySelector("#cart-info");
const checkoutBtn = document.querySelector("#checkout-btn");
let totalPriceCart = 0;
// RUN IT!
totalProductsElement.textContent = cart.length;
renderProducts();
menuIcon.addEventListener("click", (e) => {
    if(e.target.matches("#hamburger-menu-icon") || e.target.matches(".fa-solid.fa-bars")){
        mobileMenu.classList.toggle("hidden");
    };
});

cartElement.addEventListener("click", (e) =>{
    // console.log(e.target);
    cartElementEvent(e.target);
});
checkoutBtn.addEventListener("click", () => {
    createCheckoutPopover();
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
}
async function getproducts(cart){
    //gör en lista vars längd är antalet av samma produkt. "quantityList"
    //gör en ny lista m.h.a. set så att varje produkt endast finns en gång "trimmedCart"
    //använder trimmedCart till korten och quantityList till siffran i varje kort
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
    const productList = await getproducts(cart);
    // console.log(productList)
    for(const product of productList){
        // console.log(product, product.quantity)
        const productCard = createCard(product);
        cartElement.appendChild(productCard);
    }

}
function createCard(product){
    const totalPrice = product.price * product.quantity
    totalPriceCart += totalPrice;
    totalPriceElement.textContent = totalPriceCart;
    const cardElement = document.createElement("div");
    cardElement.classList.add("cart-card");
    
    cardElement.innerHTML = `
    <img class = "product-img" src= "${product.images[1]}" alt= "picture of product">
               
                <p class="product-description">
                ${product.description}
                </p>
                <span class = "card-price-container">
                    <div class="card-price">Price ${product.price}</div>
                    <div class="card-quantity">
                        <div class="arrow" id="arrow-up"><i class="fa-solid fa-caret-up"></i></div>
                        <div>Quantity <span class="quantity">${product.quantity}</span></div>
                        <div class="arrow" id="arrow-down"><i class="fa-solid fa-caret-down"></i></div>
                    </div>
                    <div class="card-price-total">Total: <span class = "product-total-price">${totalPrice}</span> </div>
                </span>
    `;
    updateQuantity(cardElement, product);
    return cardElement
}

function updateQuantity(cardElement, product){
    const quantityElement = cardElement.querySelector(".quantity")
    const productTotalPriceElement = cardElement.querySelector(".product-total-price")
    cardElement.addEventListener("click", (e) =>{
       
        if(e.target.closest("#arrow-up")){
            product.quantity++;
            cart = getCart();
            cart.push(product.id);
            saveCart(cart);
            quantityElement.textContent = product.quantity;
            productTotalPriceElement.textContent = product.price * product.quantity;
            totalPriceCart+= product.price;
            totalPriceElement.textContent = totalPriceCart;
            totalProductsElement.textContent = cart.length;

        }else if(e.target.closest("#arrow-down")){
            product.quantity--;
            removeProduct(product);
            // ta bort en produkt från cart och spara
            console.log(product)
            quantityElement.textContent = product.quantity;
            productTotalPriceElement.textContent = product.price * product.quantity;
            totalPriceCart-= product.price;
            totalPriceElement.textContent = totalPriceCart;
            cart = getCart();
            totalProductsElement.textContent = cart.length;
            if(product.quantity === 0){
                
                cardElement.remove();
                //ATT GÖRA: ta bort från cart och skicka till browersminnet

            }

        }
    })
}
function removeProduct(product){
    cart = getCart();
    const removeIndex = cart.findIndex(item => item === product.id);
    cart.splice(removeIndex, 1);
    saveCart(cart);
}
async function createCheckoutPopover(){
    let popoverElement = document.createElement("div");
    popoverElement.innerHTML="";
    popoverElement.popover = "auto"
    popoverElement.id = "checkout-popover";
    
    popoverElement = await createCheckoutSummary(popoverElement)
    // console.log(popoverElement)
    summaryBox.appendChild(popoverElement)
    
}
async function createCheckoutSummary(popoverElement){
    cart = getCart();
    console.log(cart.length)
    const productList = await getproducts(cart);
    // console.log(productList)
    for(const product of productList){
        console.log(product.quantity)
        const productElement = document.createElement("div");
        productElement.innerHTML = `
            <h2>${product.title}</h2>
            <p>${product.price}</p>
            <p>${product.price * product.quantity}</p>
            <p>${product.quantity}</p>
        `;
        popoverElement.appendChild(productElement);
        console.log(popoverElement)
    }


    return popoverElement
}






