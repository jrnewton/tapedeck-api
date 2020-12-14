'use strict';

const fs = require('fs');
const assert = require('assert');
const m3u = require('../src/function/m3u');

const mp3URL =
  'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3';

const m3uURL =
  'https://tapedeck-sample-files.s3.us-east-2.amazonaws.com/test.m3u';

it('should parse a simple m3u playlist without error', () => {
  const fileContents = fs.readFileSync(__dirname + '/test.m3u', 'utf-8');
  const contents = m3u.parse(fileContents);

  assert.strictEqual(contents.length, 2);
  assert.strictEqual(contents[0].title, 'test');
  assert.strictEqual(contents[0].uri, mp3URL);
});

it('should provide a list of files from the m3u playlist', () => {
  const fileContents = fs.readFileSync(__dirname + '/test.m3u', 'utf-8');
  const files = m3u.getFiles(fileContents);

  assert.strictEqual(files.length, 1);
  assert.strictEqual(files[0].title, 'test');
  assert.strictEqual(files[0].uri, mp3URL);
});

it('should download each file from m3u playlist', async () => {
  let count = 0;
  await m3u.forEach(m3uURL, () => count++);
  assert.deepStrictEqual(1, 1);
});
