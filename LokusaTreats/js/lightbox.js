/* ==========================================================

   LIGHTBOX.JS

   Click any gallery photo to open it full-size with next/prev

   navigation and keyboard support (Esc, Left, Right).

   Required by Part 3: "Implement a gallery with a lightbox

   to display images in a larger view when clicked."



   Works automatically on any page with elements matching:

   .gallery-item img

   No HTML changes needed beyond including this script.

========================================================== */



(function () {

  let galleryImages = [];

  let currentIndex = 0;

  let overlay, overlayImg, overlayCaption;



  function buildOverlay() {

    overlay = document.createElement("div");

    overlay.className = "lightbox-overlay";

    overlay.setAttribute("role", "dialog");

    overlay.setAttribute("aria-label", "Image viewer");



    overlay.innerHTML =

      '<button class="lightbox-close" aria-label="Close">&times;</button>' +

      '<button class="lightbox-prev" aria-label="Previous image">&#10094;</button>' +

      '<img class="lightbox-image" src="" alt="">' +

      '<button class="lightbox-next" aria-label="Next image">&#10095;</button>' +

      '<p class="lightbox-caption"></p>';



    document.body.appendChild(overlay);



    overlayImg = overlay.querySelector(".lightbox-image");

    overlayCaption = overlay.querySelector(".lightbox-caption");



    overlay.querySelector(".lightbox-close").addEventListener("click", closeLightbox);

    overlay.querySelector(".lightbox-prev").addEventListener("click", function () { showImage(currentIndex - 1); });

    overlay.querySelector(".lightbox-next").addEventListener("click", function () { showImage(currentIndex + 1); });



    // Click outside the image closes it

    overlay.addEventListener("click", function (e) {

      if (e.target === overlay) closeLightbox();

    });

  }



  function showImage(index) {

    if (galleryImages.length === 0) return;

    currentIndex = (index + galleryImages.length) % galleryImages.length;

    const img = galleryImages[currentIndex];

    overlayImg.src = img.getAttribute("src");

    overlayImg.alt = img.getAttribute("alt") || "";



    const figure = img.closest("figure");

    const captionEl = figure ? figure.querySelector("figcaption") : null;

    overlayCaption.textContent = captionEl ? captionEl.textContent.trim() : (img.getAttribute("alt") || "");

  }



  function openLightbox(index) {

    showImage(index);

    overlay.classList.add("lightbox-open");

    document.body.style.overflow = "hidden";

  }



  function closeLightbox() {

    overlay.classList.remove("lightbox-open");

    document.body.style.overflow = "";

  }



  document.addEventListener("DOMContentLoaded", function () {

    galleryImages = Array.prototype.slice.call(document.querySelectorAll(".gallery-item img"));

    if (galleryImages.length === 0) return;



    buildOverlay();



    galleryImages.forEach(function (img, index) {

      img.style.cursor = "zoom-in";

      img.addEventListener("click", function () { openLightbox(index); });

    });



    document.addEventListener("keydown", function (e) {

      if (!overlay.classList.contains("lightbox-open")) return;

      if (e.key === "Escape") closeLightbox();

      if (e.key === "ArrowLeft") showImage(currentIndex - 1);

      if (e.key === "ArrowRight") showImage(currentIndex + 1);

    });

  });

})();