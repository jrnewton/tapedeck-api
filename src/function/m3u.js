'use strict';

const HLS = require('parse-hls').default;

function parse(fileContents) {
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

function getMP3URIs(fileContents) {
  return parse(fileContents).filter((entry) => entry.uri.match(/\.mp3$/g));
}

module.exports.parse = parse;
module.exports.getMP3URIs = getMP3URIs;
