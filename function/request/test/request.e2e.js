'use strict';
const fs = require('fs');
const assert = require('assert');
const handler = require('../request.js').handler;

it('end to end test', async function () {
  const event = JSON.parse(fs.readFileSync(__dirname + '/event.json', 'utf-8'));
  console.log('event', event);
  const response = await handler(event);
  console.log('response', response);
  assert.strictEqual(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.strictEqual(body.count, 2);
});
