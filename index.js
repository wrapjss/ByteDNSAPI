const express = require("express");
const dns =  require("node:dns");

const app = express();

app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/docs/index.html");
});

app.get("/style.css", (req, res) => {
  res.sendFile(__dirname + "/docs/css/style.css");
});

app.listen(6701, () => {
  console.log("ByteDNS API listening now on port 6701");
});