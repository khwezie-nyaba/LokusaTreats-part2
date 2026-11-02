/* ==========================================================

   BLOG-POSTS.JS

   Holds the blog posts and shows whichever one is chosen in

   the page address, e.g. post.html?id=signature-cupcakes.

   Part 3: "Use JavaScript to dynamically load content, such

   as posts or product listings."

========================================================== */



const BLOG_POSTS = [

  {

    id: "signature-cupcakes",

    category: "Baking",

    title: "The Story Behind Our Signature Cupcakes",

    image: "C:\\Users\\Student\\Documents\\Visual Studio 2022\\My Website\\LokusaTreats\\Images\\Cupcakes.jpg",

    imageAlt: "Assorted LokusaTreats signature cupcakes",

    paragraphs: [

      "Our signature cupcakes started with a simple idea: a cupcake should taste as good as it looks. Every batch begins with real butter, quality chocolate and honest, tried-and-tested recipes, with no shortcuts.",

      "Each cupcake is baked in small batches and finished by hand, from the swirl of buttercream to the final topping. That's why no two boxes look exactly the same, and why customers keep coming back for their favourite flavours.",

      "Whether it's a birthday, an office celebration or just a Friday treat, our signature cupcakes are made to be shared. Browse the full range on our Our Treats page, or enquire about a custom flavour for your next celebration."

    ]

  },

  {

    id: "perfect-treat-box",

    category: "Tips",

    title: "How to Build the Perfect Treat Box",

    image: "C:\\Users\\Student\\Documents\\Visual Studio 2022\\My Website\\LokusaTreats\\Images\\Celebration Hamper.jpg",

    imageAlt: "A LokusaTreats celebration treat box",

    paragraphs: [

      "A great treat box is all about balance. Start with a hero item, like a few signature cupcakes or a stack of chunky cookies, then add something rich, something light and something a little unexpected.",

      "Mix textures and flavours: pair a soft, creamy cupcake with a crisp cookie and a few handmade chocolates. Think about who the box is for, too. A few extra of someone's favourite always goes down well.",

      "Planning for a crowd or a corporate gift? Tell us your budget and headcount through our enquiry page and we'll help you put together a box that fits."

    ]

  },

  {

    id: "day-in-the-kitchen",

    category: "Behind the Scenes",

    title: "A Day in the LokusaTreats Kitchen",

    image: "C:\\Users\\Student\\Documents\\Visual Studio 2022\\My Website\\LokusaTreats\\Images\\Chunky Cookies.jpg",

    imageAlt: "Freshly baked chunky cookies from the LokusaTreats kitchen",

    paragraphs: [

      "Every day in our kitchen starts with preparation. Ingredients are measured, ovens are warmed up and the first batches of cupcakes and cookies go in while the day is just getting going.",

      "Once the baking is done, the finishing begins: piping, decorating and boxing each order by hand. Because we bake in small batches, every treat gets individual attention before it leaves the kitchen.",

      "By the end of the day, orders are packed and ready for collection or delivery. It's a long day, but knowing a box of treats is about to start someone's celebration makes it worthwhile."

    ]

  }

];



function findPost(postId) {

  return BLOG_POSTS.find(function (p) { return p.id === postId; });

}



function renderPostPage() {

  const container = document.getElementById("post-container");

  if (!container) return; // not on the post page



  const params = new URLSearchParams(window.location.search);

  const post = findPost(params.get("id"));



  if (!post) {

    container.innerHTML =

      '<p>Sorry, we couldn\'t find that post. <a href="blog.html">Back to the blog</a></p>';

    return;

  }



  document.title = post.title + " | LokusaTreats";



  const bodyHtml = post.paragraphs.map(function (text) {

    return "<p>" + text + "</p>";

  }).join("");



  const relatedHtml = BLOG_POSTS

    .filter(function (p) { return p.id !== post.id; })

    .map(function (p) {

      return '<li><a href="post.html?id=' + p.id + '">' + p.title + "</a></li>";

    }).join("");



  container.innerHTML =

    '<a href="blog.html" class="post-back">&larr; Back to Blog</a>' +

    '<p class="eyebrow">' + post.category + "</p>" +

    "<h1>" + post.title + "</h1>" +

    '<img class="post-image" src="' + post.image + '" alt="' + post.imageAlt + '">' +

    '<div class="post-body">' + bodyHtml + "</div>" +

    '<div class="post-cta">' +

      '<a href="shop.html" class="btn btn-primary">Browse Our Treats</a>' +

      '<a href="enquiry.html" class="btn btn-secondary">Make an Enquiry</a>' +

    "</div>" +

    '<div class="related-posts">' +

      "<h2>More from the Blog</h2>" +

      "<ul>" + relatedHtml + "</ul>" +

    "</div>";

}



document.addEventListener("DOMContentLoaded", renderPostPage);

