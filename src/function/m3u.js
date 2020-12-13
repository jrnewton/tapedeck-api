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

function getMusicFiles(fileContents) {
  const playlist = parse(fileContents);
  console.log('playlist contents', playlist);

  const filesToDownload = playlist.filter((line) => line.uri.search(/\.mp3$/g));
  return filesToDownload;
}

module.exports.parse = parse;
module.exports.getMusicFiles = getMusicFiles;
