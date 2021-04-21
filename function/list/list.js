'use strict';

const AWS = require('aws-sdk');
const { region, bucket } = require('../awsconfig.js');

exports.handler = async (event) => {
  const sub = event.sub || 'not-defined';
  const mode = event.mode || 'not-defined';

  console.log('sub', sub);
  console.log('mode', mode);

  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: region
  });

  const params = {
    Bucket: bucket,
    Prefix: sub
  };

  // try {
  //   const versionResult = await new Promise((resolve, reject) => {
  //     s3.listObjectVersions(params, (err, data) => {
  //       console.log('err', err);
  //       console.log('data', data);
  //       if (err) {
  //         reject(err);
  //       }
  //       else {
  //         resolve(data);
  //       }
  //     });
  //   });
  // }
  // catch (error) {
  //   console.error(error);
  // }

  try {
    const listResult = await new Promise((resolve, reject) => {
      s3.listObjectsV2(params, (err, data) => {
        console.log('err', err);
        console.log('data', data);
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    /*
      
      */
    const response = {
      mode: mode,
      maxKeys: listResult.MaxKeys,
      keyCount: listResult.KeyCount,
      truncated: listResult.IsTruncated,
      items: []
    };

    if (listResult.Contents) {
      const baseUrl = `https://${listResult.Name}.s3.${region}.amazonaws.com`;
      for (const item of listResult.Contents) {
        response.items.push({
          id: item.key,
          url: `${baseUrl}/${item.Key}`,
          desc: 'n/a', //TODO: populate
          lastModified: item.LastModified,
          size: item.Size
        });
      }
    }

    return response;
  } catch (error) {
    return error;
  }
};
