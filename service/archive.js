'use strict';

const AWS = require('aws-sdk');

const credentials = new AWS.SharedIniFileCredentials({
  profile: process.env['AWS_PROFILE']
});

AWS.config.credentials = credentials;

AWS.config.getCredentials(function (err) {
  if (err) {
    console.log('credentials not loaded');
    console.log(err.stack);
  } else {
    console.log('Access key:', AWS.config.credentials.accessKeyId);
  }
});
