/* ==========================================================
   CART.JS
   Handles the shopping cart using the browser's localStorage,
   so it persists as a customer moves between pages.
   NOTE: This is client-side only. No real payment is
   processed here — see the note in checkout.html for where
   a payment gateway (e.g. PayFast) would be connected.
========================================================== */

const CART_KEY = "lokusa_cart";
const LAST_ORDER_KEY = "lokusa_last_order";

const SHIPPING_RATES = {
  standard: { label: "Standard Delivery (3–5 working days)", price: 60 },
  express:  { label: "Express Delivery (1–2 working days)", price: 120 }
};
const FREE_SHIPPING_THRESHOLD = 500; // standard shipping is free above this subtotal

/* ---------- Core cart storage ---------- */

function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCountDisplay();
}

function addToCart(productId, qty) {
  qty = qty || 1;
  const product = findProduct(productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(function (item) { return item.id === productId; });

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: qty
    });
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter(function (item) { return item.id !== productId; });
  saveCart(cart);
}

function updateCartItemQty(productId, qty) {
  qty = Math.max(1, parseInt(qty, 10) || 1);
  const cart = getCart();
  const item = cart.find(function (i) { return i.id === productId; });
  if (item) {
    item.qty = qty;
    saveCart(cart);
  }
}

function clearCart() {
  saveCart([]);
}

/* ---------- Totals ---------- */

function getCartCount() {
  return getCart().reduce(function (sum, item) { return sum + item.qty; }, 0);
}

function getCartSubtotal() {
  return getCart().reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
}

function formatCurrency(amount) {
  return "R " + amount.toFixed(2);
}

/* ---------- Header cart-count badge (every page) ---------- */

function updateCartCountDisplay() {
  const count = getCartCount();
  document.querySelectorAll(".cart-count").forEach(function (el) {
    el.textContent = count;
  });
}

/* ---------- "Add to Cart" buttons (index/shop/product pages) ---------- */

function initAddToCartButtons() {
  document.querySelectorAll(".btn-add-cart").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const productId = btn.getAttribute("data-product-id");
      const qtyInput = btn.closest("[data-product-wrapper]")
        ? btn.closest("[data-product-wrapper]").querySelector(".qty-input")
        : null;
      const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

      addToCart(productId, qty);

      const originalText = btn.textContent;
      btn.textContent = "Added ✓";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 1200);
    });
  });
}

/* ---------- Cart page (cart.html) ---------- */

function renderCartPage() {
  const cartTableBody = document.getElementById("cart-table-body");
  const emptyMessage = document.getElementById("cart-empty-message");
  const cartTable = document.getElementById("cart-table");
  const summarySubtotal = document.getElementById("cart-subtotal");
  const checkoutLink = document.getElementById("checkout-link");

  if (!cartTableBody) return; // not on the cart page

  const cart = getCart();

  if (cart.length === 0) {
    if (cartTable) cartTable.style.display = "none";
    if (emptyMessage) emptyMessage.style.display = "block";
    if (checkoutLink) checkoutLink.setAttribute("aria-disabled", "true");
    if (summarySubtotal) summarySubtotal.textContent = formatCurrency(0);
    return;
  }

  if (cartTable) cartTable.style.display = "table";
  if (emptyMessage) emptyMessage.style.display = "none";

  cartTableBody.innerHTML = "";

  cart.forEach(function (item) {
    const row = document.createElement("tr");
    row.innerHTML =
      '<td class="cart-product-cell">' +
        '<img src="' + item.image + '" alt="' + item.name + '" class="cart-thumb">' +
        '<span>' + item.name + '</span>' +
      '</td>' +
      '<td>' + formatCurrency(item.price) + '</td>' +
      '<td>' +
        '<input type="number" min="1" value="' + item.qty + '" class="qty-input" data-id="' + item.id + '" aria-label="Quantity for ' + item.name + '">' +
      '</td>' +
      '<td class="cart-line-total">' + formatCurrency(item.price * item.qty) + '</td>' +
      '<td><button class="btn-remove-item" data-id="' + item.id + '" aria-label="Remove ' + item.name + '">Remove</button></td>';
    cartTableBody.appendChild(row);
  });

  if (summarySubtotal) summarySubtotal.textContent = formatCurrency(getCartSubtotal());

  // Quantity changes
  cartTableBody.querySelectorAll(".qty-input").forEach(function (input) {
    input.addEventListener("change", function () {
      updateCartItemQty(input.getAttribute("data-id"), input.value);
      renderCartPage();
    });
  });

  // Remove item
  cartTableBody.querySelectorAll(".btn-remove-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      removeFromCart(btn.getAttribute("data-id"));
      renderCartPage();
    });
  });
}

/* ---------- Checkout page (checkout.html) ---------- */

function getSelectedShippingMethod() {
  const checked = document.querySelector('input[name="shipping-method"]:checked');
  return checked ? checked.value : "standard";
}

function getShippingCost(subtotal) {
  const method = getSelectedShippingMethod();
  if (method === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return SHIPPING_RATES[method] ? SHIPPING_RATES[method].price : 0;
}

function renderCheckoutSummary() {
  const summaryList = document.getElementById("checkout-items");
  const subtotalEl = document.getElementById("checkout-subtotal");
  const shippingEl = document.getElementById("checkout-shipping");
  const totalEl = document.getElementById("checkout-total");

  if (!summaryList) return; // not on the checkout page

  const cart = getCart();

  if (cart.length === 0) {
    // Nothing to check out — send the customer back to the cart
    window.location.href = "cart.html";
    return;
  }

  summaryList.innerHTML = "";
  cart.forEach(function (item) {
    const li = document.createElement("li");
    li.innerHTML =
      '<span>' + item.name + ' &times; ' + item.qty + '</span>' +
      '<span>' + formatCurrency(item.price * item.qty) + '</span>';
    summaryList.appendChild(li);
  });

  const subtotal = getCartSubtotal();
  const shipping = getShippingCost(subtotal);
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? "Free" : formatCurrency(shipping);
  if (totalEl) totalEl.textContent = formatCurrency(total);
}

function initCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  document.querySelectorAll('input[name="shipping-method"]').forEach(function (radio) {
    radio.addEventListener("change", renderCheckoutSummary);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) return;

    const subtotal = getCartSubtotal();
    const shipping = getShippingCost(subtotal);
    const total = subtotal + shipping;

    const order = {
      orderNumber: "LT" + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      customer: {
        name: document.getElementById("full-name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value
      },
      shippingAddress: {
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        province: document.getElementById("province").value,
        postalCode: document.getElementById("postal-code").value
      },
      shippingMethod: SHIPPING_RATES[getSelectedShippingMethod()].label,
      paymentMethod: document.querySelector('input[name="payment-method"]:checked').value,
      items: cart,
      subtotal: subtotal,
      shipping: shipping,
      total: total
    };

    /* ----------------------------------------------------------------
       PAYMENT GATEWAY GOES HERE
       In production, this is where you'd redirect to / call your
       payment gateway (e.g. PayFast) with the order total, then
       only mark the order complete once payment is confirmed
       (usually via a server-side webhook/ITN, not in the browser).
       For now, we simulate a successful order immediately.
    ---------------------------------------------------------------- */

    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    clearCart();
    window.location.href = "order-confirmation.html";
  });
}

/* ---------- Order confirmation page ---------- */

function renderOrderConfirmation() {
  const container = document.getElementById("confirmation-details");
  if (!container) return; // not on the confirmation page

  const raw = localStorage.getItem(LAST_ORDER_KEY);
  if (!raw) {
    window.location.href = "index.html";
    return;
  }
  const order = JSON.parse(raw);

  let itemsHtml = "";
  order.items.forEach(function (item) {
    itemsHtml +=
      '<li><span>' + item.name + ' &times; ' + item.qty + '</span>' +
      '<span>' + formatCurrency(item.price * item.qty) + '</span></li>';
  });

  container.innerHTML =
    '<p><strong>Order Number:</strong> ' + order.orderNumber + '</p>' +
    '<p><strong>Name:</strong> ' + order.customer.name + '</p>' +
    '<p><strong>Email:</strong> ' + order.customer.email + '</p>' +
    '<p><strong>Shipping Address:</strong> ' + order.shippingAddress.address + ', ' +
      order.shippingAddress.city + ', ' + order.shippingAddress.province + ' ' +
      order.shippingAddress.postalCode + '</p>' +
    '<p><strong>Shipping Method:</strong> ' + order.shippingMethod + '</p>' +
    '<p><strong>Payment Method:</strong> ' + order.paymentMethod + '</p>' +
    '<ul class="confirmation-items">' + itemsHtml + '</ul>' +
    '<p><strong>Subtotal:</strong> ' + formatCurrency(order.subtotal) + '</p>' +
    '<p><strong>Shipping:</strong> ' + (order.shipping === 0 ? "Free" : formatCurrency(order.shipping)) + '</p>' +
    '<p class="confirmation-total"><strong>Total Paid:</strong> ' + formatCurrency(order.total) + '</p>';
}

/* ---------- Init on every page ---------- */

document.addEventListener("DOMContentLoaded", function () {
  updateCartCountDisplay();
  initAddToCartButtons();
  renderCartPage();
  renderCheckoutSummary();
  initCheckoutForm();
  renderOrderConfirmation();
});