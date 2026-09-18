/* ==========================================================
   PRODUCTS.JS
   Central product catalogue. In a real store this would come
   from a database / CMS (e.g. WooCommerce), but for a static
   site we keep it here as plain data that other scripts read.
========================================================== */

const PRODUCTS = [
  {
    id: "cupcake-box-6",
    name: "Signature Cupcake Box (6)",
    price: 180.00,
    category: "Cupcakes",
    image: "Images/Cupcakes.jpg",
    description: "Six of our best-selling cupcake flavours, hand-piped and boxed fresh to order."
  },
  {
    id: "cupcake-box-12",
    name: "Signature Cupcake Box (12)",
    price: 340.00,
    category: "Cupcakes",
    image: "Images/Cupcakes.jpg",
    description: "A dozen assorted cupcakes, perfect for sharing at parties and office celebrations."
  },
  {
    id: "cookie-pack-8",
    name: "Chunky Cookie Pack (8)",
    price: 150.00,
    category: "Cookies",
    image: "Images/Chunky%20Cookies.jpg",
    description: "Thick, chewy cookies loaded with chocolate chunks, baked fresh daily."
  },
  {
    id: "chocolate-box-12",
    name: "Artisanal Chocolate Box (12)",
    price: 220.00,
    category: "Chocolates",
    image: "Images/Chocolate%20in%20box.jpg",
    description: "A curated box of twelve handmade chocolates in a mix of classic and seasonal flavours."
  },
  {
    id: "celebration-hamper",
    name: "Celebration Hamper",
    price: 450.00,
    category: "Hampers",
    image: "Images/Celebration%20Hamper.jpg",
    description: "Our signature gift hamper with a mix of cupcakes, cookies, and chocolates, beautifully packaged."
  }
];

/* Helper: find a single product by its id */
function findProduct(productId) {
  return PRODUCTS.find(function (p) { return p.id === productId; });
}