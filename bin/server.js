'use strict';

const express = require('express');
const app = express();

//this is relative to the program working directory,
//which is in the project root.
app.use(express.static('./src/client'));

const port = 9001;
app.listen(port, () => {
  console.log(`Express running on port ${port}`);
});
