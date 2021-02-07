'use strict';

const fs = require('fs');
const assert = require('assert');
const archive = require('../src/archive/archive');

it('should parse a simple m3u playlist without error', () => {
  const fileContents = fs.readFileSync(__dirname + '/test.m3u', 'utf-8');
  const contents = archive.parseM3UFile(fileContents);

  assert.strictEqual(contents.length, 2);
  assert.strictEqual(contents[0].title, 'test');
  assert.strictEqual(
    contents[0].uri,
    'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3'
  );
});

it('should provide a list of files from the m3u playlist', () => {
  const fileContents = fs.readFileSync(__dirname + '/test.m3u', 'utf-8');
  const contents = archive.getMP3URLs(archive.parseM3UFile(fileContents));

  assert.strictEqual(contents.length, 1);
  assert.strictEqual(contents[0].title, 'test');
  assert.strictEqual(
    contents[0].uri,
    'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3'
  );
});
