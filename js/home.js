// Startsidan: visa fyra produkter från DummyJSON.
import { getProducts, getFavorites, getProductImage, createProductCard, setUpNavigation, setUpProductButtons, showPageError } from "./api.js";

// Steg 1: markera startsidan och sätt upp gemensam navigation.
setUpNavigation("home");

async function startHome() {
  try {
    // Steg 2: hämta produkterna och välj de fyra första till startsidan.
    const products = await getProducts();
    const fourProducts = products.slice(0, 4);
    const grid = document.querySelector("#featured-products");
    const hero = document.querySelector("#hero-product-image");

    // Steg 3: använd den första produktbilden i sidans stora introduktionsbild.
    if (products.length > 0) {
      hero.src = getProductImage(products[0]);
    }

    // Steg 4: rita om korten så att favoritknapparna visar aktuellt sparat läge.
    function showCards() {
      grid.innerHTML = fourProducts.map(product => createProductCard(product, getFavorites())).join("");
    }

    showCards();

    // Steg 5: koppla favoritknapparna till uppdatering och omritning av korten.
    setUpProductButtons(products, showCards);
  } catch (error) {
    // Visa ett begripligt fel om API-anropet eller sidans initiering misslyckas.
    showPageError(error);
  }
}

// Steg 6: starta laddningen när modulen körs.
startHome();
