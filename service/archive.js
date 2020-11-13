'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');

AWS.config.getCredentials(function (err) {
  if (err) {
    console.log('credentials not loaded');
    console.log(err.stack);
  } else {
    console.log('Access key:', AWS.config.credentials.accessKeyId);
  }
});

console.log('Region: ', AWS.config.region);

// Create unique bucket name
const bucketName = 'node-sdk-sample-' + uuid.v4();
// Create name for uploaded object key
const keyName = 'hello_world.txt';

// Create a promise on S3 service object
const bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' })
  .createBucket({ Bucket: bucketName })
  .promise();

// Handle promise fulfilled/rejected states
bucketPromise
  .then(function (data) {
    // Create params for putObject call
    const objectParams = {
      Bucket: bucketName,
      Key: keyName,
      Body: 'Hello World!'
    };

    // Create object upload promise
    const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' })
      .putObject(objectParams)
      .promise();

    uploadPromise.then(function (data) {
      console.log(
        'Successfully uploaded data to ' + bucketName + '/' + keyName
      );
    });
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });
