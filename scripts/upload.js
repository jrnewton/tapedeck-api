#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const fs = require('fs');
const Zip = require('adm-zip');
const {
  LambdaClient,
  UpdateFunctionCodeCommand
} = require('@aws-sdk/client-lambda');

const options = yargs
  .version(false)
  .usage('Usage: -f <function name> -s <src directory>')
  .option('f', {
    alias: 'function',
    describe: 'Name of the function to update',
    type: 'string',
    demandOption: true
  })
  .option('s', {
    alias: 'source',
    describe: 'Directory containing function source',
    type: 'string',
    demandOption: true
  }).argv;

const srcDir = options.source;
const fn = options.function;
const zipName = `dist/${fn}.zip`;

fs.rmSync(zipName, { force: true });
const zipFile = new Zip();
zipFile.addLocalFolder(srcDir);
zipFile.writeZip(zipName);

console.log('zip created');

const lambda = new LambdaClient({ region: 'us-east-2' });
const params = {
  FunctionName: fn,
  ZipFile: fs.readFileSync(zipName)
};

(async () => {
  try {
    console.log(`uploading... ${zipName} to ${fn}`);
    const data = await lambda.send(new UpdateFunctionCodeCommand(params));
    console.log('done');
    console.log(data);
  } catch (err) {
    console.log('caught error', err);
  }
})();
