'use strict';

const express = require('express');
const AWS = require('aws-sdk');
const uuid = require('uuid');

const awsCreds = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'IDENTITY_POOL_ID'
});
const awsConfig = new AWS.Config({
  credentials: awsCreds,
  region: 'us-east-2'
});

// AWS.config.update({
//   accessKeyId: 'accessKeyId',
//   secretAccessKey: 'secretAccessKey',
//   timeout: 15000
// });

const app = express();

app.post('/archive', (req, res) => {
  const url = req.body.url;
  if (url === '') {
    res.status(404).json("{ 'message': 'missing url' }").end();
  } else {
    const s3 = new AWS.S3();

    //bucket should be per user and each object is an mp3 file
    const bucketName = 'tapedeck-' + email + uuid.v4();
    const keyName = 'hello_world.txt';

    s3.createBucket({ Bucket: bucketName }, function () {
      const params = { Bucket: bucketName, Key: keyName, Body: 'Hello World!' };
      s3.putObject(params, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(
            'Successfully uploaded data to ' + bucketName + '/' + keyName
          );
        }
      });
    });
  }
});

const port = 9002;
app.listen(port, () => {
  console.log(`Express running on port ${port}`);
});
