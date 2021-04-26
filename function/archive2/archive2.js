'use strict';

//TODO:
//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html
//https://nodejs.org/dist/latest/docs/api/stream.html#stream_object_mode

/* use '.default' otherwise you'll get a tslint warning
   see https://github.com/axios/axios/issues/1975 */
const axios = require('axios').default;
const stream = require('stream');
const AWS = require('aws-sdk');

const region = 'us-east-2';
const bucket = 'tapedeck-archives';

AWS.config.logger = console;

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: region
});

//reject promise when status != 200
const validateStatus = (status) => {
  return status === 200;
};

/*
  Event is from SQS.  Record.body will look like: 
  {
    PK: <string>,
    SK:  <string>,
    URL:  <string>
  }
*/
const handler = async (event) => {
  console.log('starting', event);

  //Lambda gotcha
  //Based on testing, I believe event is a JS proxy object
  //and that lambda will perform validation when you access
  //properties.  If you access a property that doesn't exist
  //then your lambda invocation will fail.

  for (const { messageId, body } of event.Records) {
    console.log('processing message', messageId);
    try {
      console.log('request', body);
      const request = JSON.parse(body);

      let mp3Response = await axios.get(request.URL, {
        validateStatus,
        responseType: 'stream'
      });

      console.log('got mp3 response');

      let pass = new stream.PassThrough();
      mp3Response.data.pipe(pass);

      const key = `${request.PK}/${request.SK}.mp3`;

      const params = {
        Bucket: bucket,
        Key: key,
        // Metadata: {
        //   'playlist-description': desc
        // },
        Body: pass
      };

      console.log('write to s3', key);
      const upload = s3.upload(params).promise();
      const data = await upload;
      console.log('finished write to s3', data);
      return JSON.stringify({ status: 200 });
    } catch (error) {
      console.log('caught an error', error);
      throw error;
    }
  }
};

//THE entry point for lambda
module.exports.handler = handler;
