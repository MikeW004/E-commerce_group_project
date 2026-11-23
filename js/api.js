import {
  getCart,
  getStoredProducts,
  hasStoredProducts,
  saveCart,
} from "../storage.js";

export const API_URL = "https://dummyjson.com/products";

const STORAGE_KEYS = {
  favorites: "form-funktion-favorites",
};

let noticeTimer;

export function readFromStorage(key) {
  let savedValue;

  try {
    savedValue = localStorage.getItem(key);
  } catch {
    showNotice("Det gick inte att läsa sparade uppgifter i webbläsaren.", "error");
    return [];
  }

  if (savedValue === null) {
    return [];
  }

  let savedData;
  try {
    savedData = JSON.parse(savedValue);
  } catch {
    showNotice("Sparade uppgifter i webbläsaren är ogiltiga.", "error");
    return [];
  }

  if (!Array.isArray(savedData)) {
    showNotice("Sparade uppgifter i webbläsaren har ett ogiltigt format.", "error");
    return [];
  }

  return savedData;
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showNotice("Det gick inte att spara ändringen i webbläsaren.", "error");
    return false;
  }
}

export function getFavorites() {
  return readFromStorage(STORAGE_KEYS.favorites);
}

export function saveFavorites(favorites) {
  return saveToStorage(STORAGE_KEYS.favorites, favorites);
}

export function showNotice(message, type = "success", duration = 4500) {
  const notice = document.querySelector("#status-message");

  if (!notice) {
    return;
  }

  window.clearTimeout(noticeTimer);
  notice.textContent = message;
  notice.dataset.kind = type;
  notice.hidden = false;

  noticeTimer = window.setTimeout(() => {
    notice.hidden = true;
  }, duration);
}

export async function fetchJson(url, options = {}, loadingMessage = "Laddar produkter...") {
  const loadingBox = document.querySelector("#loading-message");
  const loadingText = document.querySelector("#loading-text");

  if (loadingBox && loadingText) {
    loadingText.textContent = loadingMessage;
    loadingBox.hidden = false;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Begäran misslyckades (${response.status}). Försök igen.`);
    }

    return await response.json();
  } finally {
    if (loadingBox) {
      loadingBox.hidden = true;
    }
  }
}

export async function getProducts() {
  if (hasStoredProducts()) {
    return getStoredProducts();
  }

  const result = await fetchJson(`${API_URL}?limit=100`);
  return result.products;
}

export function escapeHtml(value = "") {
  const charactersToReplace = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(value).replace(/[&<>"']/g, (character) => {
    return charactersToReplace[character];
  });
}

export function formatPrice(price) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function getProductImage(product) {
  return product.thumbnail || product.images?.[0] || "";
}

export function createProductCard(product, favorites = getFavorites()) {
  const isFavorite = favorites.includes(product.id);
  const favoriteText = isFavorite ? "Ta bort från" : "Lägg till i";
  const favoriteIcon = isFavorite ? "♥" : "♡";

  return `
    <article class="product-card">
      <div class="product-image-wrap">
        <a
          href="product.html?id=${encodeURIComponent(product.id)}"
          aria-label="Visa ${escapeHtml(product.title)}"
        >
          <img
            class="product-image"
            src="${escapeHtml(getProductImage(product))}"
            alt="${escapeHtml(product.title)}"
            loading="lazy"
          >
        </a>
        <button
          class="favorite-button"
          type="button"
          data-action="favorite"
          data-id="${product.id}"
          aria-label="${favoriteText} favoriter: ${escapeHtml(product.title)}"
          aria-pressed="${isFavorite}"
        >${favoriteIcon}</button>
      </div>

      <p class="card-category">${escapeHtml(product.category || "Övrigt")}</p>
      <h3 class="card-title">
        <a href="product.html?id=${encodeURIComponent(product.id)}">
          ${escapeHtml(product.title)}
        </a>
      </h3>

      <div class="card-meta">
        <span class="price">${formatPrice(product.price)}</span>
        <span class="card-rating" aria-label="Betyg ${product.rating ?? "saknas"} av 5">
          ★ ${product.rating ?? "–"}
        </span>
      </div>

      <div class="card-actions">
        <button
          class="button small"
          type="button"
          data-action="add-to-cart"
          data-id="${product.id}"
          aria-label="Lägg ${escapeHtml(product.title)} i varukorgen"
        >Lägg i varukorgen</button>
      </div>
    </article>
  `;
}

export function showPageError(error) {
  const pageContent = document.querySelector("#page-content");

  if (!pageContent) {
    return;
  }

  const errorMessage = error.message || "Ett nätverksfel inträffade.";

  pageContent.innerHTML = `
    <section class="page-shell">
      <div class="error-state">
        <h2>Vi kunde inte ladda produkterna.</h2>
        <p>${escapeHtml(errorMessage)}</p>
        <button class="button" type="button" id="retry-loading">
          Försök igen
        </button>
      </div>
    </section>
  `;

  document.querySelector("#retry-loading").addEventListener("click", () => {
    window.location.reload();
  });
}

export function setUpNavigation(activePage) {
  const navigationLinks = document.querySelectorAll("[data-nav]");

  navigationLinks.forEach((link) => {
    if (link.dataset.nav === activePage) {
      link.setAttribute("aria-current", "page");
    }
  });

  updateNavigationCounts();

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-navigation");

  if (!menuButton || !navigation) {
    return;
  }

  menuButton.addEventListener("click", () => {
    const shouldOpenMenu = menuButton.getAttribute("aria-expanded") !== "true";

    menuButton.setAttribute("aria-expanded", String(shouldOpenMenu));
    menuButton.setAttribute(
      "aria-label",
      shouldOpenMenu ? "Stäng meny" : "Öppna meny",
    );
    navigation.classList.toggle("is-open", shouldOpenMenu);
  });

  navigation.addEventListener("click", (event) => {
    if (!event.target.closest("a")) {
      return;
    }

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Öppna meny");
    navigation.classList.remove("is-open");
  });
}

export function updateNavigationCounts() {
  const favoriteCount = document.querySelector("#favorite-count");

  if (favoriteCount) {
    favoriteCount.textContent = getFavorites().length;
  }
}

export function setUpProductButtons(products, afterFavoriteChange) {
  document.addEventListener("click", (event) => {
    const cartButton = event.target.closest('[data-action="add-to-cart"]');

    if (cartButton) {
      const product = products.find((item) => String(item.id) === cartButton.dataset.id);

      if (!product) {
        showNotice("Produkten hittades inte. Ladda om sidan och försök igen.", "error");
        return;
      }

      try {
        saveCart([...getCart(), product.id]);
        showNotice("Produkten har lagts till i varukorgen.");
      } catch (error) {
        console.error(error);
        showNotice("Det gick inte att lägga till produkten i varukorgen.", "error");
      }

      return;
    }

    const button = event.target.closest('[data-action="favorite"]');

    if (!button) {
      return;
    }

    const product = products.find((item) => String(item.id) === button.dataset.id);

    if (!product) {
      showNotice("Produkten hittades inte. Ladda om sidan och försök igen.", "error");
      return;
    }

    changeFavorite(product, afterFavoriteChange);
  });
}

function changeFavorite(product, afterFavoriteChange) {
  const currentFavorites = getFavorites();
  const isAlreadyFavorite = currentFavorites.includes(product.id);
  const updatedFavorites = isAlreadyFavorite
    ? currentFavorites.filter((id) => id !== product.id)
    : [...currentFavorites, product.id];

  if (!saveFavorites(updatedFavorites)) {
    return;
  }

  updateNavigationCounts();
  showNotice(
    isAlreadyFavorite
      ? "Produkten har tagits bort från favoriterna."
      : "Produkten har sparats som favorit.",
  );

  if (afterFavoriteChange) {
    afterFavoriteChange();
  }
}
