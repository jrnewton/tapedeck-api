'use strict';

const express = require('express');
const app = express();

app.post('/archive', (req, res) => {
  const url = req.body.url;
  if (url === '') {
    res.status(404).json("{ 'message': 'missing url' }").end();
  } else {
  }
});

const port = 9002;
app.listen(port, () => {
  console.log(`Express running on port ${port}`);
});
