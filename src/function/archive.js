'use strict';

/* use '.default' otherwise you'll get a tslint warning
   see https://github.com/axios/axios/issues/1975 */
const axios = require('axios').default;
const fs = require('fs');
const url = 'https://tapedeck-sample-files.s3.us-east-2.amazonaws.com/test.m3u';

(async () => {
  try {
    const res = await axios.get(url);
    console.log('headers');
    console.log(JSON.stringify(res.headers));

    const { status } = res;
    const contentType = res.headers['content-type'];

    if (status !== 200) {
      throw new Error(`Failed to GET ${url}, status=${status}`);
    }
    //Might need to support type aliases - http://help.dottoro.com/lapuadlp.php
    else if (contentType !== 'audio/x-mpegurl') {
      throw new Error(
        `Unsupported content-type for ${url}, content-type=${contentType}`
      );
    } else {
      const rawData = res.data;
      console.log('raw data:');
      console.log(rawData);

      if (rawData.startsWith('#EXTM3U')) {
        const m3uLines = rawData.split('\n');
        console.log(`m3u file has line count ${m3uLines.length}`);

        const filesToDownload = m3uLines.filter(
          (line) => !line.startsWith('#') && line.length > 0
        );
        console.log('files to download:');
        console.log(JSON.stringify(filesToDownload));

        for (const url of filesToDownload) {
          let mp3Response = await axios.get(url, {
            responseType: 'stream'
          });

          console.time();
          console.log(`downloading ${url}`);
          mp3Response.data.pipe(fs.createWriteStream('/tmp/test.mp3'));
          console.log(`completed for ${url}`);
          console.timeEnd();
        }
      } else {
        throw new Error('not an m3u file');
      }
    }
  } catch (error) {
    console.error(error);
  }
})();

// const AWS = require('aws-sdk');
// const uuid = require('uuid');

// AWS.config.getCredentials(function (err) {
//   if (err) {
//     console.log('credentials not loaded');
//     console.log(err.stack);
//   } else {
//     console.log('Access key:', AWS.config.credentials.accessKeyId);
//   }
// });

// console.log('Region: ', AWS.config.region);

// const s3 = new AWS.S3();

// s3.listBuckets({}, (err, data) => {
//   if (err) {
//     console.log(err, err.stack);
//   } else {
//     console.log(data);
//   }
// });

// // Create unique bucket name
// const bucketName = 'node-sdk-sample-' + uuid.v4();
// // Create name for uploaded object key
// const keyName = 'hello_world.txt';

// // Create a promise on S3 service object
// const bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' })
//   .createBucket({ Bucket: bucketName })
//   .promise();

// // Handle promise fulfilled/rejected states
// bucketPromise
//   .then(function (data) {
//     // Create params for putObject call
//     const objectParams = {
//       Bucket: bucketName,
//       Key: keyName,
//       Body: 'Hello World!'
//     };

//     // Create object upload promise
//     const uploadPromise = s3.putObject(objectParams).promise();

//     uploadPromise.then(function (data) {
//       console.log(
//         'Successfully uploaded data to ' + bucketName + '/' + keyName
//       );
//     });
//   })
//   .catch(function (err) {
//     console.error(err, err.stack);
//   });
