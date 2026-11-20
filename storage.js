export function saveCart(cart) {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
        return true;
    } catch {
        return false;
    }
}

export function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem("cart"));
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}