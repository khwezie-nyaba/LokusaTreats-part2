/* ==========================================================
AUTH.JS
Login system for account.html: create account, log in,
log out, and a small "My Account" panel.
IMPORTANT: this is a browser-only demo login. Accounts are
saved in this browser's localStorage, so they only exist on
the device where they were created, and anyone with access
to the browser could read them. Passwords are salted and
hashed (SHA-256) rather than stored as plain text, but real
security needs a server or a service such as Firebase
Authentication.
Needs forms.js loaded first (it provides the validation
helpers showFieldError, validateRequired, validateEmail and
showFormStatus).
========================================================== */
const USERS_KEY = "lokusa_users";
const SESSION_KEY = "lokusa_session";

/* ---------- Storage helpers ---------- */
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch (err) {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  return getUsers()[email] || null;
}

/* ---------- Password hashing ---------- */
function hasCrypto() {
  return typeof crypto !== "undefined" && !!crypto.subtle;
}

function bytesToHex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), function (b) {
    return ("0" + b.toString(16)).slice(-2);
  }).join("");
}

function randomSalt() {
  if (!hasCrypto()) {
    throw new Error("Web Crypto API is unavailable in this browser.");
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes.buffer);
}

async function hashPassword(password, salt) {
  if (!hasCrypto()) {
    throw new Error("Web Crypto API is unavailable in this browser.");
  }
  const data = new TextEncoder().encode(salt + password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(digest);
}

/* ---------- Core account actions (no page elements needed) ---------- */
async function registerUser(name, email, password) {
  const key = email.trim().toLowerCase();
  const users = getUsers();

  if (users[key]) {
    return { ok: false, error: "exists" };
  }

  try {
    const salt = randomSalt();
    const hash = await hashPassword(password, salt);
    users[key] = { name: name.trim(), email: key, salt: salt, hash: hash };
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, key);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "crypto-unavailable" };
  }
}

async function loginUser(email, password) {
  const key = email.trim().toLowerCase();
  const user = getUsers()[key];

  if (!user) return { ok: false };

  try {
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.hash) return { ok: false };
    localStorage.setItem(SESSION_KEY, key);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "crypto-unavailable" };
  }
}

function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

/* ---------- Validation specific to passwords ---------- */
function validatePassword(input) {
  if (!input) return false;

  const value = String(input.value || "");
  if (value.length < 8 || !/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    if (typeof showFieldError === "function") {
      showFieldError(input, "Use at least 8 characters, with letters and numbers.");
    }
    return false;
  }

  if (typeof clearFieldError === "function") {
    clearFieldError(input);
  }

  return true;
}

function clearFormStatus(form) {
  if (!form || !form.querySelector) return;
  const status = form.querySelector(".form-status");
  if (status) status.remove();
}

// Only allow redirects to pages on this site, e.g. ?next=checkout.html
function getNextPage() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && /^[A-Za-z0-9_-]+\.html$/.test(next) ? next : null;
}

/* ---------- Account page (account.html) ---------- */
function initAuthPage() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const authWrapper = document.getElementById("auth-forms");
  const panel = document.getElementById("account-panel");

  if (!loginForm || !registerForm || !authWrapper || !panel) return;

  const tabs = document.querySelectorAll(".auth-tab");

  function showTab(which) {
    tabs.forEach(function (tab) {
      const active = tab.getAttribute("data-tab") === which;
      tab.classList.toggle("auth-tab-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    loginForm.hidden = which !== "login";
    registerForm.hidden = which !== "register";
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      showTab(tab.getAttribute("data-tab"));
    });
  });

  if (window.location.hash === "#register") showTab("register");

  function renderLastOrder() {
    const box = document.getElementById("account-last-order");
    if (!box) return;

    let order = null;
    try {
      order = JSON.parse(localStorage.getItem("lokusa_last_order"));
    } catch (err) {
      order = null;
    }

    if (!order || !order.items) {
      box.textContent = "You haven't placed an order on this device yet.";
      return;
    }

    const count = order.items.reduce(function (sum, item) {
      return sum + (Number(item.qty) || 0);
    }, 0);

    box.textContent =
      "Last order: " +
      order.orderNumber +
      " (" +
      count +
      (count === 1 ? " item" : " items") +
      ", R " +
      Number(order.total).toFixed(2) +
      ")";
  }

  function renderState() {
    const user = getCurrentUser();
    authWrapper.hidden = !!user;
    panel.hidden = !user;

    if (user) {
      const accountName = document.getElementById("account-name");
      const accountEmail = document.getElementById("account-email");

      if (accountName) accountName.textContent = user.name;
      if (accountEmail) accountEmail.textContent = user.email;

      renderLastOrder();
    }
  }

  function finishSignIn() {
    const next = getNextPage();
    if (next) {
      window.location.href = next;
    } else {
      window.location.reload();
    }
  }

  // ----- Log in -----
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");

    if (!email || !password) return;

    const okEmail =
      typeof validateRequired === "function" && typeof validateEmail === "function"
        ? validateRequired(email, "Email") && validateEmail(email)
        : true;

    const okPassword =
      typeof validateRequired === "function" ? validateRequired(password, "Password") : true;

    if (!(okEmail && okPassword)) return;

    if (!hasCrypto()) {
      if (typeof showFormStatus === "function") {
        showFormStatus(
          loginForm,
          "This browser can't log in on this page. Try opening the site over https or Live Server.",
          false
        );
      }
      return;
    }

    const result = await loginUser(email.value, password.value);
    if (!result.ok) {
      if (typeof showFormStatus === "function") {
        showFormStatus(loginForm, "Incorrect email or password.", false);
      }
      return;
    }

    finishSignIn();
  });

  // ----- Create account -----
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("register-name");
    const email = document.getElementById("register-email");
    const password = document.getElementById("register-password");
    const confirm = document.getElementById("register-confirm");

    if (!name || !email || !password || !confirm) return;

    const okName =
      typeof validateRequired === "function" ? validateRequired(name, "Full name") : true;

    const okEmail =
      typeof validateRequired === "function" && typeof validateEmail === "function"
        ? validateRequired(email, "Email") && validateEmail(email)
        : true;

    const okPassword =
      typeof validateRequired === "function" && typeof clearFieldError === "function"
        ? validateRequired(password, "Password") && validatePassword(password)
        : true;

    let okConfirm =
      typeof validateRequired === "function"
        ? validateRequired(confirm, "Password confirmation")
        : true;

    if (okConfirm && confirm.value !== password.value) {
      if (typeof showFieldError === "function") {
        showFieldError(confirm, "Passwords do not match.");
      }
      okConfirm = false;
    }

    if (!(okName && okEmail && okPassword && okConfirm)) return;

    if (!hasCrypto()) {
      if (typeof showFormStatus === "function") {
        showFormStatus(
          registerForm,
          "This browser can't create accounts on this page. Try opening the site over https or Live Server.",
          false
        );
      }
      return;
    }

    const result = await registerUser(name.value, email.value, password.value);
    if (!result.ok) {
      if (typeof showFieldError === "function") {
        showFieldError(email, "An account with this email already exists. Try logging in.");
      }
      return;
    }

    finishSignIn();
  });

  // Clear old messages as people type
  [loginForm, registerForm].forEach(function (form) {
    form.addEventListener("input", function (e) {
      if (typeof clearFormStatus === "function") clearFormStatus(form);
      if (
        e.target &&
        e.target.tagName === "INPUT" &&
        typeof clearFieldError === "function"
      ) {
        clearFieldError(e.target);
      }
    });
  });

  // ----- Log out -----
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      logoutUser();
      window.location.reload();
    });
  }

  renderState();
}

document.addEventListener("DOMContentLoaded", initAuthPage);