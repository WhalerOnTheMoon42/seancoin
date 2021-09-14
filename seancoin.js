const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const Blockchain = require('./blockchain');
const { BASE_URL, DEFAULT_PORT } = require('./config');
const PubSub = require('./app/pubsub');

const app = express();
app.use(bodyParser.json());
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

// const DEFAULT_PORT = 3003;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}${BASE_URL}`

app.get(`${BASE_URL}/`, (req, res) => {
  res.send("Welcome to the blockchain demo!!");
});

app.get(`${BASE_URL}/sam`, (req, res) => {
  res.send("Sucess!");
});
// console.log(`${BASE_URL}/`);

app.get(`${BASE_URL}/api/demo-blocks`, (req, res) => {
  res.json(blockchain.chain);
});

app.post(`${BASE_URL}/api/demo-mine`, (req, res) => {
  const { data } = req.body;
  console.log(data);

  if (!data) {res.send("No data sent")} else {

    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect(`${BASE_URL}/api/blocks`);
  }
});

const syncChains = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log('replace chain on a sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  })
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORTS === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`listening at localhost:${PORT}`);

  if (PORT !== DEFAULT_PORT) syncChains();
});
