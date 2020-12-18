'use strict';

//TODO:
//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html
//https://nodejs.org/dist/latest/docs/api/stream.html#stream_object_mode

/* use '.default' otherwise you'll get a tslint warning
   see https://github.com/axios/axios/issues/1975 */
const axios = require('axios').default;
const stream = require('stream');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const m3u = require('./m3u');

AWS.config.logger = console;

async function downloadPlaylist(url, callback, maxFiles = 1) {
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
      const filesToDownload = m3u.getMP3URIs(res.data);
      console.log('files to download:');
      console.log(JSON.stringify(filesToDownload));

      let count = 0;
      for (const resource of filesToDownload) {
        if (count++ > maxFiles) {
          break;
        }

        let mp3Response = await axios.get(resource.uri, {
          responseType: 'stream'
        });

        let pass = new stream.PassThrough();
        mp3Response.data.pipe(pass);

        callback(resource, pass);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

function upload(resource, pass) {
  console.time('s3 upload');
  console.log(`processing ${resource.uri}`);

  //TODO: store meta and url
  const key = `${uuid.v4()}.mp3`;

  AWS.config.getCredentials(function (err) {
    if (err) {
      console.log('credentials not loaded');
      console.log(err.stack);
    } else {
      console.log('Access key:', AWS.config.credentials.accessKeyId);
    }
  });

  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: 'us-east-2'
  });

  const params = {
    Bucket: 'tapedeck-archives',
    Key: key,
    Body: pass
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.log('failed write to s3', err);
    } else {
      console.log('finished write to s3', data);
    }
    console.timeEnd('s3 upload');
  });
}

const url = 'https://tapedeck-sample-files.s3.us-east-2.amazonaws.com/test.m3u';
//const url = 'https://wmbr.org/m3u/Backwoods_20201128_1000.m3u';
downloadPlaylist(url, upload);
