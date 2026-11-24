
import { setUpNavigation, updateNavigationCounts } from "./js/api.js";

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

let editingProductId = null;
let editingProductCard = null;
let editingOriginalProduct = null;


// GET - Hämta produkter

async function getItems() {
  try {
    statusMessage.textContent = "Laddar produkter...";

    const response = await fetch(`${API_URL}?limit=12`);

    if (!response.ok) {
      throw new Error("Kunde inte hämta produkterna");
    }

    const data = await response.json();

    displayProducts(data.products);

    statusMessage.textContent = "";

  } catch (error) {
    statusMessage.textContent =
      "Det gick inte att hämta produkterna.";

    console.error(error);
  }
}


async function getCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`);

    if (!response.ok) {
      throw new Error("Kunde inte hämta kategorier");
    }

    const categories = await response.json();

    const categorySelect = document.querySelector("#category");

    categories.forEach((category) => {
      const option = document.createElement("option");

      option.value = category.slug;
      option.textContent = category.name;

      categorySelect.appendChild(option);
    });

  } catch (error) {
    console.error(error);
  }
}

// POST - Skapa produkt

async function createProduct(product) {
  const response = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(product)
  });

  if (!response.ok) {
    throw new Error("Kunde inte skapa produkten");
  }

  return await response.json();
}


// PUT - Uppdatera produkt

async function updateProduct(id, product) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(product)
  });

  if (!response.ok) {
    throw new Error("Kunde inte uppdatera produkten");
  }

  return await response.json();
}


// DELETE - Ta bort produkt

async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Kunde inte ta bort produkten");
  }

  return await response.json();
}


// Skapa produktkort

function createProductCard(product) {
  const productCard = document.createElement("div");
  productCard.classList.add("product-card");

  // Produktbild
  const image = document.createElement("img");
  image.src = product.thumbnail || "";
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

  productCard.append(
    title,
    price,
    category,
    description,
    editButton,
    deleteButton
  );

  return productCard;
}


// Visa produkter

function displayProducts(products) {
  productList.innerHTML = "";

  products.forEach((product) => {
    const card = createProductCard(product);
    productList.appendChild(card);
  });
}


// Hämta information från formuläret

function getFormData() {
  const priceInput = document.querySelector("#price").value.trim();

  return {
    title: document.querySelector("#title").value.trim(),
    price: priceInput === "" ? NaN : Number(priceInput),
    description: document.querySelector("#description").value.trim(),
    category: document.querySelector("#category").value.trim()
  };
}


// Återställ formuläret till CREATE-läge

function resetForm() {
  productForm.reset();

  editingProductId = null;
  editingProductCard = null;
  editingOriginalProduct = null;

  saveButton.textContent = "Lägg till produkt";
  productSummary.textContent = "Lägg till produkt";

  document.querySelector("#image-field").hidden = false;
}


// Redigera en produkt

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

  if (
    !product.title ||
    !product.category ||
    !Number.isFinite(product.price) ||
    product.price < 0
  ) {
    statusMessage.textContent = "Kontrollera produktuppgifterna.";
    return;
  }

  const isEditing = editingProductId !== null;

  try {
    saveButton.disabled = true;

    statusMessage.textContent = isEditing
      ? "Uppdaterar produkt..."
      : "Sparar produkt...";

    if (isEditing) {

      // Lokalt skapade produkter finns inte hos API:et
      const updatedProduct = editingOriginalProduct.isLocal
        ? product
        : await updateProduct(editingProductId, product);

      const completeProduct = {
        ...editingOriginalProduct,
        ...updatedProduct,
        thumbnail: editingOriginalProduct.thumbnail
      };

      const newCard = createProductCard(completeProduct);

      editingProductCard.replaceWith(newCard);

      statusMessage.textContent = "Produkten har uppdaterats.";

    } else {

      const newProduct = await createProduct(product);

      const imageInput = document.querySelector("#product-image");
      const imageFile = imageInput.files[0];

      const completeProduct = {
        ...newProduct,
        isLocal: true
      };

      // Om användaren har valt en bildfil
      if (imageFile) {
        completeProduct.thumbnail = URL.createObjectURL(imageFile);
      }

      const newCard = createProductCard(completeProduct);

      productList.prepend(newCard);

      statusMessage.textContent = "Produkten har lagts till.";
    }

    resetForm();
    productDetails.open = false;

  } catch (error) {
    statusMessage.textContent = isEditing
      ? "Det gick inte att uppdatera produkten."
      : "Det gick inte att lägga till produkten.";

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


// Hantera DELETE

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

    // Skicka bara DELETE om produkten finns hos API:et
    if (!product.isLocal) {
      await deleteProduct(product.id);
    }

    // Ta bort produktkortet från sidan
    productCard.remove();

    // Återställ formuläret om vi redigerar denna produkt
    if (editingProductCard === productCard) {
      resetForm();
      productDetails.open = false;
    }

    statusMessage.textContent = "Produkten har tagits bort.";

  } catch (error) {
    statusMessage.textContent = "Det gick inte att ta bort produkten.";

    console.error(error);

  } finally {
    deleteButton.disabled = false;
  }
}


productForm.addEventListener("submit", handleSubmit);


// Avbryt-knapp

const cancelButton = document.createElement("button");
cancelButton.type = "button";
cancelButton.textContent = "Avbryt";
cancelButton.id = "cancel-edit";

productForm.appendChild(cancelButton);

cancelButton.addEventListener("click", cancelEditing);

getCategories()
getItems();
