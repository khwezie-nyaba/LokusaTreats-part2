/* ==========================================================
SEARCH.JS
Site-wide search for search.html. Looks through the treats
(products.js), the blog posts (blog-posts.js) and a list of
the site's pages, and shows the matches grouped together.
The search word comes from the page address, e.g.
search.html?q=cupcake
========================================================== */
const SITE_PAGES = [
  { title: "About Us", url: "about.html", description: "The story behind LokusaTreats and our small-batch sweets.", text: "about us story brand lokusatreats cape town small-batch sweets bakery" },
  { title: "Our Treats", url: "shop.html", description: "Shop cupcakes, cookies, chocolates and hampers.", text: "shop treats cupcakes cookies chocolates hampers buy order" },
  { title: "Custom Cakes", url: "custom-orders.html", description: "Enquire about custom cakes for weddings and celebrations.", text: "custom cakes wedding birthday celebration cake order quote" },
  { title: "Corporate & Bulk Orders", url: "corporate.html", description: "Client gifts, office celebrations and bulk orders.", text: "corporate bulk orders gifts office events company quote" },
  { title: "Enquiry", url: "enquiry.html", description: "Get an instant estimate and send us an enquiry.", text: "enquiry enquire estimate price cost quantity question" },
  { title: "Gallery", url: "gallery.html", description: "Photos of our treats and celebrations.", text: "gallery photos pictures cupcakes cookies chocolates hamper dessert table" },
  { title: "Blog", url: "blog.html", description: "Stories, baking tips and behind-the-scenes moments.", text: "blog stories baking tips behind the scenes" },
  { title: "Contact", url: "contact.html", description: "Phone, email, map and frequently asked questions.", text: "contact phone email address map location faq delivery payment allergies" },
  { title: "Account", url: "account.html", description: "Log in or create an account.", text: "account login log in sign in register create account profile" },
  { title: "Cart", url: "cart.html", description: "Review the treats in your cart.", text: "cart basket checkout" },
  { title: "Privacy Policy", url: "privacy-policy.html", description: "How we handle your information.", text: "privacy policy data information" },
  { title: "Terms & Conditions", url: "terms.html", description: "The terms for using our website and placing orders.", text: "terms conditions legal" }
];

function normaliseText(text) {
  return String(text || "").toLowerCase();
}

/* Returns { treats: [...], posts: [...], pages: [...] }, best matches first.
Every word typed must appear somewhere in an item for it to match. */
function searchSite(query) {
  const terms = normaliseText(query).split(/\s+/).filter(Boolean);
  const results = { treats: [], posts: [], pages: [] };

  if (terms.length === 0) return results;

  function score(title, body) {
    const t = normaliseText(title);
    const b = normaliseText(body);
    let total = 0;

    for (let i = 0; i < terms.length; i++) {
      const inTitle = t.indexOf(terms[i]) !== -1;
      const inBody = b.indexOf(terms[i]) !== -1;

      if (!inTitle && !inBody) return 0;
      total += inTitle ? 3 : 1;
    }

    return total;
  }

  if (typeof PRODUCTS !== "undefined") {
    PRODUCTS.forEach(function (p) {
      const s = score(p.name, p.category + " " + p.description);
      if (s > 0) results.treats.push({ item: p, score: s });
    });
  }

  if (typeof BLOG_POSTS !== "undefined") {
    BLOG_POSTS.forEach(function (post) {
      const s = score(post.title, post.category + " " + post.paragraphs.join(" "));
      if (s > 0) results.posts.push({ item: post, score: s });
    });
  }

  SITE_PAGES.forEach(function (page) {
    const s = score(page.title, page.text);
    if (s > 0) results.pages.push({ item: page, score: s });
  });

  ["treats", "posts", "pages"].forEach(function (key) {
    results[key].sort(function (a, b) {
      return b.score - a.score;
    });
  });

  return results;
}

/* ---------- Building the results on the page ---------- */
function makeResultRow(titleText, url, subText, extraNode) {
  const row = document.createElement("div");
  row.className = "search-result";

  const info = document.createElement("div");
  const heading = document.createElement("h3");
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.textContent = titleText;
  heading.appendChild(link);

  const sub = document.createElement("p");
  sub.textContent = subText;

  info.appendChild(heading);
  info.appendChild(sub);
  row.appendChild(info);

  if (extraNode) row.appendChild(extraNode);

  return row;
}

function addResultGroup(container, headingText, rows) {
  if (rows.length === 0) return;

  const group = document.createElement("div");
  group.className = "search-group";

  const heading = document.createElement("h2");
  heading.textContent = headingText + " (" + rows.length + ")";
  group.appendChild(heading);

  rows.forEach(function (row) {
    group.appendChild(row);
  });

  container.appendChild(group);
}

function addMessage(container, className, text) {
  const p = document.createElement("p");
  p.className = className;
  p.textContent = text;
  container.appendChild(p);
}

function renderSearchPage() {
  const container = document.getElementById("search-results");
  if (!container) return; // not on the search page

  const query = (new URLSearchParams(window.location.search).get("q") || "").trim();
  const input = document.getElementById("search-input");

  if (input) input.value = query;
  container.innerHTML = "";

  if (!query) {
    addMessage(container, "search-empty", "Type a word above to search our treats, blog posts and pages.");
    return;
  }

  document.title = "Search: " + query + " | LokusaTreats";

  const found = searchSite(query);
  const total = found.treats.length + found.posts.length + found.pages.length;

  addMessage(
    container,
    "search-summary",
    total + (total === 1 ? " result" : " results") + " for “" + query + "”"
  );

  if (total === 0) {
    addMessage(
      container,
      "search-empty",
      "Nothing matched. Try a simpler word like “cupcake”, “cookies” or “hamper”."
    );
    return;
  }

  addResultGroup(
    container,
    "Treats",
    found.treats.map(function (r) {
      const p = r.item;
      const button = document.createElement("button");
      button.className = "btn btn-outline btn-add-cart";
      button.setAttribute("data-product-id", p.id);
      button.textContent = "Add to Cart";

      return makeResultRow(
        p.name,
        "product-detail.html?id=" + p.id,
        p.category + " · R " + p.price.toFixed(2),
        button
      );
    })
  );

  addResultGroup(
    container,
    "Blog posts",
    found.posts.map(function (r) {
      const post = r.item;
      const firstParagraph = post.paragraphs[0];
      const snippet =
        firstParagraph.length > 140 ? firstParagraph.slice(0, 140) + "…" : firstParagraph;

      return makeResultRow(post.title, "post.html?id=" + post.id, snippet, null);
    })
  );

  addResultGroup(
    container,
    "Pages",
    found.pages.map(function (r) {
      return makeResultRow(r.item.title, r.item.url, r.item.description, null);
    })
  );

  // Make the Add to Cart buttons we just created work
  if (typeof initAddToCartButtons === "function") {
    initAddToCartButtons();
  }
}

document.addEventListener("DOMContentLoaded", renderSearchPage);