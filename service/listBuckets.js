'use strict';

const AWS = require('aws-sdk');

AWS.config.getCredentials(function (err) {
  if (err) {
    console.log('credentials not loaded');
    console.log(err.stack);
    return;
  } else {
    console.log('Access key:', AWS.config.credentials.accessKeyId);
  }
});

console.log('Region: ', AWS.config.region);

const s3 = new AWS.S3();
s3.listBuckets({}, (err, data) => {
  if (err) {
    console.log(err, err.stack);
  } else {
    console.log(data);
  }
});
