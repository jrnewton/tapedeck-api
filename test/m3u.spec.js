'use strict';

const fs = require('fs');
const test = require('ava');
const m3u = require('./../src/function/m3u');

test('simple parse test', (t) => {
  const fileContents = fs.readFileSync(__dirname + '/test.m3u', 'utf-8');
  const contents = m3u.parse(fileContents);

  t.is(contents.length, 2);
  t.is(contents[0].title, 'test');
  t.is(
    contents[0].uri,
    'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3'
  );
});

test('getFiles test', (t) => {
  const fileContents = fs.readFileSync(__dirname + '/test.m3u', 'utf-8');
  const files = m3u.getFiles(fileContents);

  t.is(files.length, 1);
  t.is(files[0].title, 'test');
  t.is(
    files[0].uri,
    'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3'
  );
});

test('fetch test', async (t) => {
  const url =
    'https://tapedeck-sample-files.s3.us-east-2.amazonaws.com/test.m3u';
  await m3u.forEach(url, (resource) => {
    console.log(resource);
  });

  t.pass();
});
