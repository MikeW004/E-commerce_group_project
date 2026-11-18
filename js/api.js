// Gemensamma funktioner som används på flera sidor.
export const API_URL = "https://dummyjson.com/products";

// Favoriter sparas separat så de finns kvar efter omladdning och sidbyte.
const STORAGE_KEYS = {
  favorites: "form-funktion-favorites",
};

let noticeTimer;

// Läser en lista från localStorage och hanterar skadad eller otillgänglig data.
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

// Sparar en lista som JSON; false gör att anroparen kan avbryta vid fel.
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showNotice("Det gick inte att spara ändringen i webbläsaren.", "error");
    return false;
  }
}

// Dessa två funktioner ger resten av projektet ett gemensamt favorit-API.
export function getFavorites() {
  return readFromStorage(STORAGE_KEYS.favorites);
}

export function saveFavorites(favorites) {
  return saveToStorage(STORAGE_KEYS.favorites, favorites);
}

// Visar ett tillfälligt meddelande och stänger det efter angiven tid.
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

// Visar laddningsindikatorn medan ett nätverksanrop pågår och döljer den efteråt.
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

// Hämtar produktlistan som används på startsidan och favoritsidan.
export async function getProducts() {
  const result = await fetchJson(`${API_URL}?limit=100`);
  return result.products;
}

// Gör text säker att lägga in i HTML som skapas från produktdata.
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

// Formaterar priset med svensk talformatering och valutan amerikanska dollar.
export function formatPrice(price) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

// Väljer produktens miniatyrbild, eller första bilden som reserv.
export function getProductImage(product) {
  return product.thumbnail || product.images?.[0] || "";
}

// Bygger ett produktkort med länk till detaljsidan och en favoritknapp.
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

    </article>
  `;
}

// Ersätter sidinnehållet med ett felmeddelande och en knapp för omladdning.
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

// Markerar aktuell sida och kopplar hamburgermenyns öppna/stäng-beteende.
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
    const menuIsOpen = menuButton.getAttribute("aria-expanded") === "true";
    const shouldOpenMenu = !menuIsOpen;

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

// Uppdaterar favoritantalet i navigationen från localStorage.
export function updateNavigationCounts() {
  const favoriteCount = document.querySelector("#favorite-count");

  if (favoriteCount) {
    favoriteCount.textContent = getFavorites().length;
  }
}

// En gemensam klicklyssnare hanterar favoritknappar även efter att korten ritats om.
export function setUpProductButtons(products, afterFavoriteChange) {
  document.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="favorite"]');

    if (!button) {
      return;
    }

    const product = products.find((item) => {
      return String(item.id) === button.dataset.id;
    });

    if (!product) {
      showNotice("Produkten hittades inte. Ladda om sidan och försök igen.", "error");
      return;
    }

    changeFavorite(product, afterFavoriteChange);
  });
}

// Lägger till eller tar bort produkten, sparar resultatet och uppdaterar sidan.
function changeFavorite(product, afterFavoriteChange) {
  const currentFavorites = getFavorites();
  const isAlreadyFavorite = currentFavorites.includes(product.id);
  let updatedFavorites;

  // Skapa en ny lista utan produkten, eller lägg till dess ID.
  if (isAlreadyFavorite) {
    updatedFavorites = currentFavorites.filter((id) => id !== product.id);
  } else {
    updatedFavorites = [...currentFavorites, product.id];
  }

  if (!saveFavorites(updatedFavorites)) {
    return;
  }

  // Uppdatera räknaren och visa besked först efter att lagringen lyckats.
  updateNavigationCounts();

  if (isAlreadyFavorite) {
    showNotice("Produkten har tagits bort från favoriterna.");
  } else {
    showNotice("Produkten har sparats som favorit.");
  }

  if (afterFavoriteChange) {
    afterFavoriteChange();
  }
}
