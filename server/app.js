const path = require('path');

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const stripe = require('stripe')(
  'sk_test_51KKbi7DBAz0ESre3Wk6EIdzQTtumwx8I2pjIOiBCm3ZDJOYBYmJFnDPrWETv5XneiqFbUdE4P1zJkGlufMZInNn300AIEyEojg'
);

const port = 8001;

const PRODUCTS_ARR = require('./data/products.json').products;
const PRODUCTS = {};
const domain = 'https://ufdc0.csb.app';

PRODUCTS_ARR.forEach((product) => {
  PRODUCTS[product.id] = product;
});

app.get('/api/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'products.json'));
});

app.post('/create-checkout-session', async (req, res) => {
  let items = req.body;
  let lineItems = [];

  for (let id in req.body) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: PRODUCTS[id].title
        },
        unit_amount: parseInt(PRODUCTS[id].price * 100, 10)
      },
      quantity: items[id]
    });
  }
  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${domain}/?status=success`,
    cancel_url: `${domain}/?status=cancel`
  });
  res.redirect(303, session.url);
});

app.listen(port, () => {
  console.log(`[products] API listening on port ${port}.`);
});
