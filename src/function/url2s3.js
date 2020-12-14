'use strict';

//TODO:
//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html
//https://nodejs.org/dist/latest/docs/api/stream.html#stream_object_mode

const debug = require('debug')('url2s3');
const url = require('url');
/* use '.default' otherwise you'll get a tslint warning
   see https://github.com/axios/axios/issues/1975 */
const axios = require('axios').default;
const stream = require('stream');
const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.logger = console;

const getKey = (urlObject) => {
  const i = urlObject.pathname.lastIndexOf('/');
  if (i > 0) {
    const file = urlObject.pathname.slice(i + 1);
    return `${file}-${uuid.v4()}`;
  } else {
    debug('could not get file name from url path', urlObject.pathname);
    return uuid.v4();
  }
};

const testCredentails = () => {
  AWS.config.getCredentials(function (err) {
    if (err) {
      throw new Error('credentials problem');
    } else {
      debug('Access key:', AWS.config.credentials.accessKeyId);
    }
  });
};

const main = async (urlString, metadata = {}, options = {}) => {
  debug(`processing ${urlString}`);

  const urlToFetch = url.parse(urlString);

  let response = await axios.get(urlToFetch.toString(), {
    responseType: 'stream'
  });

  let pass = new stream.PassThrough();
  response.data.pipe(pass);

  const keyGen = options.keyGenerator || getKey;
  const key = keyGen(urlToFetch);

  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: options.aws.region || 'us-east-2'
  });

  const s3Params = {
    Bucket: options.bucket || uuid.v4(),
    Key: key,
    Body: pass
  };

  testCredentails();

  const upload = s3.upload(s3Params);
  upload.on('httpUploadProgress', (progress) => {
    debug(
      `bytes sent: ${progress.loaded}${
        progress.total ? ' out of ' + progress.total : ''
      }`
    );
  });

  upload.promise().then(
    (data) => {
      debug('upload complete', data);
    },
    (err) => {
      debug('upload failed', err);
    }
  );
};

module.exports = main;
