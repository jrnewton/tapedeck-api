'use strict';

const fs = require('fs');
const test = require('ava');
const m3u = require('./../src/function/m3u');

test('simple parse test', (t) => {
  const fileContents = fs.readFileSync(__dirname + '/test.m3u', 'utf-8');
  const contents = m3u.parse(fileContents);
  console.log(contents);

  t.is(contents.length, 1);
  t.is(contents[0].title, 'test');
  t.is(
    contents[0].uri,
    'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3'
  );
});
