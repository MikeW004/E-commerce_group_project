import { setUpNavigation, updateNavigationCounts } from "./js/api.js";
import {
  getStoredProducts,
  hasStoredProducts,
  saveStoredProducts
} from "./storage.js";

setUpNavigation("admin");
updateNavigationCounts();

const productList = document.querySelector("#product-list");
const statusMessage = document.querySelector("#status");
const productForm = document.querySelector("#product-form");

const productDetails = document.querySelector("#product-details");
const productSummary = document.querySelector("#product-summary");

const saveButton = productForm.querySelector(
  'button[type="submit"]'
);

const API_URL = "https://dummyjson.com/products";

let allProducts = [];
let editingProductId = null;
let editingProductCard = null;
let editingOriginalProduct = null;



async function getItems() {
  try {
    statusMessage.textContent = "Laddar produkter...";

    if (hasStoredProducts()) {
      allProducts = getStoredProducts();
    } else {
      const response = await fetch(`${API_URL}?limit=0`);

      if (!response.ok) {
        throw new Error("Kunde inte hämta produkterna");
      }

      const data = await response.json();
      allProducts = data.products;
      saveStoredProducts(allProducts);
    }

    displayProducts(allProducts);

    statusMessage.textContent = "";

  } catch (error) {
    statusMessage.textContent =
      "Det gick inte att hämta produkterna.";

    console.error(error);
  }
}



function createProductCard(product) {
  const productCard = document.createElement("div");
  productCard.classList.add("product-card");

  // Produktbild
  
    const image = document.createElement("img");
    image.src = product.thumbnail;
    image.alt = product.title;
    image.classList.add("product-image");

    productCard.appendChild(image);
  
  // Produktnamn
  const title = document.createElement("h3");
  title.textContent = product.title;

  // Pris
  const price = document.createElement("p");
  price.textContent = `Price: $${product.price}`;

  // Kategori
  const category = document.createElement("p");
  category.textContent = `Category: ${product.category}`;

  // Beskrivning
  const description = document.createElement("p");
  description.textContent = product.description || "";

  // Redigera-knapp
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Redigera";

  editButton.addEventListener("click", function () {
    const card = this.closest(".product-card");
    startEditing(product, card);
  });

  // Ta bort-knapp
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Ta bort";

  deleteButton.addEventListener("click", function () {
    const card = this.closest(".product-card");
    handleDelete(product, card, this);
  });

  productCard.append(title,price,category,description,editButton,deleteButton);

  return productCard;
}


function displayProducts(products) {
  productList.innerHTML = "";

  products.forEach((product) => {
    const card = createProductCard(product);
    productList.appendChild(card);
  });
}




function getFormData() {
  const priceInput = document.querySelector("#price").value.trim();

  return {
    title: document.querySelector("#title").value.trim(),
    price: priceInput === "" ? NaN : Number(priceInput),
    description: document.querySelector("#description").value.trim(),
    category: document.querySelector("#category").value.trim()
  };
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}



// Återställ formuläret till CREATE-läge
function resetForm() {
  productForm.reset();

  editingProductId = null;
  editingProductCard = null;
  editingOriginalProduct = null;

  saveButton.textContent = "Lägg till produkt";
  productSummary.textContent = "Lägg till produkt";
}


// redigera en produkt
function startEditing(product, productCard) {
  editingProductId = product.id;
  editingProductCard = productCard;
  editingOriginalProduct = product;

  document.querySelector("#title").value = product.title;
  document.querySelector("#price").value = product.price;
  document.querySelector("#description").value =
    product.description || "";
  document.querySelector("#category").value = product.category;
  document.querySelector("#image-field").hidden = true;

  saveButton.textContent = "Spara ändringar";
  productSummary.textContent = "Redigera produkt";

  statusMessage.textContent =
    `Du redigerar nu: ${product.title}`;

  // Öppna formuläret automatiskt
  productDetails.open = true;

  // Scrolla upp till formuläret
  productDetails.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


// Hantera CREATE och UPDATE

async function handleSubmit(event) {
  event.preventDefault();

  const product = getFormData();
  const imageFile = document.querySelector("#product-image").files[0];

  if (!product.title || !product.category ||!Number.isFinite(product.price) ||product.price < 0) {
    statusMessage.textContent = "Kontrollera produktuppgifterna.";
    return;
  }

  const isEditing = editingProductId !== null;

  try {
    saveButton.disabled = true;

    statusMessage.textContent = isEditing? "Uppdaterar produkt..." : "Sparar produkt...";

    if (isEditing) {
      const completeProduct = {
        ...editingOriginalProduct,
        ...product,
        thumbnail: imageFile
          ? await readImageAsDataUrl(imageFile)
          : editingOriginalProduct.thumbnail
      };

      allProducts = allProducts.map((item) =>
        item.id === editingProductId ? completeProduct : item
      );
      saveStoredProducts(allProducts);
      displayProducts(allProducts);

      statusMessage.textContent = "Produkten har uppdaterats.";

    
    } else {
    const completeProduct = {
        ...product,
        id: Math.max(0, ...allProducts.map((item) => Number(item.id) || 0)) + 1,
        thumbnail: imageFile ? await readImageAsDataUrl(imageFile) : "",
        isLocal: true
    };

    allProducts.unshift(completeProduct);
    saveStoredProducts(allProducts);
    displayProducts(allProducts);

    statusMessage.textContent =
        "Produkten har lagts till.";
    }


    resetForm();
    productDetails.open = false;
    document.querySelector("#image-field").hidden = false;

  } catch (error) {
    statusMessage.textContent = isEditing ? "Det gick inte att uppdatera produkten." : "Det gick inte att lägga till produkten.";

    console.error(error);

  } finally {
    saveButton.disabled = false;
  }
}



// Avbryt redigering
function cancelEditing() {
  resetForm();
  productDetails.open = false;
  statusMessage.textContent = "Redigeringen avbröts.";
}



async function handleDelete(product, productCard, deleteButton) {
  const confirmed = confirm(
    `Vill du verkligen ta bort "${product.title}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    deleteButton.disabled = true;
    statusMessage.textContent = "Tar bort produkt...";

    allProducts = allProducts.filter((item) => item.id !== product.id);
    saveStoredProducts(allProducts);
    displayProducts(allProducts);

    // Återställ formuläret om vi redigerar denna produkt
    if (editingProductCard === productCard) {
      resetForm();
      productDetails.open = false;
    }

    statusMessage.textContent =
      "Produkten har tagits bort.";

  } catch (error) {
    statusMessage.textContent =
      "Det gick inte att ta bort produkten.";

    console.error(error);

  } finally {
    deleteButton.disabled = false;
  }
}


productForm.addEventListener("submit", handleSubmit);

//Avbryt-knapp
const cancelButton = document.createElement("button");
cancelButton.type = "button";
cancelButton.textContent = "Avbryt";
cancelButton.id = "cancel-edit";

productForm.appendChild(cancelButton);

cancelButton.addEventListener("click", cancelEditing);


getItems();
