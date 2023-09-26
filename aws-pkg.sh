#!/bin/bash
# Package lambda functions, for upload to AWS.
# I'm naming this 'aws-pkg.sh' to avoid ctrl-p conflicts with package.json

rm -rf ./dist/${FN}/ 
mkdir -p ./dist/${FN}/ 
cp -f ./function/${FN}/package*.json ./dist/${FN}/ 
cp -f ./function/${FN}/${FN}.js ./dist/${FN}/index.js 
pushd ./dist/${FN}/ 
npm install --production 
zip -r function.zip index.js node_modules
popd