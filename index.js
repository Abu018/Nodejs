const http = require("http");
const fs = require("fs");
const url = require("url"); // Import the 'url' module

const slugify = require("slugify");
// Function to replace template placeholders with actual product data
const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC}/g, "not-organic");

  return output;
};

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

// Read and parse the product data
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const slug = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slug);
// Create the server
const server = http.createServer((req, res) => {
  // Parse the URL
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);

    // Product page
  } else if (pathname === "/product") {
    // Extract the product ID from the query
    const product = dataObj[query.id];

    if (product) {
      const output = replaceTemplate(tempProduct, product);
      res.writeHead(200, { "Content-type": "text/html" });
      res.end(output);
    } else {
      res.writeHead(404, { "Content-type": "text/html" });
      res.end("<h1>Product not found!</h1>");
    }

    // API
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "helloworld",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

// Start the server
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
