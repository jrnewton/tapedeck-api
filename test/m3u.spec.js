'use strict';

const fs = require('fs');
const assert = require('assert');
const m3u = require('./../src/function/m3u');

it('should parse a simple m3u playlist without error', () => {
  const fileContents = fs.readFileSync(__dirname + '/test.m3u', 'utf-8');
  const contents = m3u.parse(fileContents);
  console.log(contents);

  assert.strictEqual(contents.length, 2);
  assert.strictEqual(contents[0].title, 'test');
  assert.strictEqual(
    contents[0].uri,
    'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3'
  );
});

it('should provide a list of files from the m3u playlist', () => {
  const fileContents = fs.readFileSync(__dirname + '/test.m3u', 'utf-8');
  const contents = m3u.getMP3URIs(fileContents);
  console.log(contents);

  assert.strictEqual(contents.length, 1);
  assert.strictEqual(contents[0].title, 'test');
  assert.strictEqual(
    contents[0].uri,
    'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3'
  );
});
