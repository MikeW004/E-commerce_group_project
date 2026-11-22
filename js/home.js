import {
  getProducts,
  getFavorites,
  getProductImage,
  createProductCard,
  setUpNavigation,
  setUpProductButtons,
  showPageError,
} from "./api.js";

setUpNavigation("home");

async function startHome() {
  try {
    const products = await getProducts();
    const fourProducts = products.slice(0, 4);
    const grid = document.querySelector("#featured-products");
    const hero = document.querySelector("#hero-product-image");

    if (products.length > 0) {
      hero.src = getProductImage(products[0]);
    }

    function showCards() {
      const favorites = getFavorites();
      grid.innerHTML = fourProducts
        .map(product => createProductCard(product, favorites))
        .join("");
    }

    showCards();
    setUpProductButtons(products, showCards);
  } catch (error) {
    showPageError(error);
  }
}

startHome();
