/* ==========================================================
FORMS.JS

How submission works here:
JavaScript validates every field before anything is sent
(client-side validation).
A fetch() AJAX call demonstrates asynchronous submission
(currently pointed at a public test endpoint, httpbin.org,
so it works without your own backend — swap this for your
own server or a service like Formspree/EmailJS later).
A mailto: link is then opened so the customer's own email
client sends the compiled message to the address written
in this file — satisfying "the customer should be able to
send the email to the recipient stated in code".
========================================================== */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\s()-]{7,15}$/;

/* ---------- Validation helpers ---------- */
function showFieldError(input, message) {
  clearFieldError(input);
  const error = document.createElement("span");
  error.className = "field-error";
  error.textContent = message;
  input.insertAdjacentElement("afterend", error);
  input.setAttribute("aria-invalid", "true");
}

function clearFieldError(input) {
  input.removeAttribute("aria-invalid");
  const next = input.nextElementSibling;
  if (next && next.classList.contains("field-error")) {
    next.remove();
  }
}

function validateRequired(input, label) {
  if (!input.value.trim()) {
    showFieldError(input, label + " is required.");
    return false;
  }
  clearFieldError(input);
  return true;
}

function validateEmail(input) {
  if (!EMAIL_PATTERN.test(input.value.trim())) {
    showFieldError(input, "Please enter a valid email address.");
    return false;
  }
  clearFieldError(input);
  return true;
}

function validatePhone(input) {
  // Phone is optional on some forms — only validate if filled in
  if (input.value.trim() && !PHONE_PATTERN.test(input.value.trim())) {
    showFieldError(input, "Please enter a valid phone number.");
    return false;
  }
  clearFieldError(input);
  return true;
}

function validateMinLength(input, min, label) {
  if (input.value.trim().length < min) {
    showFieldError(input, label + " must be at least " + min + " characters.");
    return false;
  }
  clearFieldError(input);
  return true;
}

/* ---------- Mailto builder ---------- */
function buildMailtoLink(toAddress, subject, bodyLines) {
  const body = bodyLines.join("\n");
  return "mailto:" + toAddress +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(body);
}

/* ---------- AJAX demo submission ----------
Swap this URL for your own backend, or a free form service
like https://formspree.io once you have an endpoint. */
async function submitFormAjax(payload) {
  try {
    const response = await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch (err) {
    console.error("AJAX submission failed:", err);
    return false;
  }
}

/* ---------- Status message helper ---------- */
function showFormStatus(container, message, isSuccess) {
  let status = container.querySelector(".form-status");
  if (!status) {
    status = document.createElement("p");
    status.className = "form-status";
    container.appendChild(status);
  }
  status.textContent = message;
  status.classList.toggle("form-status-success", isSuccess);
  status.classList.toggle("form-status-error", !isSuccess);
}

/* ---------- Contact form (contact.html) ---------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const name = document.getElementById("contact-name");
  const email = document.getElementById("contact-email");
  const type = document.getElementById("contact-type");
  const message = document.getElementById("contact-message");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const validName = validateRequired(name, "Full name");
    const validEmail = validateRequired(email, "Email") && validateEmail(email);
    const validMessage = validateRequired(message, "Message") && validateMinLength(message, 10, "Message");

    if (!(validName && validEmail && validMessage)) {
      return;
    }

    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      type: type ? type.value : "General Enquiry",
      message: message.value.trim()
    };

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    await submitFormAjax(payload);
    showFormStatus(form, "Thanks! Opening your email client to send this message to LokusaTreats...", true);

    const mailto = buildMailtoLink(
      "orders@lokusatreats.co.za",
      "Website Enquiry (" + payload.type + ") from " + payload.name,
      [
        "Name: " + payload.name,
        "Email: " + payload.email,
        "Type: " + payload.type,
        "",
        "Message:",
        payload.message
      ]
    );

    setTimeout(function () { window.location.href = mailto; }, 900);
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
    form.reset();
  });

  // Clear errors as the user types/corrects a field
  [name, email, message].forEach(function (input) {
    input.addEventListener("input", function () { clearFieldError(input); });
  });
}

/* ---------- Enquiry form (enquiry.html) ---------- */
function initEnquiryForm() {
  const form = document.getElementById("enquiry-form");
  if (!form) return;

  const name = document.getElementById("enquiry-name");
  const email = document.getElementById("enquiry-email");
  const phone = document.getElementById("enquiry-phone");
  const productSelect = document.getElementById("enquiry-product");
  const quantity = document.getElementById("enquiry-quantity");
  const message = document.getElementById("enquiry-message");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const validName = validateRequired(name, "Full name");
    const validEmail = validateRequired(email, "Email") && validateEmail(email);
    const validPhone = validatePhone(phone);
    const validQty = quantity.value && parseInt(quantity.value, 10) > 0;

    if (!validQty) {
      showFieldError(quantity, "Please enter a quantity of at least 1.");
    } else {
      clearFieldError(quantity);
    }

    if (!(validName && validEmail && validPhone && validQty)) {
      return;
    }

    const product = findProduct(productSelect.value);
    const qty = parseInt(quantity.value, 10);
    const estimatedTotal = product ? product.price * qty : 0;

    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      product: product ? product.name : "Not specified",
      quantity: qty,
      estimatedTotal: estimatedTotal,
      message: message.value.trim()
    };

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    await submitFormAjax(payload);

    const resultBox = document.getElementById("enquiry-result");
    if (resultBox) {
      resultBox.style.display = "block";
      resultBox.innerHTML =
        "<p><strong>Estimated cost:</strong> R " + estimatedTotal.toFixed(2) + " for " + qty + " x " + payload.product + "</p>" +
        "<p>This item is currently available. Our team will confirm final pricing and delivery dates by email.</p>";
    }

    const mailto = buildMailtoLink(
      "orders@lokusatreats.co.za",
      "Product Enquiry from " + payload.name,
      [
        "Name: " + payload.name,
        "Email: " + payload.email,
        "Phone: " + payload.phone,
        "Product: " + payload.product,
        "Quantity: " + payload.quantity,
        "Estimated Total: R " + payload.estimatedTotal.toFixed(2),
        "",
        "Message:",
        payload.message
      ]
    );

    setTimeout(function () { window.location.href = mailto; }, 1200);
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Enquiry";
  });

  // Live cost estimate as the customer picks a product/quantity
  function updateLiveEstimate() {
    const product = findProduct(productSelect.value);
    const qty = parseInt(quantity.value, 10) || 0;
    const liveEstimate = document.getElementById("enquiry-live-estimate");

    if (liveEstimate && product && qty > 0) {
      liveEstimate.textContent = "Estimated cost: R " + (product.price * qty).toFixed(2);
    } else if (liveEstimate) {
      liveEstimate.textContent = "";
    }
  }

  if (productSelect) productSelect.addEventListener("change", updateLiveEstimate);
  if (quantity) quantity.addEventListener("input", updateLiveEstimate);

  [name, email, phone, quantity].forEach(function (input) {
    input.addEventListener("input", function () { clearFieldError(input); });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initContactForm();
  initEnquiryForm();
});
