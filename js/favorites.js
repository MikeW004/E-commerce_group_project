// Favoriter: visa sparade produkter.
import { getProducts, getFavorites, createProductCard, setUpNavigation, setUpProductButtons, showPageError } from "./api.js";

// Steg 1: markera favoritsidan och visa räknaren i navigationen.
setUpNavigation("favorites");

async function startFavorites() {
  try {
    // Steg 2: hämta produktinformationen som behövs för att visa sparade ID:n.
    const products = await getProducts();
    const grid = document.querySelector("#favorite-products");

    // Steg 3: matcha sparade produkt-ID:n mot produktlistan och rita resultatet.
    function showFavorites() {
      const ids = getFavorites();
      const favorites = products.filter(product => ids.includes(product.id));

      // Visa ett hjälpsamt tomt läge om inga produkter är sparade.
      if (favorites.length === 0) {
        grid.innerHTML = `<div class="empty-state favorite-empty-state">
          <h2>Du har inga favoriter än</h2>
          <p>Tryck på hjärtat vid en produkt för att spara den här.</p>
          <a class="button" href="products.html">Hitta produkter</a>
        </div>`;
        return;
      }

      grid.innerHTML = favorites.map(product => createProductCard(product, ids)).join("");
    }

    showFavorites();

    // Steg 4: låt användaren ta bort en favorit och uppdatera listan direkt.
    setUpProductButtons(products, showFavorites);
  } catch (error) {
    // Visa felmeddelande om produkterna inte kan hämtas.
    showPageError(error);
  }
}

// Steg 5: starta favoritsidans laddning.
startFavorites();
