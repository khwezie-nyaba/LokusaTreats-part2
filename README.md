LokusaTreats

LokusaTreats is a small bakery/confectionery website created for a business that offers handcrafted treats such as cupcakes, cookies, chocolates, celebration hampers, and custom cakes.

Project Description

This website provides customers with information about LokusaTreats, allows them to browse available treats, view the gallery and blog, and find contact information.

The website is built using basic web technologies:

HTML – used for the structure and content of the website.

CSS – used for the layout, colours, fonts, spacing, navigation, buttons, product cards, and overall appearance.

JavaScript – included separately for features such as products, the shopping cart, and other website functionality.

The HTML pages link to the external stylesheet Stylesheet.css.

Main Pages

The website includes the following pages:

index.html – Home page

about.html – About Us

shop.html – Our Treats

custom-orders.html – Custom Cakes

corporate.html – Corporate & Bulk Orders

gallery.html – Gallery

blog.html – Blog

contact.html – Contact

cart.html – Shopping Cart

Additional pages may include the privacy policy, terms and conditions, and product detail pages.

Folder Structure

A simple project structure is recommended:

LokusaTreats/
│
├── index.html
├── about.html
├── shop.html
├── custom-orders.html
├── corporate.html
├── gallery.html
├── blog.html
├── contact.html
├── cart.html
├── Stylesheet.css
│
├── Images/
│   ├── LOGO.png
│   ├── Cupcakes.jpg
│   ├── Chunky Cookies.jpg
│   ├── Chocolate in box.jpg
│   ├── Celebration Hamper.jpg
│   └── other website images
│
└── js/
    ├── products.js
    ├── cart.js
    └── main.js

CSS

The website uses an external CSS file named:

Stylesheet.css

This file controls the visual design of the website, including the header, navigation, hero section, product grid, buttons, testimonials, newsletter section, footer, and responsive layout.

The HTML pages connect to the stylesheet using:

<link rel="stylesheet" href="Stylesheet.css">

Keeping the CSS in a separate file makes the website easier to maintain and allows the same styling to be used across multiple pages.

JavaScript

The website currently references separate JavaScript files:

<script src="js/products.js"></script>
<script src="js/cart.js"></script>
<script src="js/main.js"></script>

These files are intended to handle product information, shopping cart functionality, and general website behaviour.

Images

Website images are stored in the Images folder.

For the website to work correctly on another computer, image links should use relative paths, for example:

<img src="Images/LOGO.png" alt="LokusaTreats logo">

instead of a computer-specific path such as:

C:\Users\Student\Documents\...

How to Run the Website

Open the LokusaTreats folder in Visual Studio Code.

Make sure the HTML pages, Stylesheet.css, Images folder, and js folder are in the correct locations.

Open index.html in a web browser.

Use the navigation menu to move between the pages.

No special framework is required. The website is made using HTML, CSS, and JavaScript.

Current Status

The website structure and styling are being developed in Visual Studio Code. JavaScript functionality can be added or improved as the project progresses.

Author

LokusaTreats Website Project# LokusaTreats-part2
