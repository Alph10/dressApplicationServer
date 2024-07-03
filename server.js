const express = require('express');
const puppeteer = require('puppeteer');
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.type('html').send(html));

app.get('/search', async (req, res) => {
  try {
    // Get query
    const { query } = req.query;
 
    // Launch a headless browser
    const browser = await puppeteer.launch({executablePath: "/opt/render/project/src/node_modules/puppeteer-core/lib/cjs/puppeteer/node/"});
    const page = await browser.newPage();
    
    // Go to the target website
    await page.goto(`https://www.vinted.it/catalog?search_text=${query}`, { waitUntil: 'networkidle2' });
 
    // Wait for a specific element to ensure all data has loaded
    await page.waitForSelector('[data-testid^="product-item"]');
 
    // Evaluate the page content and extract the desired information
    const items = await page.evaluate(() => {
      const elements = document.querySelectorAll('div.new-item-box__container[data-testid^=product-item-id]');
      return Array.from(elements).map(element => ({
        title: element.children[1].children[0].children[0].children[0].alt.trim().split(", ")[0],
        price: element.children[1].children[0].children[0].children[0].alt.trim().split(", ")[1],
        image: element.children[1].children[0].children[0].children[0].src,
        // Double href so that it works when the a tag is in the position 1 or 2
        link: element.children[1].children[1].href,
        link: element.children[1].children[2].href
      }));
    });
 
    // Close the browser
    await browser.close();
 
    // Send the extracted information as JSON
    res.json(items);
  } catch (error) {
    console.error('Error scraping the website:', error);
    res.status(500).json({ error: 'An error occurred while scraping the website' });
  }
});

const server = app.listen(port, () => console.log(`Dress Application listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`
