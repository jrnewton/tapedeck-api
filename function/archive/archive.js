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
const HLS = require('parse-hls').default;

AWS.config.logger = console;

function parseM3UFile(fileContents) {
  return HLS.parse(fileContents).segments.map((segment) => {
    return segment.properties.reduce(
      (accum, prop) => {
        if (
          /* stop at first title */
          accum.title === null &&
          prop.type === 'TAG' &&
          prop.tagName === 'EXTINF'
        ) {
          accum.title = prop.attributes.title;
        }

        return accum;
      },
      { uri: segment.uri, title: null }
    );
  });
}

const getMP3URLs = (playlistItems) => {
  return playlistItems.filter((item) => item.uri.match(/\.mp3$/g));
};

const upload = async (desc, sub, resource, pass) => {
  console.log(`[upload] processing ${resource.uri}`);

  //TODO: better file name
  const key = `${sub}/${uuid.v4()}.mp3`;

  AWS.config.getCredentials(function (err) {
    if (err) {
      console.log('[upload] credentials not loaded', JSON.stringify(err));
    } else {
      console.log('[upload] Access key', AWS.config.credentials.accessKeyId);
    }
  });

  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: 'us-east-2'
  });

  const params = {
    Bucket: 'tapedeck-archives',
    Key: key,
    Metadata: {
      'playlist-description': desc
    },
    Body: pass
  };

  const upload = s3.upload(params).promise();
  const data = await upload;
  console.log('[upload] finished write to s3', data);
};

const badStatus = (msg) => {
  console.log('calling badStatus');
  return {
    statusCode: 500,
    body: JSON.stringify({ message: msg })
  };
};

const goodStatus = (count) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,GET'
    },
    body: JSON.stringify({ message: `# of items processed=${count}` })
  };
};

/*
  Event be like
   {
    "url": "https://tapedeck-sample-files.s3.us-east-2.amazonaws.com/test.m3u",
    "desc": "A test file",
    "sub": "DnHdKa1qSEuN70gBffDXj"
   } 
 */
const handler = async (event, context) => {
  console.log('[handler] starting', event, context);

  //Based on testing, I believe event is a proxy object
  //and that lambda will perform validation when you access
  //properties
  const url = event.url;
  console.log('url is', url);

  const desc = event.desc;
  const sub = event.sub;

  const maxFiles = 1;
  try {
    const res = await axios.get(url);
    console.log('[handler] headers:', JSON.stringify(res.headers));

    const { status } = res;
    const contentType = res.headers['content-type'];

    if (status !== 200) {
      const msg = `Failed to GET ${url}, status=${status}`;
      console.log('[handler]', new Error(msg));
      return badStatus(msg);
    }
    //Might need to support type aliases - http://help.dottoro.com/lapuadlp.php
    else if (contentType !== 'audio/x-mpegurl') {
      const msg = `Unsupported content-type for ${url}, content-type=${contentType}`;
      console.log('[handler]', msg);
      return badStatus(msg);
    } else {
      const filesToDownload = getMP3URLs(parseM3UFile(res.data));
      console.log('[handler] files:', JSON.stringify(filesToDownload));

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

        await upload(desc, sub, resource, pass);
        console.log('[handler]', 'upload await is done');
      }

      console.log('[handler]', 'calling goodStatus');
      return goodStatus(count);
    }
  } catch (error) {
    console.log('[handler] caught an error', error);
    return badStatus(error.message);
  }
};

//THE entry point for lambda
exports.handler = handler;

//For unit tests
module.exports.parseM3UFile = parseM3UFile;
module.exports.getMP3URLs = getMP3URLs;
