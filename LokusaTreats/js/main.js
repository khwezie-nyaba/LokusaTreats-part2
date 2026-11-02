/* ==========================================================

   MAIN.JS

   General site behaviour: mobile nav toggle, footer year,

   header Search/Account links, and scroll-reveal animations

   (Part 3: animations/DOM manipulation).

========================================================== */



// First name of whoever is logged in (set up by auth.js on account.html)

function getLoggedInFirstName() {

  try {

    const email = localStorage.getItem("lokusa_session");

    if (!email) return null;

    const users = JSON.parse(localStorage.getItem("lokusa_users") || "{}");

    const user = users[email];

    return user && user.name ? user.name.split(" ")[0] : null;

  } catch (err) {

    return null;

  }

}



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



  // Header: make Search and Account work on every page, and greet

  // the customer by name once they are logged in.

  document.querySelectorAll(".header-actions a").forEach(function (link) {

    const label = link.textContent.trim().toLowerCase();

    if (label === "search") {

      link.setAttribute("href", "search.html");

    } else if (label === "account") {

      link.setAttribute("href", "account.html");

      const firstName = getLoggedInFirstName();

      if (firstName) {

        link.textContent = "Hi, " + firstName;

      }

    }

  });



  // Scroll-reveal animation: every <section> fades/slides in the

  // first time it enters the viewport. No HTML changes needed —

  // this finds and tags the sections itself (DOM manipulation).

  const sections = document.querySelectorAll("main section");

  if (sections.length && "IntersectionObserver" in window) {

    sections.forEach(function (section) {

      section.classList.add("reveal");

    });



    const observer = new IntersectionObserver(function (entries, obs) {

      entries.forEach(function (entry) {

        if (entry.isIntersecting) {

          entry.target.classList.add("reveal-visible");

          obs.unobserve(entry.target);

        }

      });

    }, { threshold: 0.15 });



    sections.forEach(function (section) {

      observer.observe(section);

    });

  }



});

