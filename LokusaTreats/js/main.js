/* ==========================================================
   MAIN.JS
   General site behaviour: mobile nav toggle + footer year.
   Cart/checkout logic lives in cart.js.
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

  // Mobile nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("primary-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("nav-menu-open");
    });
  }

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});