'use strict';
const fs = require('fs');
const assert = require('assert');
const request = require('../request.js');

it('end to end test', async () => {
  const event = JSON.parse(fs.readFileSync('event.json', 'utf-8'));
  console.log('event', event);
  const response = await request.handler(event);
  console.log('response', response);
  assert.strictEqual(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.strictEqual(body.count, 2);
});
