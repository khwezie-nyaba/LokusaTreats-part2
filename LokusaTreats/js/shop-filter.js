/* ==========================================================

   SHOP-FILTER.JS
   
   Works together with shop.html's existing product grid

   (rendered from PRODUCTS in products.js) and its category

   checkboxes. Also adds a text search box above the grid.

========================================================== */



function renderFilteredProducts() {

  const grid = document.getElementById("shop-product-grid");

  if (!grid) return;



  const checkedCategories = Array.prototype.slice

    .call(document.querySelectorAll('input[name="category"]:checked'))

    .map(function (cb) { return cb.value; });



  const searchInput = document.getElementById("shop-search");

  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";



  const sortSelect = document.getElementById("shop-sort");

  const sortValue = sortSelect ? sortSelect.value : "default";



  let filtered = PRODUCTS.filter(function (p) {

    const matchesCategory = checkedCategories.length === 0 || checkedCategories.indexOf(p.category) !== -1;

    const matchesSearch = !searchTerm || p.name.toLowerCase().indexOf(searchTerm) !== -1;

    return matchesCategory && matchesSearch;

  });



  if (sortValue === "price-asc") {

    filtered = filtered.slice().sort(function (a, b) { return a.price - b.price; });

  } else if (sortValue === "price-desc") {

    filtered = filtered.slice().sort(function (a, b) { return b.price - a.price; });

  } else if (sortValue === "name-asc") {

    filtered = filtered.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });

  }



  if (filtered.length === 0) {

    grid.innerHTML = '<p class="shop-no-results">No treats match your search. Try a different filter.</p>';

    return;

  }



  grid.innerHTML = filtered.map(function (p) {

    return (

      '<article class="product-card" data-product-wrapper>' +

        '<a href="product-detail.html?id=' + p.id + '">' +

          '<div class="product-image"><img src="' + p.image + '" alt="' + p.name + '"></div>' +

          '<div class="product-info">' +

            '<h3 class="product-name">' + p.name + '</h3>' +

            '<p class="product-price">R ' + p.price.toFixed(2) + '</p>' +

          '</div>' +

        '</a>' +

        '<button class="btn btn-outline btn-add-cart" data-product-id="' + p.id + '">Add to Cart</button>' +

      '</article>'

    );

  }).join("");



  // Re-attach Add to Cart listeners since the grid was just rebuilt

  if (typeof initAddToCartButtons === "function") {

    initAddToCartButtons();

  }

}



document.addEventListener("DOMContentLoaded", function () {

  const grid = document.getElementById("shop-product-grid");

  if (!grid) return; // not on the shop page



  renderFilteredProducts();



  document.querySelectorAll('input[name="category"]').forEach(function (cb) {

    cb.addEventListener("change", renderFilteredProducts);

  });



  const searchInput = document.getElementById("shop-search");

  if (searchInput) {

    searchInput.addEventListener("input", renderFilteredProducts);

  }



  const sortSelect = document.getElementById("shop-sort");

  if (sortSelect) {

    sortSelect.addEventListener("change", renderFilteredProducts);

  }

});

