'use strict';

const express = require('express');
const app = express();

app.use(express.static('.'));

const port = 9001;
app.listen(port, () => {
  console.log(`Express running on port ${port}`);
});
