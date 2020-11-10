'use strict';

const express = require('express');
const app = express();

//this is relative to the program working directory,
//which is one level up from this source file.
app.use(express.static('.'));

const port = 9001;
app.listen(port, () => {
  console.log(`Express running on port ${port}`);
});
