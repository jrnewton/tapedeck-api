#!/bin/bash
pushd function/archive2
npm install
popd

pushd function/list-recent
npm install
popd

pushd function/process-ddb-stream
npm install
popd

pushd function/process-s3
npm install
popd

pushd function/request
npm install
popd
