import {
  getProducts,
  getFavorites,
  createProductCard,
  setUpNavigation,
  setUpProductButtons,
  showPageError,
} from "./api.js";

setUpNavigation("favorites");

async function startFavorites() {
  try {
    const products = await getProducts();
    const grid = document.querySelector("#favorite-products");

    function showFavorites() {
      const ids = getFavorites();
      const favorites = products.filter(product => ids.includes(product.id));

      if (favorites.length === 0) {
        grid.innerHTML = `<div class="empty-state favorite-empty-state">
          <h2>Du har inga favoriter än</h2>
          <p>Tryck på hjärtat vid en produkt för att spara den här.</p>
          <a class="button" href="products.html">Hitta produkter</a>
        </div>`;
        return;
      }

      grid.innerHTML = favorites
        .map(product => createProductCard(product, ids))
        .join("");
    }

    showFavorites();
    setUpProductButtons(products, showFavorites);
  } catch (error) {
    showPageError(error);
  }
}

startFavorites();
