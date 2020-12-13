'use strict';

const fs = require('fs');
const test = require('ava');
const HLS = require('parse-hls').default;

test('m3u parsing', (t) => {
  const file = fs.readFileSync(__dirname + '/test.m3u', 'utf-8');
  const manifest = HLS.parse(file);

  const contents = manifest.segments.map((segment) => {
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

  console.log(contents);

  t.is(contents.length, 1);
  t.is(contents[0].title, 'test');
  t.is(
    contents[0].uri,
    'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3'
  );
});
