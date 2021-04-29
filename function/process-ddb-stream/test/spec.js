'use strict';

const fs = require('fs');
const assert = require('assert');
const process = require('../process-ddb-stream.js');

it('produce SQS events', async () => {
  const record = JSON.parse(fs.readFileSync('record.json', 'utf-8'));
  console.log('record', record);
  const msg = await process.convertInsertRecord(record);
  console.log('SQS message', msg);
  assert.strictEqual(msg.PK, 'user#newtnik@gmail.com');
  const [prefix, track, ulid] = msg.SK.split('#');
  assert.strictEqual(prefix, 'track');
  assert.strictEqual(track, '001');
  //validate format of ULID - Crockford's Base32
  assert.notStrictEqual(
    ulid.match(/[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}/),
    null
  );
  assert.strictEqual(
    msg.URL,
    'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3'
  );
});
