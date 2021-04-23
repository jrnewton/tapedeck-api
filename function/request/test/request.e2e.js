'use strict';

const assert = require('assert');
const request = require('../request.js');

it('provide a list of resources from an m3u playlist', async () => {
  const event = {
    url:
      'https://tapedeck-sample-files.s3.us-east-2.amazonaws.com/test_medium.m3u',
    desc: 'e2e test',
    sub: 'd6ade639-bada-4ea2-9381-52c9d625cec2'
  };

  console.log('event', event);

  const response = await request.handler(event);

  assert.notStrictEqual(response, null);

  console.log('handler response', response);
});
