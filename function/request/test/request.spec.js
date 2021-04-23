'use strict';

const fs = require('fs');
const assert = require('assert');
const request = require('../request.js');

it('provide a list of resources from an m3u playlist', () => {
  const fileContents = fs.readFileSync(__dirname + '/test.m3u', 'utf-8');
  const contents = request.buildResourceListFromPlaylist(fileContents);

  console.log(JSON.stringify(contents));

  assert.strictEqual(contents.length, 2);

  const secondTrack = contents[1];
  assert.strictEqual(secondTrack.title, 'track2');

  assert.strictEqual(
    secondTrack.url,
    'https://tapedeck-sample-files.s3.us-east-2.amazonaws.com/test.mp3'
  );
});
