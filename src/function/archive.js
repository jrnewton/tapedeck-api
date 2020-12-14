'use strict';

const m3u = require('./m3u');
const url2s3 = require('./url2s3');

const url = 'https://tapedeck-sample-files.s3.us-east-2.amazonaws.com/test.m3u';
//const url = 'https://wmbr.org/m3u/Backwoods_20201128_1000.m3u';

try {
  m3u.forEach(url, url2s3);
} catch (error) {
  console.error(error);
}
