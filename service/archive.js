'use strict';

const AWS = require('aws-sdk');

AWS.config.getCredentials(function (err) {
  if (err) {
    console.log('credentials not loaded');
    console.log(err.stack);
  } else {
    console.log('Access key:', AWS.config.credentials.accessKeyId);
  }
});

console.log('Region: ', AWS.config.region);
