'use strict';

const debug = require('debug')('m3u');
const axios = require('axios').default;
const HLS = require('parse-hls').default;

const parse = (manifest) => {
  return HLS.parse(manifest).segments.map((segment) => {
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
};

const getFiles = (manifest, fileExtension = 'mp3') => {
  const regex = new RegExp('\\.' + fileExtension, 'g');
  const files = parse(manifest).filter((entry) => entry.uri.match(regex));
  debug('resources:');
  debug(JSON.stringify(files));
  return files;
};

const forEach = async (url, callback, limit = 1) => {
  try {
    const res = await axios.get(url);
    debug('headers');
    debug(JSON.stringify(res.headers));

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
      const filesToDownload = getFiles(res.data);

      let count = 0;
      for (const resource of filesToDownload) {
        if (limit > 0 && count++ > limit) {
          break;
        }

        callback(resource.uri, resource);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  parse: parse,
  getFiles: getFiles,
  forEach: forEach
};
