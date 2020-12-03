'use strict';

/* use '.default' otherwise you'll get a tslint warning
   see https://github.com/axios/axios/issues/1975 */
const axios = require('axios').default;
const fs = require('fs');
const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.logger = console;

async function downloadPlaylist(url, maxFiles, fileAction) {
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

        const filesToDownload = m3uLines.filter((line) => {
          if (!line.startsWith('#') && line.length > 0) {
            if (line.search(/\.mp3$/g)) {
              return true;
            }
          }
          return false;
        });
        console.log('files to download:');
        console.log(JSON.stringify(filesToDownload));

        let count = 0;
        for (const url of filesToDownload) {
          if (count > maxFiles) {
            break;
          }

          let mp3Response = await axios.get(url, {
            responseType: 'stream'
          });

          console.time();
          console.log(`downloading ${url}`);
          const outfile = `/tmp/${uuid.v4()}.mp3`;
          mp3Response.data.pipe(fs.createWriteStream(outfile));
          console.log(`written to ${outfile}`);
          console.timeEnd();

          if (fileAction) {
            fileAction(outfile);
          }

          count++;
        }
      } else {
        throw new Error('not an m3u file');
      }
    }
  } catch (error) {
    console.error(error);
  }
}

function uploadFile(file) {
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
    region: 'us-east-2',
    params: { Bucket: 'tapedeck-archives' }
  });

  const params = {
    Bucket: 'tapedeck-archives',
    Key: 'test',
    Body: 'Hello World!'
  };

  s3.putObject(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log('wrote something', data);
    }
  });

  // s3.listBuckets((err, data) => {
  //   if (err) {
  //     console.log('listBuckets', err);
  //   } else {
  //     console.log('listBuckets', data);
  //   }
  // });

  s3.listObjects({ Bucket: 'tapedeck-archives' }, (err, data) => {
    if (err) {
      console.log('listObjects', err);
    } else {
      console.log('listObjects', data);
    }
  });
}

// const url = 'https://tapedeck-sample-files.s3.us-east-2.amazonaws.com/test.m3u';
// downloadPlaylist(url, 1, uploadFile);

const file = '/tmp/4311561e-ad9c-49f8-b85e-4e474d21b64e.mp3';
uploadFile(file);

//https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/requests-using-stream-objects.html
