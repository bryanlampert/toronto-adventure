const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', function (req, res) {
  res.render("index");
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});